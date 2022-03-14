/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function read_init_file(params: Params): Params;
export declare function read_init_file(params: Partial<Params>): Partial<Params>;
export declare function merge_params(params: Partial<Params>): Params;
export declare function merge_init_params(params: Partial<Params>): Params;
export declare function check_repo(repo: string): void;
export declare function check_pacman(pacman: string): void;
export declare function check_deploy(deploy: string): void;
export declare function check_db(db: string): void;
export declare function check_if_is_dot(path: string): boolean;
export declare const package_scripts: {
    build: string;
    'build:server': string;
    'build:panel': string;
    dev: string;
    'dev:server': string;
    'dev:panel': string;
};
export declare const adm_package_scripts: {
    postinstall: string;
};
