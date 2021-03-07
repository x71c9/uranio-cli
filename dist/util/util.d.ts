/**
 * Util
 *
 * @packageDocumentation
 */
export declare function prettier(path: string): void;
export declare function remove_folder_if_exists(context: string, folder_path: string): void;
export declare function create_folder_if_doesnt_exists(context: string, folder_path: string): void;
export declare function copy_files(context: string, source: string, destination: string): void;
export declare function copy_file(context: string, source: string, destination: string): void;
export declare function copy_folder(context: string, source: string, destination: string): void;
export declare function sync_exec(command: string): void;
declare type PF = (v?: unknown) => void;
export declare function spawn_cmd(command: string, context: string, action: string, resolve: PF, reject: PF): void;
export declare function install_dep(repo: string, context: string): Promise<any>;
export declare function install_dep_dev(repo: string, context: string): Promise<any>;
export declare function uninstall_dep(repo: string, context: string): Promise<any>;
export declare function clone_repo(context: string, address: string, dest_folder: string): Promise<any>;
export {};
