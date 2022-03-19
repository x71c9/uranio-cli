/**
 * Generate command module
 *
 * Method `generate` first create the register files with the user defined Atoms
 * by reading the src/atoms folder of the project.
 *
 * Then it runs the binary script exported from uranio repo:
 * - uranio-generate-adm
 * - uranio-generate-trx
 * - uranio-generate-api
 * - uranio-generate-core
 *
 * This scripts are defined inside uranio repos: src/server/generate.ts
 *
 * In general what they do is:
 *
 * - Generating the schema in node_modules/uranio-schema
 * - Generating the hooks in node_modules/uranio-trx
 * - Generating the hook types in node_modules/uranio-trx
 * - Generating the client_toml module in node_modules/uranio
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function generate(params: Params, _path?: string, _event?: string): Promise<void>;
