/**
 * Type module
 *
 * @packageDocumentation
 */
import minimist from 'minimist';
export declare type Arguments = minimist.ParsedArgs;
export declare type ParseOptions = minimist.Opts;
export declare const abstract_repos: {
    readonly core: "";
    readonly api: "";
};
export declare const abstract_pacman: {
    readonly yarn: "";
    readonly npm: "";
};
export declare function valid_repos(): string[];
export declare function valid_pacman(): string[];
export declare type Repo = keyof typeof abstract_repos;
export declare type PacMan = keyof typeof abstract_pacman;
export declare type Options = {
    verbose: boolean;
    blank: boolean;
    hide: boolean;
    spinner: boolean;
    fullwidth: boolean;
    prefix: string;
    root: string;
    repo: Repo;
    pacman: PacMan;
    force: boolean;
};
