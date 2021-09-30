/**
 * Hooks command module
 *
 * This command will generate Hooks for Uranio TRX.
 *
 * @packageDocumentation
 */
import * as output from '../output/';
import { HooksParams } from './types';
export declare function hooks(params: HooksParams, output_params?: Partial<output.OutputParams>): Promise<void>;
