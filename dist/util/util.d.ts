/**
 * Util
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as cp from 'child_process';
import chokidar from 'chokidar';
import { Options } from '../types';
declare type WatchProcessObject = {
    child: chokidar.FSWatcher;
    text: string;
    context: string;
};
export declare const child_list: cp.ChildProcessWithoutNullStreams[];
export declare const watch_child_list: WatchProcessObject[];
declare type WatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export declare function watch(watch_path: string, watch_text: string, on_ready: () => void, on_all: (_event: WatchEvent, _path: string) => void): void;
export declare function merge_options(options: Partial<Options>): void;
export declare function read_rc_file(): void;
export declare function is_initialized(): boolean;
export declare function check_folder(folder_path: string): boolean;
export declare function auto_set_project_root(): void;
export declare function set_repo(repo: string): void;
export declare function set_pacman(pacman: string): void;
export declare function set_deploy(deploy: string): void;
export declare function check_repo(repo: string): boolean;
export declare function check_pacman(pacman: string): boolean;
export declare function check_deploy(deploy: string): boolean;
export declare function pretty(filepath: string, parser?: string): void;
export declare function remove_folder_if_exists(context: string, folder_path: string): void;
export declare function remove_file_if_exists(context: string, file_path: string): void;
export declare function create_folder_if_doesnt_exists(context: string, folder_path: string): void;
export declare function copy_files(context: string, source: string, destination: string): void;
export declare function copy_file(context: string, source: string, destination: string): void;
export declare function copy_folder(context: string, source: string, destination: string): void;
export declare function relative_to_absolute_path(path: string): string;
export declare function sync_exec(command: string): void;
declare type PF = (v?: unknown) => void;
export declare function spawn_cmd(command: string, context: string, action: string, resolve: PF, reject: PF): void;
export declare function install_dep(repo: string, context: string): Promise<any>;
export declare function install_dep_dev(repo: string, context: string): Promise<any>;
export declare function uninstall_dep(repo: string, context: string): Promise<any>;
export declare function clone_repo(context: string, address: string, dest_folder: string, branch?: string): Promise<any>;
export declare function clone_repo_recursive(context: string, address: string, dest_folder: string, branch?: string): Promise<any>;
export declare function dependency_exists(repo: string): boolean;
export declare function copy_file_sync(source: string, target: string): void;
export declare function copy_folder_recursive_sync(source: string, target: string): void;
export declare function delete_file_sync(file_path: string): void;
export declare function spawn_log_command(command: string, context: string, color: string): cp.ChildProcessWithoutNullStreams;
export declare function spawn_verbose_log_command(command: string, context: string, color: string): cp.ChildProcessWithoutNullStreams;
export {};
