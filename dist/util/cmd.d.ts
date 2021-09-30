/**
 * Util CMD
 *
 * @packageDocumentation
 */
import * as out from '../output/';
import { UtilParams } from './types';
import * as fs from './fs';
import * as spawn from './spawn';
declare class CMD {
    params: UtilParams;
    output: out.OutputInstance;
    fs: fs.FSInstance;
    spawn: spawn.SpawnInstance;
    constructor(params: UtilParams, output: out.OutputInstance);
    is_initialized(): boolean;
    install_dep(repo: string, context: string): Promise<any>;
    install_dep_dev(repo: string, context: string): Promise<any>;
    uninstall_dep(repo: string, context: string): Promise<any>;
    clone_repo(address: string, dest_folder: string, context?: string, branch?: string): Promise<any>;
    clone_repo_recursive(address: string, dest_folder: string, context?: string, branch?: string): Promise<any>;
    dependency_exists(repo: string): boolean;
    private _clone_repo;
}
export declare type CMDInstance = InstanceType<typeof CMD>;
export declare function create(params: UtilParams, output: out.OutputInstance): CMDInstance;
export {};
