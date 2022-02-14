/**
 * Generate types command module
 *
 * This command will create 3 register files that import all the atom
 * definitions in the `/src/atoms` folder.
 * The 3 files are:
 * - `/.uranio/generate/src/register.ts`
 * - `/.uranio/server/src/__urn_register.ts`
 * - `/.uranio/client/src/__urn_register.ts`
 *
 * NOTE:
 * Atoms must be defined with the following structure:
 * `/src/atoms/[atom_name]/index.ts`
 *
 * It will then transpile with `esbuild` the `/.uranio/generate/src/generate.ts`
 * file that is importing the `register.ts` file created.
 *
 * NOTE:
 * The file `/.uranio/generate/src/generate.ts` is created by the `init` command.
 *
 * After the transpilation it will run with Node the transpiled file:
 * ```
 * node /.uranio/generate/dist/generate.js
 * ```
 * This will create the declaration file with the Atom Types.
 *
 * NOTE:
 * In order for the script to run it needs the schema file:
 * ```
 * /.uranio/generate/src/schema/index.d.ts
 * ```
 * that is creted by the `init` command.
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function types(params: Params, is_included?: boolean): Promise<void>;
