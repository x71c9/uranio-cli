/**
 * Type module
 *
 * @packageDocumentation
 */
import minimist from 'minimist';
export declare type Repo = keyof typeof abstract_repos;
export declare type PacMan = keyof typeof abstract_pacman;
export declare type DB = keyof typeof abstract_db;
export declare enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}
export declare type Params = {
    prod: boolean;
    force: boolean;
    verbose: boolean;
    trace: boolean;
    no_colors: boolean;
    prefix_loglevel: boolean;
    fullwidth: boolean;
    inside_ntl: boolean;
    time: boolean;
    docker: boolean;
    docker_db: boolean;
    build: boolean;
    docker_load: boolean;
    filelog: boolean;
    spin: boolean;
    prefix: string;
    branch: string;
    config: string;
    repo: Repo;
    pacman: PacMan;
    db: DB;
    root: string;
    docker_tag: string;
    log_level: LogLevel;
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
export declare const abstract_db: {
    readonly mongo: "";
};
export declare const abstract_loglevel: {
    readonly none: "";
    readonly error: "";
    readonly warn: "";
    readonly info: "";
    readonly debug: "";
    readonly trace: "";
};
export declare function valid_repos(): string[];
export declare function valid_deploy_repos(): string[];
export declare function valid_client_repos(): string[];
export declare function valid_hooks_repos(): string[];
export declare function valid_admin_repos(): string[];
export declare function valid_pacman(): string[];
export declare function valid_db(): string[];
export declare function valid_loglevel(): string[];
export declare type Aliases = {
    [key: string]: string[];
};
