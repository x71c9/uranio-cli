/**
 * Generate command module
 *
 * Method `generate` first create the "register files" with the user defined
 * Atoms by reading what is inside `src/atoms` directory.
 * > See _generate_register function
 *
 * Then it runs the binary script exported according to the repo that is being
 * used, so one of the following:
 * - uranio-generate-adm
 * - uranio-generate-trx
 * - uranio-generate-api
 * - uranio-generate-core
 *
 * This scripts are always defined in `src/server/generate.ts` for each uranio
 * repo.
 *
 * In general what they do is:
 * - Generating the schema in node_modules/uranio-schema
 * - Generating the hooks in node_modules/uranio-trx
 * - Generating the hook types in node_modules/uranio-trx
 * - Generating the client_toml module in node_modules/uranio
 *
 * A copy of uranio-schema generated in node_modules will be copied to
 * .uranio/uranio-schema. This will allow the text editor to read the repo
 * with better support.
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function generate(params: Params, _path?: string, _event?: string): Promise<void>;
