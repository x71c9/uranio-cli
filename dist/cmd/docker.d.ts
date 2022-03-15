/**
 * Docker command module
 *
 * @packageDocumentation
 */
import { Params, Arguments } from '../types';
export declare function docker(params: Partial<Params>, args: Arguments): Promise<void>;
export declare function build(params: Partial<Params>): Promise<void>;
export declare function create(params: Partial<Params>, entrypoint?: string): Promise<void>;
export declare function start(params: Partial<Params>): Promise<void>;
export declare function start_server(params: Partial<Params>): Promise<void>;
export declare function start_panel(params: Partial<Params>): Promise<void>;
export declare function stop(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function unbuild(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_create(params: Partial<Params>): Promise<void>;
export declare function db_start(params: Partial<Params>): Promise<void>;
export declare function db_stop(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function tmp_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_create(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function prune(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function update_env(params?: Partial<Params>): void;
