/**
 * Server commands module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare let done_building_server: boolean;
export declare let building_server: boolean;
export declare const server: {
    dev: {
        run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
        command: () => Promise<void>;
    };
    build: {
        run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
        command: () => Promise<void>;
    };
};
