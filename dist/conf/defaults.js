"use strict";
/**
 * Default config module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.conf = exports.jsonfile_path = exports.defaults = void 0;
const cloud_address = 'ssh://git@bitbucket.org/nbl7/';
exports.defaults = {
    default_repo: 'api',
    folder: '.uranio',
    repo_folder: 'lib',
    tmp_folder: '.tmp',
    log_filepath: '.urnlog',
    json_filename: `uranio.json`,
    time_format: "yy-mm-dd'T'HH:MM:ss:l",
    dot_repo: `${cloud_address}urn-dot.git`,
    api_repo: `${cloud_address}urn-api.git`,
    core_repo: `${cloud_address}urn-core.git`,
    api_dep_repo: `${cloud_address}urn-api-dep`,
    api_dep_dev_repo: `${cloud_address}urn-api-dep-dev`,
    core_dep_repo: `${cloud_address}urn-core-dep`,
    core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
    check_char: '✔',
    wrong_char: '✗',
};
exports.jsonfile_path = `${exports.defaults.folder}/${exports.defaults.json_filename}`;
exports.conf = {
    verbose: false,
    blank: false,
    hide: false,
    spinner: true,
    fullwidth: false,
    root: '.',
    repo: exports.defaults.default_repo,
    prefix: '',
    pacman: 'yarn',
    force: false,
    filelog: true
};
//# sourceMappingURL=defaults.js.map