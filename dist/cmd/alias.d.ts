/**
 * Alias command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { AliasParams, Aliases } from './types';
export declare function alias(params: AliasParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function get_aliases(tsconfig_path: string): Aliases;
export declare function replace_file_aliases(filepath: string, aliases: Aliases): void;
