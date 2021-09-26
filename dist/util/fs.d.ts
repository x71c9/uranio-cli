/**
 * Util FS
 *
 * @packageDocumentation
 */
export declare function create_file(file_path: string, context?: string): void;
export declare function create_file_sync(file_path: string, context?: string): void;
export declare function create_files(file_paths: string, context?: string): void;
export declare function create_files_sync(file_paths: string, context?: string): void;
export declare function create_directory(dir_path: string, context?: string): void;
export declare function create_directory_sync(dir_path: string, context?: string): void;
export declare function create_directories(dir_paths: string, context?: string): void;
export declare function create_directories_sync(dir_paths: string, context?: string): void;
export declare function copy_files_sync(src: string, dest: string, context?: string): void;
export declare function copy_directory(src: string, dest: string, context?: string): void;
export declare function copy_directory_sync(src: string, dest: string, context?: string): void;
export declare function copy_directories(src: string, dest: string, context?: string): void;
export declare function copy_directories_sync(src: string, dest: string, context?: string): void;
export declare function remove_file(file_path: string, context?: string): void;
export declare function remove_file_sync(file_path: string, context?: string): void;
export declare function remove_files(file_paths: string, context?: string): void;
export declare function remove_files_sync(file_paths: string, context?: string): void;
export declare function remove_directory(dir_path: string, context?: string): void;
export declare function remove_directory_sync(dir_path: string, context?: string): void;
export declare function remove_directories(dir_paths: string, context?: string): void;
export declare function remove_directories_sync(dir_paths: string, context?: string): void;
export declare function remove_folder_if_exists(context: string, folder_path: string): void;
export declare function remove_file_if_exists(context: string, file_path: string): void;
export declare function create_folder_if_doesnt_exists(context: string, folder_path: string): void;
export declare function copy_folder(context: string, source: string, destination: string): void;
export declare function copy_folder_recursive_sync(source: string, target: string): void;
export declare function delete_file_sync(file_path: string): void;
