/**
 * Util FS
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as out from '../output/index';
declare class FS {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
    is_directory(path: string): boolean;
    exists(path: string): boolean;
    read_file(file_path: string, encoding?: BufferEncoding): string;
    read_dir(dir_path: string): string[];
    write_file(file_path: string, content: string, encoding?: BufferEncoding): void;
    create_file_async(file_path: string): void;
    create_file(file_path: string): void;
    create_directory_async(dir_path: string): void;
    create_directory(dir_path: string): void;
    copy_file_async(src: string, dest: string): void;
    copy_file(src: string, dest: string): void;
    /**
     * It will copy all files in src folder inside dest folder.
     * If dest folder does not exist it will create it.
     */
    copy_directory(src: string, dest: string, exclude?: string[] | RegExp[]): void;
    remove_file_async(file_path: string): void;
    remove_file(file_path: string): void;
    remove_directory_async(dir_path: string): void;
    remove_directory(dir_path: string): void;
}
export type FSInstance = InstanceType<typeof FS>;
export declare function create(output: out.OutputInstance): FSInstance;
export {};
