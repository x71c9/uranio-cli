## Uranio

How Uranio and Uranio CLI work under the hood.

### Intro

Each Uranio repo export a binary script that points to `./dist/server/generate.js`.

The scripts are used internally by `uranio-cli` and they are:
```
uranio-generate-core
uranio-generate-api
uranio-generate-trx
uranio-generate-adm
```
respectively for the repos: `core`, `api`, `trx`, `adm`.

Each of these scripts extends the previous one.


### What `uranio-generate-${repo}` does


#### Update the schema

All scripts generate the Uranio schema, meaning they update the `uranio-schema`
dependency with **new types**.

`uranio-schema` is the repository that stores all the `Atom`, `AtomShape`,
`AtomName`, `Molecule`, `RouteName`, etc.

Since the user is defining new `Atom`s, these types must be updated.

Running the scripts `uranio-generate-${repo}` will read the new atoms and edit
the file inside `node_modules/uranio-schema/dist/typ/atom.d.ts`.


#### Update the client config toml

All scripts also update the toml module for the client.
They read the `uranio.toml` file and generate a module in `src/client/toml.ts`.

So they update:
- `node_modules/uranio/src/client/toml.ts`

And then compile it into:
- `node_modules/uranio/dist/client/toml.js`


#### Update the hooks

If the repo is `trx` or above the script `uranio-generate-${repo}` will also
generate the hooks inside the `uranio-trx` dependency.

It updates the following files, one for the server and one for the client:
- `node_modules/uranio-trx/src/hooks/hooks.ts`
- `node_modules/uranio-trx/src/hooks/hooks_cln.ts`

It then compiles with `esbuild` the two files into:
- `node_modules/uranio-trx/dist/hooks/hooks.js`
- `node_modules/uranio-trx/dist/hooks/hooks_cln.ts`

It also updates the type file:
- `node_modules/uranio-trx/dist/hooks/types.d.ts`





