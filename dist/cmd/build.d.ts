/**
 * Build command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { BuildParams } from './types';
export declare function build(params: BuildParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function build_server(params: BuildParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function build_client(params: BuildParams, output_params?: Partial<output.OutputParams>): Promise<void>;
