/**
 * Init command module
 *
 * @packageDocumentation
 */
import { Arguments, Params } from '../types';
export declare function init(params: Partial<Params>): Promise<void>;
export declare function prompt_init(params: Params, args: Arguments): Promise<void>;
