/**
 * Dev command module
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { DevParams } from './types';
export declare function dev(params: DevParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function dev_server(params: DevParams, output_params?: Partial<output.OutputParams>): Promise<void>;
export declare function dev_client(params: DevParams, output_params?: Partial<output.OutputParams>): Promise<void>;
