/**
 * Client dev command module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
import { Options } from '../types';
export declare const client_dev: {
    run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
    command: (args?: import("minimist").ParsedArgs | undefined) => Promise<void>;
};
