/**
 * Transpose command module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function transpose(params: Partial<Params>, included?: boolean): Promise<void>;
export declare function transpose_one(full_path: string, params: Partial<Params>, included?: boolean): Promise<void>;
