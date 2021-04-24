/**
 * Default config module
 *
 * @packageDocumentation
 */
import { Conf } from '../types';
export declare const defaults: {
    readonly default_repo: "web";
    readonly folder: ".uranio";
    readonly repo_folder: "repo";
    readonly tmp_folder: ".tmp";
    readonly log_filepath: ".urnlog";
    readonly json_filename: "uranio.json";
    readonly time_format: "yy-mm-dd'T'HH:MM:ss:l";
    readonly dot_repo: "ssh://git@bitbucket.org/nbl7/urn-dot.git";
    readonly ntl_repo: "ssh://git@bitbucket.org/nbl7/urn-ntl.git";
    readonly web_repo: "ssh://git@bitbucket.org/nbl7/urn-web.git";
    readonly core_repo: "ssh://git@bitbucket.org/nbl7/urn-core.git";
    readonly ntl_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-ntl-dep";
    readonly ntl_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-ntl-dep-dev";
    readonly web_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-web-dep";
    readonly web_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-web-dep-dev";
    readonly core_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-core-dep";
    readonly core_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-core-dep-dev";
    readonly check_char: "✔";
    readonly wrong_char: "✗";
};
export declare const jsonfile_path: string;
export declare const conf: Conf;
