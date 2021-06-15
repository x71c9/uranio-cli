/**
 * Init command module
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const transpose: {
    run: (root: string, options: Partial<Options>) => Promise<void>;
    command: () => Promise<void>;
};
