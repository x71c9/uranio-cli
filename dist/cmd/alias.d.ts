/**
 * Alias command module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const alias: {
    run: (options?: Partial<Options> | undefined) => void;
    command: () => void;
    include: () => void;
};
