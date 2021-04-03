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
    readonly fnc: "";
};
export declare function valid_repos(): string[];
export declare type Repo = keyof typeof abstract_repos;
export declare type Defaults = {
    default_repo: Repo;
    folder: string;
    tmp_folder: string;
    book_src_path: string;
    book_dest_path: string;
    log_filepath: string;
    time_format: string;
    dot_repo: string;
    core_repo: string;
    web_repo: string;
    fnc_repo: string;
    core_dep_repo: string;
    core_dep_dev_repo: string;
    web_dep_repo: string;
    web_dep_dev_repo: string;
    fnc_dep_repo: string;
    fnc_dep_dev_repo: string;
    check_char: string;
    wrong_char: string;
    rcfile_path: string;
};
export declare type Conf = {
    verbose: boolean;
    colors: boolean;
    output: boolean;
};
