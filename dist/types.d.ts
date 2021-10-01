/**
 * Type module
 *
 * @packageDocumentation
 */
import minimist from 'minimist';
export declare type Repo = keyof typeof abstract_repos;
export declare type PacMan = keyof typeof abstract_pacman;
export declare type Deploy = keyof typeof abstract_deploy;
export declare type Params = {
    force: boolean;
    verbose: boolean;
    debug: boolean;
    hide: boolean;
    blank: boolean;
    fullwidth: boolean;
    native: boolean;
    filelog: boolean;
    spin: boolean;
    prefix: string;
    branch: string;
    repo: Repo;
    pacman: PacMan;
    deploy: Deploy;
    color: string;
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
export declare const abstract_pacman: {
    readonly yarn: "";
    readonly npm: "";
};
export declare const abstract_deploy: {
    readonly netlify: "";
    readonly express: "";
};
export declare function valid_repos(): string[];
export declare function valid_pacman(): string[];
export declare function valid_deploy(): string[];
