/**
 * Docker command module
 *
 * @packageDocumentation
 */
import { Params, Arguments, DB } from '../types';
export declare function docker(params: Partial<Params>, args: Arguments): Promise<void>;
export declare function docker_build(params: Partial<Params>): Promise<void>;
export declare function docker_remove_tmp(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function docker_unbuild(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function docker_create(params: Partial<Params>, entrypoint?: string): Promise<void>;
export declare function docker_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function docker_start(params: Partial<Params>): Promise<void>;
export declare function docker_stop(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function docker_db_run(params: Partial<Params>, db: DB): Promise<void>;
export declare function docker_db_create(params: Partial<Params>, db: DB): Promise<void>;
export declare function docker_db_start(params: Partial<Params>, db: DB): Promise<void>;
export declare function docker_db_stop(params: Partial<Params>, db: DB, continue_on_fail?: boolean): Promise<void>;
export declare function docker_db_remove(params: Partial<Params>, db: DB, continue_on_fail?: boolean): Promise<void>;
export declare function docker_run(params: Partial<Params>, entrypoint?: string): Promise<void>;
