/**
 * Docker command module
 *
 * There might be some confusion since both Uranio and Docker have the
 * same method names.
 *
 * Uranio commands are:
 * - uranio docker start
 * - uranio docker dev
 *
 * These commands can be run with or without the flag --prod
 *
 * Uranio build only one docker image, but creates different containers
 * according with the command and the --prod flag.
 *
 * When running both `uranio docker start` and `uranio docker dev` the
 * following happens:
 *
 * - if the Uranio image does not exist it builds it;
 * - if the Uranio container does not exist it creates it;
 * - it start the container.
 *
 * There are 4 possible containers Uranio creates.
 *
 * For the command `uranio docker start` the container name ends with:
 * - _uranio_con_start
 * - _uranio_con_start_prod
 *
 * For the command `uranio docker dev` the container name ends with:
 * - _uranio_con_dev
 * - _uranio_con_dev_prod
 *
 *
 *
 * @packageDocumentation
 */
import { Params, Arguments } from '../types';
export declare function docker(params: Partial<Params>, args: Arguments): Promise<void>;
export declare function build(params: Partial<Params>): Promise<void>;
export declare function push(params: Partial<Params>): Promise<void>;
export declare function start(params: Partial<Params>): Promise<void>;
export declare function dev(params: Partial<Params>): Promise<void>;
export declare function stop(params: Partial<Params>): Promise<void>;
export declare function remove_start(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function remove_dev(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function unbuild(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_create(params: Partial<Params>): Promise<void>;
export declare function db_start(params: Partial<Params>): Promise<void>;
export declare function db_stop(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function db_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_create(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function network_remove(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function prune(params: Partial<Params>, continue_on_fail?: boolean): Promise<void>;
export declare function is_docker_compiled(params: Partial<Params>): boolean;
export declare function fail_if_compiled(params: Partial<Params>): void;
