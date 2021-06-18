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
    readonly web: "";
    readonly ntl: "";
};
export declare function valid_repos(): string[];
export declare type Repo = keyof typeof abstract_repos;
export declare type Options = {
    verbose: boolean;
    blank: boolean;
    hide: boolean;
    spinner: boolean;
    fullwidth: boolean;
    prefix: string;
    root: string;
    repo: Repo;
};
