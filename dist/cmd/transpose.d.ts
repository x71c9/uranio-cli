/**
 * Transpose command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { TransposeParams } from './types';
export declare function transpose(params: TransposeParams, output_params?: Partial<output.OutputParams>): Promise<void>;
