/**
 * Client dev command module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const client_dev: {
    run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
    command: () => Promise<void>;
};
