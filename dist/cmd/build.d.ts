/**
 * Build command module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const build: {
    run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
    command: () => Promise<void>;
};
