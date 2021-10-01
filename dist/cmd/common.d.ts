/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function read_rc_file(params: Partial<Params>): Partial<Params>;
export declare function merge_params(params: Partial<Params>): Params;
export declare function check_repo(repo: string): void;
export declare function check_pacman(pacman: string): void;
export declare function check_deploy(deploy: string): void;
