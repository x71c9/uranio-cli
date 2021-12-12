"use strict";
/**
 * Default config module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonfile_path = exports.defaults = exports.default_params = void 0;
exports.default_params = {
    force: false,
    verbose: false,
    debug: false,
    hide: false,
    blank: false,
    fullwidth: false,
    native: false,
    is_dot: false,
    time: false,
    context: false,
    filelog: true,
    spin: true,
    prefix: '',
    branch: 'master',
    repo: 'adm',
    pacman: 'yarn',
    deploy: 'netlify',
    color_log: '#859900',
    color_verbose: '#668899',
    color_debug: '#557685',
    root: '.',
};
const cloud_address = 'ssh://git@bitbucket.org/nbl7/';
exports.defaults = {
    folder: '.uranio',
    repo_folder: 'uranio',
    tmp_folder: '.tmp',
    log_filepath: '.urnlog',
    json_filename: `uranio.json`,
    time_format: "yy-mm-dd'T'HH:MM:ss:l",
    dot_repo: `${cloud_address}urn-dot.git`,
    adm_repo: `${cloud_address}urn-adm.git`,
    trx_repo: `${cloud_address}urn-trx.git`,
    api_repo: `${cloud_address}urn-api.git`,
    core_repo: `${cloud_address}urn-core.git`,
    adm_dep_repo: `${cloud_address}urn-adm-dep`,
    adm_dep_dev_repo: `${cloud_address}urn-adm-dep-dev`,
    trx_dep_repo: `${cloud_address}urn-trx-dep`,
    trx_dep_dev_repo: `${cloud_address}urn-trx-dep-dev`,
    api_dep_repo: `${cloud_address}urn-api-dep`,
    api_dep_dev_repo: `${cloud_address}urn-api-dep-dev`,
    core_dep_repo: `${cloud_address}urn-core-dep`,
    core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
    check_char: '✔',
    wrong_char: '✗',
};
exports.jsonfile_path = `${exports.defaults.folder}/${exports.defaults.json_filename}`;
//# sourceMappingURL=defaults.js.map