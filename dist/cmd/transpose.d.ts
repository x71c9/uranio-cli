/**
 * Transpose command module
 *
 * Method `transpose` copies files from the project `src` folder into
 * uranio node_modules folders:
 * - node_modules/uranio
 * - node_modules/uranio-trx
 *
 * Depending from which folder is copying it will do different things.
 *
 * 1) SRC Atom Folder
 * It copies and process all file from src/atoms to:
 * -- node_modules/uranio/src/atoms/server
 * -- node_modules/uranio/src/atoms/client
 *
 * 2) SRC Server Folder
 * TODO
 *
 * 2) SRC Admin Folder
 * TODO
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function transpose(params: Partial<Params>, path?: string, event?: string): Promise<void>;
