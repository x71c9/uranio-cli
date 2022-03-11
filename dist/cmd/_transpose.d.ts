/**
 * Transpose command module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function transpose(params: Partial<Params>, included?: boolean): Promise<void>;
export declare function transpose_one(full_path: string, params: Partial<Params>, included?: boolean): Promise<void>;
export declare function transpose_unlink_dir(full_path: string, params: Partial<Params>, included?: boolean): Promise<void>;
export declare function transpose_unlink_file(full_path: string, params: Partial<Params>, included?: boolean): Promise<void>;
/**
 *
 * This function check if the identifiers in the import statements are used in `text`.
 * Return an Array of the import statements required for that `text`.
 *
 * SLOW FUNCTION with tsConfigFilePath options
 */
