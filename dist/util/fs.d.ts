/**
 * Util FS
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as out from '../output/';
declare class FS {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
    exists_sync(path: string, context?: string): boolean;
    read_file_sync(file_path: string, encoding?: BufferEncoding, context?: string): string;
    read_dir_sync(dir_path: string, context?: string): string[];
    write_file_sync(file_path: string, content: string, encoding?: BufferEncoding, context?: string): void;
    create_file(file_path: string, context?: string): void;
    create_file_sync(file_path: string, context?: string): void;
    create_directory(dir_path: string, context?: string): void;
    create_directory_sync(dir_path: string, context?: string): void;
    copy_file(src: string, dest: string, context?: string): void;
    copy_file_sync(src: string, dest: string, context?: string): void;
    copy_directory(src: string, dest: string, context?: string): void;
    copy_directory_sync(src: string, dest: string, context?: string): void;
    remove_file(file_path: string, context?: string): void;
    remove_file_sync(file_path: string, context?: string): void;
    remove_directory(dir_path: string, context?: string): void;
    remove_directory_sync(dir_path: string, context?: string): void;
}
export declare type FSInstance = InstanceType<typeof FS>;
export declare function create(output: out.OutputInstance): FSInstance;
export {};
