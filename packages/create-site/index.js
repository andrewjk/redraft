#!/usr/bin/env node

// From https://www.petermekhaeil.com/how-to-build-an-npx-starter-template/

const fs = require("fs");
const path = require("path");

// The first argument will be the project name
const projectName = process.argv[2];

// The second argument may be the hosting site, but if not we default to Node
const supportedSites = ["--node", "--cloudflare"];
let hostingSite = process.argv[3];
if (!supportedSites.includes(hostingSite)) {
	hostingSite = "--node";
}

// Create a project directory with the project name
const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
fs.mkdirSync(projectDir, { recursive: true });

// A common approach to building a starter template is to create a `template`
// folder which will house the template and the files we want to create
const templateDir = path.resolve(__dirname, "template");
fs.cpSync(templateDir, projectDir, { recursive: true });

// It is good practice to have dotfiles stored in the template without the dot
// (so they do not get picked up by the starter template repository). We can
// rename the dotfiles after we have copied them over to the new project
// directory
fs.renameSync(path.join(projectDir, "gitignore"), path.join(projectDir, ".gitignore"));
fs.renameSync(path.join(projectDir, "env"), path.join(projectDir, ".env"));

const projectPackageJson = require(path.join(projectDir, "package.json"));

// Update the project's package.json with the new project name
projectPackageJson.name = projectName;

// Remove incompatible scripts and dependencies
fixScriptsAndDependencies(projectPackageJson.scripts, hostingSite);
fixScriptsAndDependencies(projectPackageJson.dependencies, hostingSite);
fixScriptsAndDependencies(projectPackageJson.devDependencies, hostingSite);

fs.writeFileSync(
	path.join(projectDir, "package.json"),
	JSON.stringify(projectPackageJson, null, 2),
);

for (let file of fs.readdirSync(projectDir)) {
	if (file.startsWith("--")) {
		if (file.startsWith(hostingSite)) {
			fs.renameSync(
				path.join(projectDir, file),
				path.join(projectDir, file.substring(hostingSite.length + 1)),
			);
		} else {
			fs.unlinkSync(path.join(projectDir, file));
		}
	}
}

// Run `npm install` in the project directory to install the dependencies. We
// are using a third-party library called `cross-spawn` for cross-platform
// support. (Node has issues spawning child processes in Windows)
// spawn.sync("npm", ["install"], { stdio: "inherit" });

let message = `Created '${projectName}' in '${projectDir}'`;
console.log();
console.log("=".repeat(message.length));
console.log(message);
console.log("=".repeat(message.length));
console.log();
console.log(`Next steps:`);
console.log(`cd ${projectName}`);
console.log(`npm install`);
if (hostingSite !== "--cloudflare") {
	console.log(`npm run dev`);
}

function fixScriptsAndDependencies(obj, hostingSite) {
	for (let key in obj) {
		if (key.startsWith("--")) {
			const value = obj[key];
			delete obj[key];
			if (key.startsWith(hostingSite)) {
				key = key.substring(hostingSite.length + 1);
				obj[key] = value;
			}
		}
	}
}
