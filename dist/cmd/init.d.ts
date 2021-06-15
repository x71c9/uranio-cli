/**
 * Init command module
 *
 * @packageDocumentation
 */
import { Arguments, Repo, Options } from '../types';
export declare const init: {
    run: (root: string, repo: Repo, options: Partial<Options>) => Promise<void>;
    command: (args: Arguments) => Promise<void>;
};
