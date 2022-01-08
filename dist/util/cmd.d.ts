/**
 * Util CMD
 *
 * @packageDocumentation
 */
import { Params } from '../types';
import * as out from '../output/';
import * as fs from './fs';
import * as spawn from './spawn';
declare type DotEnv = {
    [k: string]: string;
};
declare class CMD {
    params: Params;
    output: out.OutputInstance;
    fs: fs.FSInstance;
    spawn: spawn.SpawnInstance;
    constructor(params: Params, output: out.OutputInstance);
    yarn_install(): Promise<any>;
    install_dep(repo: string, context: string): Promise<any>;
    install_dep_dev(repo: string, context: string): Promise<any>;
    uninstall_dep(repo: string, context: string): Promise<any>;
    clone_repo(address: string, dest_folder: string, context?: string, branch?: string): Promise<any>;
    clone_repo_recursive(address: string, dest_folder: string, context?: string, branch?: string): Promise<any>;
    get_package_data(package_json_path: string): any;
    dependency_exists(repo: string, package_data?: any): boolean;
    read_dotenv(): DotEnv;
    write_dotenv(dotenv: DotEnv): void;
    private _clone_repo;
}
export declare type CMDInstance = InstanceType<typeof CMD>;
export declare function create(params: Params, output: out.OutputInstance): CMDInstance;
export {};
