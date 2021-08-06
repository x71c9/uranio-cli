/**
 * Generate command module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const generate: {
    run: (root: string, options?: Partial<Options> | undefined) => Promise<void>;
    command: () => Promise<void>;
};
