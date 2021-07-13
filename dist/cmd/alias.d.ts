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
export declare type Aliases = {
    [key: string]: string[];
};
export declare function get_aliases(): Aliases;
export declare function replace_file_aliases(filepath: string, aliases: Aliases): void;
