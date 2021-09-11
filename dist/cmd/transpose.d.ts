/**
 * Transpose command module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
import { Options } from '../types';
export declare const transpose: {
    run: (root: string, filepath?: string | undefined, options?: Partial<Options> | undefined) => void;
    command: (args?: import("minimist").ParsedArgs | undefined) => void;
};
