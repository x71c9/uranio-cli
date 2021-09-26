/**
 * Util
 *
 * @packageDocumentation
 */
import { Options } from '../types';
export declare function merge_options(options: Partial<Options>): void;
export declare function read_rc_file(): void;
export declare function is_initialized(): boolean;
export declare function auto_set_project_root(): void;
export declare function set_repo(repo: string): void;
export declare function set_pacman(pacman: string): void;
export declare function set_deploy(deploy: string): void;
export declare function check_repo(repo: string): boolean;
export declare function check_pacman(pacman: string): boolean;
export declare function check_deploy(deploy: string): boolean;
export declare function install_dep(repo: string, context: string): Promise<any>;
export declare function install_dep_dev(repo: string, context: string): Promise<any>;
export declare function uninstall_dep(repo: string, context: string): Promise<any>;
export declare function clone_repo(context: string, address: string, dest_folder: string, branch?: string): Promise<any>;
export declare function clone_repo_recursive(context: string, address: string, dest_folder: string, branch?: string): Promise<any>;
export declare function dependency_exists(repo: string): boolean;
