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
 * - /types/schema.d.ts
 * - /.uranio/generate/types/schema.d.ts
 * - /.uranio/server/types/schema.d.ts
 * - /.uranio/client/types/schema.d.ts
 *
 * If the repository is using uranio-trx or an uranio repo that includes it:
 *
 * b) Generate the types for uranio with the custom Hooks
 * - /types/uranio.d.ts
 * - /.uranio/generate/types/uranio.d.ts
 * - /.uranio/server/types/uranio.d.ts
 * - /.uranio/client/types/uranio.d.ts
 *
 * c) Generate the hooks file:
 * - /.uranio/server/src/__urn_hooks.ts
 * - /.uranio/client/src/__urn_hooks.ts
 *
 * NOTE:
 * In order for the script to run it needs the base schema file:
 * ```
 * /.uranio/generate/src/types/index.d.ts
 * ```
 * that is creted by the `init` command.
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function generate(params: Params, is_included?: boolean): Promise<void>;
export declare function generate_uranio(params: Params): Promise<void>;
