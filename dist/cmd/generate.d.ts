/**
 * Generate command module
 *
 * NOTE:
 * Atoms must be defined with the following structure:
 * `/src/atoms/[atom_name]/index.ts`
 *
 * This command do the following:
 *
 * 1) Generate a register.ts file for generate.ts script
 * - `/.uranio/generate/src/register.ts`
 *
 * 2) Copy the register.ts file also to server and client folder
 * - `/.uranio/server/src/__urn_register.ts`
 * - `/.uranio/client/src/__urn_register.ts`
 *
 * 3) Compile with `esbuild` the `/.uranio/generate/src/generate.ts`
 * file that is importing the `register.ts` file created.
 *
 * NOTE:
 * The file `/.uranio/generate/src/generate.ts` is created by the `init` command.
 *
 * 4) Run with Node the transpiled file:
 * ```
 * node /.uranio/generate/dist/generate.js
 * ```
 * Running the script will do:
 *
 * a) Generate the schema types with all the AtomName, AtomShape, Molecule, etc.
 * - /.uranio/generate/schema.d.ts
 *
 * If the repository is using uranio-trx or an uranio repo that includes it:
 *
 * b) Generate the types for uranio with the custom Hooks
 * - /.uranio/geneate/uranio-trx.d.ts
 *
 * c) Generate the hooks file:
 * - /.uranio/generate/__urn_hooks.ts
 *
 * NOTE:
 * In order for the script to run it needs the base schema files:
 * ```
 * /.uranio/generate/types/schema.d.ts
 * /.uranio/generate/types/uranio-trx.d.ts (if uranio-trx or above)
 * ```
 * that are creted by the `init` command.
 *
 * 5) Copy the genrated files in the correct folders:
 * - /.uranio/generate/schema.d.ts -> /.uranio/server/types/, /.uranio/client/types/, /.uranio/generate/types/
 * - /.uranio/generate/uranio-trx.d.ts -> /.uranio/server/types/, /.uranio/client/types/
 * - /.uranio/generate/hooks.ts -> /.uranio/server/src/__urn_hooks.ts, /.uranio/client/src/__urn_hooks.ts
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function generate(params: Params, is_included?: boolean): Promise<void>;
export declare function generate_uranio(params: Params): Promise<void>;
