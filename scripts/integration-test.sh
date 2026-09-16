#!/bin/bash
# Integration test for the core social flows, against two real sites:
#
#   1. set up two fresh sites (alice + bob), via the real setup API
#   2. alice follows bob
#   3. bob approves the follow
#   4. bob makes a post
#   5. alice can see it in her feed
#   6. alice comments on it (as a follower, on bob's site)
#
# Everything runs in preview (production) mode -- including first setup,
# on the empty databases: torpor's prerenderer skips pages whose load
# redirects (auth/setup), so a fresh site builds and serves fine.
#
# Run from the repo root with:  pnpm test:integration
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_DIR="$ROOT/packages/site"
DATA="$SITE_DIR/data/integration"

PORT_A=7131 # alice, the follower
PORT_B=7132 # bob, the followee
URL_A="http://localhost:$PORT_A/"   # trailing slash: stored as the site url
URL_B="http://localhost:$PORT_B/"
API_A="http://localhost:$PORT_A/api"
API_B="http://localhost:$PORT_B/api"
PASSWORD="integration-password"
MARKER="Hello from the integration test"

ALICE_TOKEN=""
BOB_TOKEN=""
SLUG=""
STATUS=""
PIDS=()
FAILED=""

cleanup() {
	for pid in "${PIDS[@]:-}"; do
		kill "$pid" >/dev/null 2>&1 || true
	done
	for port in "$PORT_A" "$PORT_B"; do
		lsof -ti ":$port" 2>/dev/null | xargs kill >/dev/null 2>&1 || true
	done
	if [ -n "$FAILED" ]; then
		echo "Logs and databases kept in $DATA"
	else
		rm -rf "$DATA"
	fi
}
trap cleanup EXIT

step() {
	printf "\n==> %s\n" "$1"
}

fail() {
	FAILED=1
	printf "FAILED: %s\n" "$1" >&2
	exit 1
}

# HTTP POST with optional token; prints the body, sets $STATUS
http_post() {
	local url="$1" token="${2:-}" body="$3"
	local out
	if [ -n "$token" ]; then
		out=$(curl -s --max-time 15 -w "\n%{http_code} %{redirect_url}" -X POST \
			-H "Content-Type: application/json" \
			-H "Authorization: Token $token" \
			-d "$body" "$url")
	else
		out=$(curl -s --max-time 15 -w "\n%{http_code} %{redirect_url}" -X POST \
			-H "Content-Type: application/json" \
			-d "$body" "$url")
	fi
	STATUS="${out##*$'\n'}"
	LOCATION="${STATUS#* }"
	STATUS="${STATUS%% *}"
	BODY="${out%$'\n'*}"
}

# HTTP GET with optional token; sets $BODY
http_get() {
	BODY=$(curl -s --max-time 15 -H "Authorization: Token ${2:-}" "$1") || fail "GET failed: $1"
}

# Extract a top-level string field from JSON on stdin
json_field() {
	node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d)['$1']??'')}catch{console.log('')}});"
}

assert_status() {
	if [ -n "${LOCATION:-}" ] && [ "$STATUS" = "303" ]; then
		echo "    (redirected to $LOCATION)"
	fi
	case "$STATUS" in
	"$1"*) ;;
	*) fail "$2 (expected $1xx, got $STATUS $LOCATION)" ;;
	esac
}

# The server is exec'd so that the backgrounded PID *is* the server process,
# and killing it doesn't leave orphans holding the ports
# SITE_LOCATION must be the *production* url -- it gets baked into the user
# record and is used by other sites for callbacks
start_preview() { # start_preview <name> <db> <port>
	(
		cd "$SITE_DIR" &&
			exec env PORT="$3" \
				HOST=localhost \
				SITE_LOCATION="http://localhost:$3/" \
				DB_CONNECTION="file:$DATA/$2.db" \
				JWT_SECRET=integration-jwt-secret \
				JWT_SECRET_2=integration-jwt-secret-2 \
				USERNAME="$1" \
				PASSWORD="$PASSWORD" \
				./node_modules/.bin/tb --preview
	) >"$DATA/$1.log" 2>&1 &
	PIDS+=($!)
	disown
}

# Wait until <url> responds with <expected-status>. Polling an authenticated
# API endpoint for its 401 (not just any response) proves the router is
# fully loaded. (Dev servers used to reload after their first dependency
# optimization, so a valid status had to be seen twice -- torpor now warms
# the SSR entry before binding the listener, so first responses are solid.)
wait_for() { # wait_for <url> <name> <log> <expected-status>
	local code
	for _ in $(seq 1 240); do
		code=$(curl -s -o /dev/null --max-time 5 -w "%{http_code}" "$1") || code=""
		if [ "$code" = "$4" ]; then
			return 0
		fi
		sleep 0.5
	done
	fail "$2 did not start (see $DATA/$3.log)"
}

# Builds and starts a site in production mode, then runs its first-time
# setup through the real API. Building on an empty database works because
# the prerenderer skips auth/setup redirects instead of failing
setup_site() { # setup_site <name> <db> <username> <email> <site-url> <port>
	start_preview "$1" "$2" "$6"
	wait_for "http://localhost:$6/api/feed" "$1" "$1" "401"
	step "Setting up $1 (production mode, port $6)"
	http_post "http://localhost:$6/api/account/setup" "" \
		"{\"username\":\"$3\",\"name\":\"$3\",\"password\":\"$PASSWORD\",\"email\":\"$4\",\"image\":\"\",\"bio\":\"\",\"location\":\"\"}"
	assert_status 2 "$1 setup"
}

# --------------------------------------------------------------------------

rm -rf "$DATA"
mkdir -p "$DATA"

# Kill anything left over from a previous run
for port in "$PORT_A" "$PORT_B"; do
	lsof -ti ":$port" 2>/dev/null | xargs kill >/dev/null 2>&1 || true
done
sleep 1

step "Migrating fresh databases"
for db in alice bob; do
	(cd "$SITE_DIR" && DB_CONNECTION="file:$DATA/$db.db" pnpm exec drizzle-kit migrate) \
		>"$DATA/migrate-$db.log" 2>&1 || fail "migration failed for $db (see $DATA/migrate-$db.log)"
done

step "Setting up alice (builds on an empty database)"
setup_site "alice" "alice" "alice" "alice@test.com" "$URL_A" "$PORT_A"

step "Setting up bob (builds on an empty database)"
setup_site "bob" "bob" "bob" "bob@test.com" "$URL_B" "$PORT_B"

step "Logging in"
http_post "$API_A/account/login" "" \
	"{\"email\":\"alice@test.com\",\"password\":\"$PASSWORD\"}"
assert_status 2 "alice login"
ALICE_TOKEN=$(printf "%s" "$BODY" | json_field token)
[ -n "$ALICE_TOKEN" ] || fail "alice login returned no token"

http_post "$API_B/account/login" "" \
	"{\"email\":\"bob@test.com\",\"password\":\"$PASSWORD\"}"
assert_status 2 "bob login"
BOB_TOKEN=$(printf "%s" "$BODY" | json_field token)
[ -n "$BOB_TOKEN" ] || fail "bob login returned no token"

step "Alice follows Bob"
http_post "$API_A/follow/send" "$ALICE_TOKEN" "{\"url\":\"$URL_B\"}"
assert_status 2 "alice follow request"

step "Bob approves the follow"
http_post "$API_B/follow/approve" "$BOB_TOKEN" "{\"url\":\"$URL_A\"}"
assert_status 2 "bob approve"

# The follow handshake pushes are awaited, but give the cross-site confirm a
# moment to settle before continuing
sleep 2

step "Bob makes a post"
http_post "$API_B/posts/publish" "$BOB_TOKEN" \
	"{\"id\":-1,\"slug\":\"\",\"text\":\"$MARKER\",\"published\":true,\"visibility\":0}"
assert_status 2 "bob publish"

# Delivery to followers is sent off without awaiting, so poll alice's feed

step "Alice sees the post in her feed"
for _ in $(seq 1 30); do
	http_get "$API_A/feed" "$ALICE_TOKEN"
	if printf "%s" "$BODY" | grep -q "$MARKER"; then
		break
	fi
	sleep 0.5
done
printf "%s" "$BODY" | grep -q "$MARKER" || fail "post never appeared in alice's feed"
SLUG=$(printf "%s" "$BODY" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const f=(j.feed||[]).find(f=>typeof f.text==='string'&&f.text.includes('$MARKER'));console.log(f?f.slug:'')});")
[ -n "$SLUG" ] || fail "could not find the post slug in alice's feed"

step "Alice comments on Bob's post (as a follower)"
http_get "$API_A/extension/load" "$ALICE_TOKEN"
FOLLOWER_TOKEN=$(printf "%s" "$BODY" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const f=(j.following||[]).find(f=>f.url==='$URL_B');console.log(f?f.token:'')});")
[ -n "$FOLLOWER_TOKEN" ] || fail "could not get a follower token for bob"

http_post "$API_B/comments/create" "$FOLLOWER_TOKEN" \
	"{\"postSlug\":\"$SLUG\",\"text\":\"Great post! (integration test)\"}"
assert_status 2 "alice's comment on bob's post"
printf "%s" "$BODY" | grep -q "Great post!" || fail "comment response does not contain the comment"

printf "\nAll integration checks passed.\n"
