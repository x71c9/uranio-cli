/**
 * Init command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { InitParams } from './types';
export declare function init(params: InitParams, output_params?: Partial<output.OutputParams>): Promise<void>;
