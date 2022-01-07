/**
 * Default config module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
export declare const default_params: Params;
export declare const defaults: {
    readonly folder: ".uranio";
    readonly docker_folder: ".docker";
    readonly repo_folder: "uranio";
    readonly tmp_folder: ".tmp";
    readonly log_filepath: ".urnlog";
    readonly json_filename: "uranio.json";
    readonly time_format: "yy-mm-dd'T'HH:MM:ss:l";
    readonly dot_repo: "git+ssh://git@github.com/nbl7/uranio-dot.git";
    readonly assets_repo: "git+ssh://git@github.com/nbl7/uranio-assets.git";
    readonly adm_repo: "git+ssh://git@github.com/nbl7/uranio-adm.git";
    readonly trx_repo: "git+ssh://git@github.com/nbl7/uranio-trx.git";
    readonly api_repo: "git+ssh://git@github.com/nbl7/uranio-api.git";
    readonly core_repo: "git+ssh://git@github.com/nbl7/uranio-core.git";
    readonly adm_dep_repo: "git+ssh://git@github.com/nbl7/uranio-adm-dep";
    readonly adm_dep_dev_repo: "git+ssh://git@github.com/nbl7/uranio-adm-dep-dev";
    readonly trx_dep_repo: "git+ssh://git@github.com/nbl7/uranio-trx-dep";
    readonly trx_dep_dev_repo: "git+ssh://git@github.com/nbl7/uranio-trx-dep-dev";
    readonly api_dep_repo: "git+ssh://git@github.com/nbl7/uranio-api-dep";
    readonly api_dep_dev_repo: "git+ssh://git@github.com/nbl7/uranio-api-dep-dev";
    readonly core_dep_repo: "git+ssh://git@github.com/nbl7/uranio-core-dep";
    readonly core_dep_dev_repo: "git+ssh://git@github.com/nbl7/uranio-core-dep-dev";
    readonly check_char: "✔";
    readonly wrong_char: "✗";
};
