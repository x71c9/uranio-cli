/**
 * Init command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { Arguments } from '../types';
import { InitParams } from './types';
export declare function init(params: InitParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function prompt_init(args: Arguments, params: InitParams): Promise<void>;
