/**
 * Type module
 *
 * @packageDocumentation
 */
import minimist from 'minimist';
export declare type Repo = keyof typeof abstract_repos;
export declare type PacMan = keyof typeof abstract_pacman;
export declare type Deploy = keyof typeof abstract_deploy;
export declare type DB = keyof typeof abstract_db;
export declare type Params = {
    force: boolean;
    verbose: boolean;
    debug: boolean;
    hide: boolean;
    blank: boolean;
    fullwidth: boolean;
    native: boolean;
    is_dot: boolean;
    time: boolean;
    context: boolean;
    prefix_color: boolean;
    docker: boolean;
    docker_db: boolean;
    filelog: boolean;
    spin: boolean;
    color_uranio: boolean;
    prefix: string;
    branch: string;
    repo: Repo;
    pacman: PacMan;
    deploy: Deploy;
    db: DB;
    color_log: string;
    color_verbose: string;
    color_debug: string;
    root: string;
};
export declare type Arguments = minimist.ParsedArgs;
export declare type ParseOptions = minimist.Opts;
export declare const abstract_repos: {
    readonly core: "";
    readonly api: "";
    readonly trx: "";
    readonly adm: "";
};
export declare const abstract_deploy_repos: {
    readonly api: "";
    readonly trx: "";
    readonly adm: "";
};
export declare const abstract_hooks_repos: {
    readonly trx: "";
    readonly adm: "";
};
export declare const abstract_admin_repos: {
    readonly adm: "";
};
export declare const abstract_pacman: {
    readonly yarn: "";
    readonly npm: "";
};
export declare const abstract_deploy: {
    readonly netlify: "";
    readonly express: "";
};
export declare const abstract_db: {
    readonly mongo: "";
};
export declare function valid_repos(): string[];
export declare function valid_deploy_repos(): string[];
export declare function valid_client_repos(): string[];
export declare function valid_hooks_repos(): string[];
export declare function valid_admin_repos(): string[];
export declare function valid_pacman(): string[];
export declare function valid_deploy(): string[];
export declare function valid_db(): string[];
