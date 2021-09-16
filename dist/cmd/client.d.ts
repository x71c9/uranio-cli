/**
 * Client commands module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
import { Options } from '../types';
export declare let done_building_client: boolean;
export declare let building_client: boolean;
export declare const client: {
    dev: {
        run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
        command: (args?: import("minimist").ParsedArgs | undefined) => Promise<void>;
    };
    build: {
        run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
        command: (args?: import("minimist").ParsedArgs | undefined) => Promise<void>;
    };
};
