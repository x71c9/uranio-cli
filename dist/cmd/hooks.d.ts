/**
 * Hooks command module
 *
 * This command will generate Hooks for Uranio TRX.
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare const hooks: {
    run: (options?: Partial<Options> | undefined) => void;
    include: () => void;
    command: () => void;
};
