/**
 * Transpose command module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function transpose(params: Partial<Params> & {
    file?: string;
}, included?: boolean): Promise<void>;
