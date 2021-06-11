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
    default_repo: 'web',
    folder: '.uranio',
    repo_folder: 'repo',
    tmp_folder: '.tmp',
    log_filepath: '.urnlog',
    json_filename: `uranio.json`,
    time_format: "yy-mm-dd'T'HH:MM:ss:l",
    dot_repo: `${cloud_address}urn-dot.git`,
    ntl_repo: `${cloud_address}urn-ntl.git`,
    web_repo: `${cloud_address}urn-web.git`,
    core_repo: `${cloud_address}urn-core.git`,
    ntl_dep_repo: `${cloud_address}urn-ntl-dep`,
    ntl_dep_dev_repo: `${cloud_address}urn-ntl-dep-dev`,
    web_dep_repo: `${cloud_address}urn-web-dep`,
    web_dep_dev_repo: `${cloud_address}urn-web-dep-dev`,
    core_dep_repo: `${cloud_address}urn-core-dep`,
    core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
    check_char: '✔',
    wrong_char: '✗',
};
exports.jsonfile_path = `${exports.defaults.folder}/${exports.defaults.json_filename}`;
exports.conf = {
    verbose: false,
    colors: true,
    output: true,
    full_width: false
};
//# sourceMappingURL=defaults.js.map