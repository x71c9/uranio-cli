/**
 * Build command module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
import { Options } from '../types';
export declare const build: {
    run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
    command: () => Promise<void>;
    server: () => void;
    client: (args?: import("minimist").ParsedArgs | undefined) => void;
};
