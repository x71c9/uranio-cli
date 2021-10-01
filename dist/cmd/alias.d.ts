/**
 * Alias command module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
import { Aliases } from './types';
export declare function alias(params: Partial<Params>, included?: boolean): Promise<void>;
export declare function get_aliases(tsconfig_path: string, params?: Partial<Params>): Aliases;
export declare function replace_file_aliases(filepath: string, aliases: Aliases, params?: Partial<Params>): void;
