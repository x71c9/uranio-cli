/**
 * Util CMD
 *
 * @packageDocumentation
 */
import { Params, PacManExec } from '../types';
import * as out from '../output/index';
import * as fs from './fs';
import * as spawn from './spawn';
declare type DotEnv = {
    [k: string]: string;
};
declare type Toml = {
    [k: string]: string;
};
export declare const pacman_exec: PacManExec;
declare class CMD {
    params: Params;
    output: out.OutputInstance;
    fs: fs.FSInstance;
    spawn: spawn.SpawnInstance;
    constructor(params: Params, output: out.OutputInstance);
    yarn_install(): Promise<any>;
    install_package(pack: string): Promise<any>;
    install_package_dev(pack: string): Promise<any>;
    install_dep(repo: string): Promise<any>;
    install_dep_dev(repo: string): Promise<any>;
    uninstall_dep(repo: string): Promise<any>;
    clone_repo(address: string, dest_folder: string, branch?: string): Promise<any>;
    clone_repo_recursive(address: string, dest_folder: string, branch?: string): Promise<any>;
    get_package_data(package_json_path: string): any;
    dependency_exists(repo: string, package_data?: any): boolean;
    read_toml(): Toml;
    read_dotenv(): DotEnv;
    client_env_variables_to_command_string(): string;
    write_dotenv(dotenv: DotEnv): void;
    install_core_dep(): Promise<boolean>;
    install_api_dep(): Promise<boolean>;
    install_trx_dep(): Promise<boolean>;
    install_adm_dep(): Promise<boolean>;
    uninstall_uranio(pack_data: any): Promise<boolean>;
    uninstall_core_dep(pack_data?: any): Promise<boolean>;
    uninstall_api_dep(pack_data?: any): Promise<boolean>;
    uninstall_trx_dep(pack_data?: any): Promise<boolean>;
    uninstall_adm_dep(pack_data?: any): Promise<boolean>;
    uninstall_core(pack_data?: any): Promise<boolean>;
    uninstall_api(pack_data?: any): Promise<boolean>;
    uninstall_trx(pack_data?: any): Promise<boolean>;
    uninstall_adm(pack_data?: any): Promise<boolean>;
    is_docker_running(): Promise<boolean>;
    private _uninstall_uranio_dep;
    private _uninstall_uranio_pack;
    private _uninstall_package;
    private _clone_repo;
}
export declare type CMDInstance = InstanceType<typeof CMD>;
export declare function create(params: Params, output: out.OutputInstance): CMDInstance;
export {};
