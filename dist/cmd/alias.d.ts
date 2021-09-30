/**
 * Alias command module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
import { Aliases } from './types';
export declare function alias(params: Partial<Params>): Promise<void>;
export declare function get_aliases(tsconfig_path: string): Aliases;
export declare function replace_file_aliases(filepath: string, aliases: Aliases): void;
