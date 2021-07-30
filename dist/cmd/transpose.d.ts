/**
 * Transpose command module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
import { Options } from '../types';
export declare const transpose: {
    run: (root: string, file?: string | undefined, options?: Partial<Options> | undefined) => Promise<void>;
    command: (args?: import("minimist").ParsedArgs | undefined) => Promise<void>;
};
