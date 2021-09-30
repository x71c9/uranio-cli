/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare function merge_params<A>(params: A): Params & A;
export declare function check_repo(repo: string): void;
export declare function check_pacman(pacman: string): void;
export declare function check_deploy(deploy: string): void;
