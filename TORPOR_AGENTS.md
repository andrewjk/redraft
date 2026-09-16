# Torpor (packages/view)

This is the authoritative reference for writing `.torp` components and using the
`@torpor/view` runtime. It covers everything the README docs gloss over:
runtime functions, template directives, bindings, events, slots, context, and
the reactivity model.

All examples are testable patterns from `packages/view/test/` and the demo app
(`examples/demo`).

---

## Component structure

A component is a file ending in `.torp`. It exports a single function with an
`@render` block that returns void:

```torp
export default function Hello($props: { name: string }) {
	@render {
		<h1>Hello {$props.name}</h1>
	}
}
```

Components can be nested in the same file (non-default functions) or imported
from other `.torp` files. Capitalized tags are treated as components:
`<UserProfile name="x" />`.

Block types inside a component:

| Block             | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `@render { ... }` | The template. Required.                                                                   |
| `@style { ... }`  | Scoped CSS. Rules are hashed (`torp-<hash>`) and only apply to this component's elements. |
| `@head { ... }`   | `<title>`/`<meta>` etc. mounted into `document.head` (one per component).                 |

---

## Reactivity model

State is proxied via `$watch`. Reads inside effects subscribe; writes notify
and re-run subscribed effects. Updates batch automatically.

### `$watch(object, options?)`

Creates a reactive proxy. Deep-wraps nested objects/arrays on access, and
wraps plain objects/arrays/Dates/Maps/Sets **assigned** to watched state
automatically, so `$state.date = new Date(...)` needs no explicit `$watch`
(unless `options.shallow === true`, whose children stay unwrapped). Returns
the same object if already proxied.

```torp
let $state = $watch({ count: 0, name: "John" });
$state.count++;                    // notifies subscribers
```

- Arrays are proxied too: `$watch([1,2,3])`; mutations via `push`/`splice`/
  `length` etc. notify.
- Getters on the object become **computed properties** — they re-evaluate only
  when a dependency changes:
  ```torp
  let $state = $watch({
  	count: 10,
  	get doubleCount() {
  		return this.count * 2;
  	}
  });
  ```
- `{ shallow: true }` skips deep-wrapping (used internally for list rows).
- Symbol keys and `Object.keys/values/entries` work through the proxy.

### `$run(fn, name?)`

Runs `fn` immediately and re-runs it whenever any reactive value it read
changes. May return a cleanup function, which runs before each re-run and on
region clear.

```torp
$run(() => {
	$state.pageTitle = document.title;
});
```

`$run` is what `@if`/`@for`/attribute updates compile down to internally.

### `$onmount(fn)`

Runs `fn` once, after the component is mounted to the DOM. May return a
cleanup function (runs on unmount/region clear). Multiple `$onmount`s run in
order.

The callback is **not reactive**: it never re-runs, and reactive values it
reads are not tracked. To set up something that should keep updating, put a
`$run` inside it:

```torp
$onmount(() => {
	inputElement.value = "hi";
	return () => unlisten();
});

// Reactive setup that needs the DOM to exist first:
$onmount(() => {
	$run(() => {
		label.textContent = $state.count > 0 ? "+" : "";
	});
});
```

The element-level equivalent is the `onmount` attribute, which fires once
when that element is mounted and receives the element:
`<input onmount={(el) => el.focus()} />`.

### `$stream(source, handler, options?)` — external event streams

Subscribes to an external source of events — server-sent events, WebSockets,
DOM events, or any custom source — and calls `handler` for each event.
Events are written into reactive state, which keeps templates/computeds/
effects updating through the normal reactivity model:

```torp
let $state = $watch({ messages: [] as string[] });

$stream(fromServer(`/sse/${$props.id}`), (e) => {
	$state.messages.push(e.data);
});
```

The subscription is managed by the framework:

- Starts when the component mounts (so `&ref`-bound elements exist), and is
  unsubscribed on unmount/region clear.
- Reactive state read **inside** the source is tracked: when it changes, the
  source is unsubscribed and re-subscribed with fresh values (e.g.
  re-opening the connection when a user id changes). Capture tracked reads
  in locals, so the source's cleanup tears down the subscription it
  actually created.
- The source is **never invoked during a server render**, so browser-only
  APIs are safe to reference.
- Errors are values like any other: push an error-shaped value and let the
  source own its reconnection (`EventSource` reconnects automatically).

`{ debounce }` delays each handler call until the source has been quiet for
that many milliseconds, resetting on every event (only the last event of a
burst is handled). A pending debounced call is dropped on re-subscribe.

Built-in sources: `fromServer(url)`, `fromWebSocket(url)` (URL may be a
string or a getter for tracked reconnection), and
`fromElement(elOrGetter, type)` for DOM events. A custom source is just a
function that takes a `push` callback and returns an unsubscribe function
(the `StreamSource<T>` type):

```torp
$stream(fromElement(() => saveButton, "click"), () => save());

// Custom source: subscribe and return the unsubscribe function
$stream((push) => {
	const ws = new WebSocket(url);
	ws.onmessage = (e) => push(e);
	return () => ws.close();
}, (msg) => $state.inbox.push(msg));
```

Timing options belong on `$stream`; anything stateful (windowing,
aggregation, combining multiple streams) is plain closure logic in the
handler. Per-event handling works by writing to state and reacting in
`$run`/templates — see `$run(fn, ...)` above.

### `$peek(fn)`

Reads reactive values inside `fn` **without** creating subscriptions. Changes
to peeked values will not re-run the surrounding effect.

```torp
let b = $peek(() => $state.b);   // no dependency on $state.b
```

### `$batch(fn)`

Groups multiple writes so effects run once after all of them, instead of once
per write:

```torp
$batch(() => {
	$state.a = 10;
	$state.b = 20;
	$state.c = 30;   // effects run once, after the batch
});
```

### `$cache(fn)`

Memoizes a computed inside a getter. Only valid inside a getter (the compiler
routes it). Recomputes when dependencies change; lazy (not computed until read).

```torp
let $state = $watch({
	value: 3,
	get squared() {
		return $cache(() => $state.value * $state.value);
	},
});
```

`$cache` supports chains (a cached getter depending on another cached getter).

### `$async(fn)` — async getter

Caches a promise-returning getter. The peer of `$cache` for async values: only
valid inside a getter, lazy, and re-fetched when dependencies change. While the
promise is pending, reads of the getter suspend — pair with `@await` for the
`with`-branch fallback:

```torp
let $state = $watch({
	get user() {
		return $async(() => fetchUser($props.id));
	},
});
```

A getter whose result is a Promise must use `$async`, not `$cache` (`$cache`
throws if it returns a Promise).

#### Re-fetch and promise identity

The thunk's return value is the unit of suspension — there is no per-source
key or promise cache inside `$async`.

- The thunk re-runs only when a signal it reads changes, or on `$refresh`. A
  re-read with no dependency change returns the cached value — no
  revalidate-on-mount, no TTL.
- A re-run keeps readers on the last resolved value (stale-while-revalidate)
  until the new promise settles. A first load (never resolved) reads
  `undefined` and shows the `with` branch; after a rejection, a retry reads
  as a first load.
- A fresh promise per run means a fetch per run — that's the point. To share
  or coalesce fetches, return a memoized promise from the thunk:

  ```js
  const cache = new Map();
  function getUser(id) {
  	if (!cache.has(id)) cache.set(id, fetchUser(id));
  	return cache.get(id);
  }
  ```

- An older fetch that settles after a newer run started is discarded,
  including its error.

#### Server rendering (`source: "server"`)

By default `$async` runs on the client: SSR renders the `@await` `with`
branch and the fetch starts after hydration. With `source: "server"`, the
server runs the getter during render and ships the resolved value with the
page:

```torp
get user() {
	return $async(() => fetchUser($props.id), { source: "server" });
}
```

- The boundary's content ships resolved when every server read settles
  within the timeout (`timeout: 5000` default, per getter) — the client
  adopts the HTML directly, with no fallback flash. The thunk still runs
  once on the client in the background so dependency changes re-fetch; that
  first in-flight result is discarded, and the server's value wins.
- On a timeout — or any instability (a client-fetch getter read inside the
  boundary, a rejection, a render pass that doesn't replay the collect
  pass) — the boundary ships its `with` branch and the client fetches, the
  same as the default.
- Values must be JSON-safe. Server reads re-run per read (like `$cache` on
  the server), so coalesce shared fetches with a memoized promise in the
  thunk.
- Fetches parallelize within a boundary's render and down nested children;
  rejections surface on the client through `@try`/`@catch`.

See `packages/view/ASYNC.md` for the full design and trade-offs.

### `$pending(fn)` — is it loading?

Reactive query for inline "loading…" indicators. Returns `true` while any
`$async` getter read inside `fn` is pending in a **loud** way — a first load,
a dependency-change refresh, or a `$refresh` (loud by default). A _silent_
`$refresh(fn, { silent: true })` (background revalidation) stays quiet:

```torp
<button disabled={$pending(() => $state.user)}>Save</button>
@if ($pending(() => $state.data)) { <Spinner small /> }
```

### `$refresh(fn)` — re-fetch without a dependency change

Re-runs the `$async` getters read inside `fn`, starting a fresh fetch with no
tracked dependency change. `$cache` getters are ignored. Use for pull-to-
refresh, refresh buttons, refetch-on-focus, polling, and retry-after-error:

```torp
function refresh() {
	$refresh(() => $state.user);
}
```

A `$refresh` is **loud by default**: `$pending` reads `true` and inline
"updating…" indicators flip on while the re-fetch is in flight, while readers
keep displaying the previously resolved value (no flicker); an `@await`
boundary keeps its content mounted instead of flashing the `with` branch. On
resolve, subscribers update through the normal reactive graph.

**Show a spinner during a refresh** — no option needed; just read `$pending`:

```torp
function pullToRefresh() {
	$refresh(() => $state.data);
}

@render {
	@await {
		@if ($pending(() => $state.data)) { <Spinner /> }  	// shows on refresh
		<ul>{items}</ul>
	} with {
		<Skeleton />                                        // first load only
	}
	<div onpointerdown={pullToRefresh} />
}
```

**`{ silent: true }` re-fetches quietly** (stale-while-revalidate): `$pending`
stays `false` and nothing re-runs until the new promise resolves. For
background revalidation where feedback would be noise — polling,
refetch-on-focus:

```torp
$run(() => {
	const id = setInterval(() => $refresh(() => $state.data, { silent: true }), 30_000);
	return () => clearInterval(id);
});
```

A refresh is loud regardless of `silent` when the computed has never resolved
(e.g. retrying a fetch that failed on first load).

`$pending`/`$refresh` are usable directly in markup — the compiler detects
`$`-primitives in template expressions and injects the imports.

### `$bind(state, props, ...keys)`

Two-way sync between matching keys on `state` and `props`:

- **Forward** (`props → state`): when the parent pushes `$props[key]`, it flows
  into `$state[key]`. Skips `undefined` so `$watch` defaults survive.
- **Backward** (`state → props`): when the component mutates `$state[key]`, it
  writes back to `$props[key]`, which the call site's `&key={...}` picks up.

Same-value writes are no-ops, so sync stabilizes without loops.

```torp
$bind($state, $props, "name", "age");
```

### `$unwrap(proxy)`

Returns the raw target object behind a proxy (or the value itself if not a
proxy). Useful when passing a proxied object to code that must not be proxied.

### Dates, Maps and Sets

`$watch` supports `Date`, `Map` and `Set` values directly -- no wrapper
classes needed. Their methods are reactive: reads track signals and writes
notify, so effects re-run when they change. Assigning a plain value to
watched state wraps it automatically, so there's usually no need to call
`$watch(new Date(...))` yourself.

```torp
let $state = $watch({ date: new Date(2024, 0, 15) });

$run(() => {
	console.log($state.date.getFullYear());
});

$state.date.setFullYear(2025); // re-runs the effect above
```

Details:

- **Dates** use a single signal: `get*`/`to*`/`valueOf` reads track it, and
  `set*` writes (that actually change the time) notify. Comparisons,
  template literals and `JSON.stringify` work too (they read the date's
  prototype methods through the proxy).
- **Maps** track `get`/`has` per key, so reading one key doesn't re-run
  effects when an unrelated key changes. `size`, iteration and `forEach`
  subscribe to the collection as a whole, and `clear` re-runs all readers.
  Same-value `set` calls are no-ops.
- **Sets** work the same, keyed by element (`has`/`add`/`delete`).
- Objects stored in a Map/Set are wrapped on read, so their properties are
  reactive like any other nested object.

```torp
let $state = $watch({ selected: new Set<string>() });
$state.selected.add("a"); // effects reading `selected.has("a")` re-run
```

---

## Template directives

### Text interpolation

`{expr}` renders a value as text; `undefined`/`null` render as empty string.

```torp
<p>The count is {$state.count}.</p>
```

### `@if` / `@else if` / `@else`

```torp
@if ($state.light === "red") {
	<span>STOP</span>
} else if ($state.light === "orange") {
	<span>SLOW DOWN</span>
} else {
	<span>GO</span>
}
```

Only the matching branch is mounted; switching clears the old branch's region
(and runs its effect cleanups) and mounts the new one. `onmount` in a cleared
branch runs again when it re-appears.

### `@for ... @key`

Keyed list rendering. The `@key` value decides item identity for diffing.

```torp
<ul>
	@for (let color of colors) {
		@key = color
		<li>{color}</li>
	}
</ul>
```

- Iterating a reactive array subscribes to its `length` and element keys; list
  mutations (push/splice/sort/reverse/swap...) reconcile in place.
- Nested `@for` works; `@for` inside `@if` works; a component or `@if` can
  follow a `@for`.
- Loop variables are the items themselves (use `@key = row.id` when items are
  objects).

### `@switch` / `@case` / `@default`

```torp
@switch ($props.value) {
	case 1: {
		<p>A small value.</p>
	}
	case 100: {
		<p>A large value.</p>
	}
	default: {
		<p>Another value.</p>
	}
}
```

String case values and missing-default are supported.

### `@await` / `with` — async boundary

Renders content that reads `$async` getters, showing the `with` branch while
any read is still pending. The content block commits only once nothing inside
suspends; an `@await` boundary tracks every `$async` read in its subtree (its
own block only, not the whole component):

```torp
@await {
	<p>Is it a number? {$state.guesser}</p>
} with {
	<p>Hmm...</p>
}
```

- Without a `with` branch, nothing renders while suspended.
- Sibling `@await` boundaries are independent — each gets its own `with`
  branch and resolves on its own.
- Once content has rendered, a later suspend during a refresh **keeps the
  stale content** mounted (stale-while-revalidate) instead of flashing the
  `with` branch.
- Async rejections surface as errors — catch them with `@try`/`@catch` (or the
  top-level `@error`).
- On the server, boundaries whose getters use `source: "server"` ship their
  resolved content (see `$async` → "Server rendering"); the rest ship their
  `with` branch.

### `@try` / `catch` — error boundary

Catches **sync render errors** thrown while rendering the `@try` subtree:
component render errors, getter / computed errors, `@const` / `@if` condition
throws, async rejections surfaced through `$async` reads, and errors that
bubble up from child components. The `catch` branch renders in place of the
failed content:

```torp
@try {
	@await {
		<p>Hello, {user.name}!</p>
	} with {
		<p>Loading…</p>
	}
} catch (err) {
	<p class="error">Couldn't load user: {err.message}</p>
}
```

- A `@try` without a `catch` renders its content and lets errors bubble up to
  the nearest boundary.
- If a tracked dependency is read _directly_ by the `@try` control (e.g. via a
  `@const`), flipping it re-runs the try branch: if it now succeeds the
  content renders again, otherwise the catch re-renders.

### `@error` — component-level error block

A top-level block, sibling of `@render`, that catches render-time errors for
the whole component — the component-level equivalent of wrapping `@render`'s
content in `@try { … } catch (err) { … }`:

```torp
function Profile($props) {
	@render {
		<ProfileHeader user={$props.user} />
		<ProfileBody user={$props.user} />
	}

	@error (err) {
		<ErrorView error={err} />
	}
}
```

- Catches errors thrown while rendering the `@render` output (sync throws,
  errors bubbling up from child components). It does **not** catch errors from
  the component's setup phase (the code before `@render`).
- The error variable (`err` above) is bound to the caught error.
- Without `@error`, render errors propagate up to the nearest `@try`/`@error`
  in an ancestor, and out of the app if none exists.

---

## Attributes & bindings

### Plain attributes

Static strings pass through; dynamic values are `{expr}`:

```torp
<div id={$props.id} data-value={$props.dataValue}>Content</div>
```

- Boolean attrs: `disabled={bool}`, `checked={bool}`, `readonly={bool}` — the
  attribute is set/removed based on truthiness.
- `data-*`/`aria-*` and any dashed attribute go through `setAttribute`.
- `class` supports a **string**, an **array**, or an **object** (keys are class
  names, values toggle membership):
  ```torp
  <li class={{ completed: t.completed, editing: editing === t.id }}>...</li>
  <p class={["a", { b: cond }]}>...</p>
  ```
- `style` supports a string or an **object** (camelCase keys become
  kebab-case; CSS custom properties `--x` pass through):
  ```torp
  <div style={{ "--my-color": $props.color, fontSize: "20px" }}>...</div>
  ```

### Event handlers

`on<event>` attributes. Events in the delegated set (click, input, keydown,
change, mousedown/move, pointer*, touch*, focusin/out, submit, wheel, etc.)
use one document-level listener per type; anything else falls back to a direct
`addEventListener`. Handlers receive the native event as the first argument;
`this` is the element.

```torp
<button onclick={increment}>+1</button>
<button onclick={(e) => increment(e, 5)}>+5</button>
<input onkeydown={handleKeyDown} />
```

`e.currentTarget` is correctly re-synthesized to the handler element even for
delegated events (including when the click lands on a child).

### Bindings (`&` prefix)

Two-way bindings use a leading `&`:

| Syntax                          | Purpose                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `&value={$state.name}`          | Two-way value binding on `input`/`select`/`textarea` (number inputs coerce; text inputs map to string).            |
| `&checked={$state.isAvailable}` | Two-way checkbox checked state.                                                                                    |
| `&group={$state.picked}`        | Radio group: selecting a radio writes its `value` into `$state.picked`.                                            |
| `&ref={var}`                    | DOM reference: assigns the element node to `var` on mount (usable in `$onmount`, `@render` after mount, handlers). |
| `&name={$state.value}`          | Two-way component prop binding — the attribute name is the prop to bind (see `$bind` above).                       |

```torp
<input &value={$state.text} />
<input type="checkbox" &checked={$state.isAvailable} />
<input type="radio" value="blue" &group={$state.picked} />
<select &value={$state.selected}>...</select>
<input &ref={inputElement} />
<BindText &name={$state.name} />
```

### `onmount`

Per-element mount hook; receives the element. Can return a cleanup:

```torp
<input onmount={(node) => (node.value = "hi")} />
```

### `transition` / `transition-in` / `transition-out`

Web Animation API transitions on element enter/leave (paired with `@if`).
The value is a function of the element returning `{ keyframes, options }`, or
raw keyframes; see `@torpor/ui/motion` (`fade`, `grow`, `slide`, `measure`):

```torp
<div transition={[{ color: "pink" }, { color: "red" }]}>Hello</div>
<div transition={fade, { duration: 2000 }}>Hello 2</div>
```

---

## Components

### `$props`

First param of the component function. Reactive reads of `$props.x` in the
render block/effects re-render when the parent re-renders that prop.

```torp
function UserProfile($props: { name: string; age: number }) {
	@render {
		<p>My name is {$props.name}!</p>
	}
}
```

Booleans pass through as `isAvailable` (no `={true}` needed). Arrays/objects
pass as `{...}`. Parent can emit via `on<Name>` props:

```torp
<AnswerButton onYes={onAnswerYes} onNo={onAnswerNo} />

function AnswerButton() {
	@render {
		<button onclick={$props.onYes}>YES</button>
	}
}
```

### `$context`

Per-component-invocation context store. Assign a value in a parent; read it in
any descendant. Reads in effects are reactive. Use any string/symbol key:

```torp
function Parent() {
	$context.user = $user;
	@render { <UserProfileContext /> }
}

function UserProfileContext() {
	$context.user = $watch($context.user);
	@render {
		<p>Username: {$context.user.username}</p>
	}
}
```

Note: `$context["key"]` and `$context.key` are equivalent.

### Slots

`<slot />` renders the child content passed to the component. Fallback content
inside `<slot>` shows when no children are provided:

```torp
<FunnyButton>Click me!</FunnyButton>
<FunnyButton />   <!-- renders fallback -->

function FunnyButton() {
	@render {
		<button>
			<slot>
				<span>No content found</span>
			</slot>
		</button>
	}
}
```

**Named slots** with `<fill name>` / `<slot name>`:

```torp
<Article>
	<fill name="header">The article's header</fill>
	<p>The article's body</p>
</Article>

function Article() {
	@render {
		<section>
			<h2><slot name="header" /></h2>
			<slot />
		</section>
	}
}
```

**Let-slots** (pass data from child back into the slot render) with
`<slot item={item} />` and `$slot`:

```torp
<List items={$props.items}>
	{$slot.item.text}
</List>

function List() {
	@render {
		<ul>
			@for (let item of $props.items) {
				<li><slot item={item} /></li>
			}
		</ul>
	}
}
```

### `self` recursion

A component can render itself; `@if` guards termination:

```torp
function Self($props: { level: number }) {
	@render {
		<p>Level {$props.level}</p>
		@if ($props.level < 3) {
			<Self level={$props.level + 1} />
		}
	}
}
```

### Special elements

| Tag                        | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `<@element self={expr}>`   | Renders `expr` as the tag name; children/slots preserved. Reacts to tag changes.  |
| `<@component self={expr}>` | Renders `expr` (a component function) as the component; children become its slot. |

```torp
<@element self={$props.tag}>Hello!</@element>
<@component self={components[$props.self]}>Hello!</@component>
```

---

## Mounting & layout

### `mount(parent, Component, props?, slots?)`

Creates the root region and renders the component into `parent` (must be empty
— throws if it has child elements). `main.js` entry:

```js
import { mount } from "@torpor/view";
import App from "./Main.torp";
mount(document.getElementById("main"), App);
```

### `hydrate(parent, Component, props?, slots?)`

Attaches to server-rendered DOM in place (no re-render of existing nodes).

### `unmount(parent)`

Clears the root region and removes children.

### `fillLayoutSlot(component, slot, parent, anchor, props, context)` / `clearLayoutSlot(region)`

Used by the layout engine to render a page into a persistent layout slot and to
clear/refill it on navigation. The layout's own children are preserved across
refills.

---

## Special notes

- **Comments**: HTML `<!-- -->`, JS `//` and `/* */` comments are supported in
  templates. `@//` and `@/* */` are comment markers.
- **Void elements**: `<br/>`, `<hr/>`, `<img/>`, `<input/>` etc. render
  correctly; closing them explicitly is an error.
- **SVG**: SVG content (with `xmlns`/`viewBox`) renders in the SVG namespace;
  `@if` branches inside `<svg>` work.
- **Nesting/ordering**: `@if` followed by sibling content, `@for` followed by
  `@if`, nested `@if`/`@for`/`@switch`, multiple components in one `@render`,
  and trailing conditionals after an element are all supported (region-based
  rendering keeps fragments correct).
