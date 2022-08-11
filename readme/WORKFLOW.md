## Explanation of all the commands in details

### `uranio init`

List of commands:

- create `./.uranio` directory;

- create `./.uranio/.uranio.json` init file with the important parameters
`repo`, `docker`, `pacman` and their values;

- create `./src` directory and its subdirectories if do not exist;

- create `./.tmp` directory;

- clone `uranio-assets` and `uranio-schema` in `./.tmp`;

- copy from cloned `uranio-assets`: `sample.env`, `uranio.toml`, `tsconfig.json`
in `./`;

- copy `uranio-schema` to `.uranio/uranio-schema`. This is needed for text
editors that do not check types inside `node_modules`;

- create `./.env` if not exists;

- add entries to `.gitignore`;

- update `package.json` resolutions;

- initialize pacman: if pacman == `yarn` then run `yarn install`;

- install dev dependencies: if repo == `adm` then install `uranio-adm-dep-dev`;

- updated `package.json` scripts with uranio scripts.

- install selected repo as dependency. if repo == `adm` install `uranio-adm`
with the alias `uranio`: `yarn add uranio@ssh://git@github.com/x71c9/uranio-adm`
(notice the **uranio@** in front of the url) this allow to import the repo as
`uranio` instead of `uranio-adm`.

- remove `./.tmp` directory.


---


### `uranio build`

List of commands:

- **Transpose**:

	- Transpose Atoms:
		- copy files from `./src/atoms` to `./node_modules/uranio/src/server|client/atoms`
		- compile files from `./node_modules/uranio/src/server|client/atoms` to
		`./node_modules/uranio/dist/server|client/atoms`
		
	- Transpose Server:
		- copy files from `./src/server` to `./node_modules/uranio/src/server/delta`
		- compile files from `./node_modules/uranio/src/server/delta` to
		`./node_modules/uranio/dist/server/delta`
		
	- Transpose Admin:
		- _TODO_

- **Generate**

	- Generate Register files:
		- create files `./node_modules/uranio/src/server|client/register.ts` that
		import the atoms defined in `./node_modules/uranio/src/server|client/atoms`;
		- compiles files `./node_modules/uranio/src/server|client/register.ts` to
		`./node_modules/uranio/src/server|client/register.js`;
	
	- RUN `uranio-generate-${repo}` where `repo` is the repo selected during
	`uranio init`; Each uranio repo [`core`, `api`, `trx`, `adm`] export a
	"binary" script for generating files. (Check the `package.json` of each repo
	for more info). The script does:
		- generate _schema_: it updates
		`./node_modules/uranio-schema/dist/typ/atom.d.ts` with the new Atoms defined
		in `./node_modules/uranio/dist/server/atoms/`;
		
		> **The following commands are valid only for `uranio-trx` and `uranio-adm`**
		- generate all the Hooks of the
		new defined Atoms;
		- generate all the Hooks types of the new defined Atoms;
		- generate a copy of `uranio.toml` in Javascript form for the client.
		The file is written in
		`./node_modules/uranio/src/client/toml.ts` and compiled to
		`./node_modules/uranio/dist/client/toml.js`;

> **The following commands are valid only for `uranio-adm`**
- **Build panel**

	- RUN `uranio-panel-${repo} build`. This "binary" script runs: Nuxt build.

- **One file compilation** !!(work in progress)!!

	- Build a bundle file for WebService script;
		- RUN `yarn esbuild __root/dist/service/ws.js`
		- `--bundle`
		- `--platform=node`
		- `--minify`
		- `--outfile=.uranio/bundles/ws.bundle.js`
	
	- Build a bundle file for Panel script; (NOT WORKING AT THE MOMENT)
		- RUN `yarn esbuild __root/dist/panel/index.js`
		- `--bundle`
		- `--platform=node`
		- `--minify`
		- `--outfile=.uranio/bundles/panel.bundle.js`
		

---


### `uranio start`

List of commands:

- **Build server**
	- If the flag `--build` is set it does the same as `uranio build` only
	for the server side.

- **Start server**
	- RUN `uranio-webservice-${repo}`. For `uranio-core` this runs the files
	defined in `./src/server`. For all the other repo it also start a webservice
	in Express.

> **The following commands are valid only for `uranio-adm`**
- **Start panel**
	- RUN `uranio-panel-${repo} start`. This script runs Nuxt build, Nuxt generate
	and start another webservice for the Nuxt app.


---


### `uranio dev`

List of commands:

- **Build server**
	- Same as `uranio build` only for the server side.

- **Typescript compiler watch**
	- It runs `tsc -w` for the server side. It uses `./tsconfig.json`.

- **Watch**
	- It watches the `./src` directory. If a file is changed it then runs
	`transpose` and `generate` for that file only; it then restart the server.
	- it watches the `uranio.toml` file. If it is changed it then runs the
	`generate` method and restart the server.
	
- **Dev server**
	- Use the Forever library for running indefinitely the script
	`./node_modules/urano/dist/service/ws.js` that launch the WebService.

- **Dev panel**
	- RUN `uranio-panel-${repo} dev`. This launch Nuxt in dev mode.



