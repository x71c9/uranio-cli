/**
 * Transpose command module
 *
 * Method `transpose` copies files from the project `src` folder into
 * uranio node_modules folders:
 * - node_modules/uranio
 *
 * Depending from which folder is copying it will do different things.
 *
 * 1) SRC Atom Folder
 * It copies and process/compile all file from src/atoms to:
 * -- node_modules/uranio/src/atoms/server
 * -- node_modules/uranio/src/atoms/client
 *
 * 2) SRC Server Folder
 * It copies and compile all file from src/server to:
 * -- node_modules/uranio/src/aroms/server
 *
 * 2) SRC Admin Folder
 * TODO
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function transpose(params: Partial<Params>, path?: string, event?: string): Promise<void>;
