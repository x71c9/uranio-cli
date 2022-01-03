/**
 * Docker command module
 *
 * @packageDocumentation
 */
import { Params, Arguments } from '../types';
export declare function docker(params: Partial<Params>, args: Arguments): Promise<void>;
export declare function docker_build(params: Partial<Params>): Promise<void>;
export declare function docker_run(params: Partial<Params>): Promise<void>;
