/**
 * Docker command module
 *
 * @packageDocumentation
 */
import { Params, Arguments } from '../types';
export declare function docker(params: Partial<Params>, args: Arguments): Promise<void>;
export declare function build(params: Partial<Params>): Promise<void>;
export declare function push(params: Partial<Params>): Promise<void>;
export declare function start(params: Partial<Params>): Promise<void>;
export declare function dev(params: Partial<Params>): Promise<void>;
export declare function create_start(params: Partial<Params>): Promise<void>;
export declare function create_dev(params: Partial<Params>): Promise<void>;
export declare function stop_start(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function stop_dev(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function _stop_dev_dev(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function _stop_dev_prod(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function remove_start(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function remove_dev(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function unbuild(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_create(params: Partial<Params>): Promise<void>;
export declare function db_start(params: Partial<Params>): Promise<void>;
export declare function db_stop(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function remove_tmp(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_create(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function prune(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function update_env(params?: Partial<Params>): void;
