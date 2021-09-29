/**
 * Default config module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare const defaults: {
    readonly default_repo: "trx";
    readonly folder: ".uranio";
    readonly repo_folder: "uranio";
    readonly tmp_folder: ".tmp";
    readonly log_filepath: ".urnlog";
    readonly json_filename: "uranio.json";
    readonly time_format: "yy-mm-dd'T'HH:MM:ss:l";
    readonly dot_repo: "ssh://git@bitbucket.org/nbl7/urn-dot.git";
    readonly trx_repo: "ssh://git@bitbucket.org/nbl7/urn-trx.git";
    readonly api_repo: "ssh://git@bitbucket.org/nbl7/urn-api.git";
    readonly core_repo: "ssh://git@bitbucket.org/nbl7/urn-core.git";
    readonly trx_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-trx-dep";
    readonly trx_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-trx-dep-dev";
    readonly api_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-api-dep";
    readonly api_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-api-dep-dev";
    readonly core_dep_repo: "ssh://git@bitbucket.org/nbl7/urn-core-dep";
    readonly core_dep_dev_repo: "ssh://git@bitbucket.org/nbl7/urn-core-dep-dev";
    readonly check_char: "✔";
    readonly wrong_char: "✗";
};
export declare const jsonfile_path: string;
export declare const default_params: Params;
