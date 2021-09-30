/**
 * Init command module
 *
 * @packageDocumentation
 */
import { Arguments, Params } from '../types';
import { InitParams } from './types';
export declare function init(params: Partial<Params>): Promise<void>;
export declare function prompt_init(args: Arguments, params: InitParams): Promise<void>;
