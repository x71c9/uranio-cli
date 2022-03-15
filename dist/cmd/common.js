"use strict";
/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adm_package_scripts = exports.package_scripts = exports.check_if_is_dot = exports.check_db = exports.check_deploy = exports.check_pacman = exports.check_repo = exports.merge_init_params = exports.merge_params = exports.read_init_file = void 0;
const fs_1 = __importDefault(require("fs"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
function read_init_file(params) {
    const rcfile_path = `${params.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.init_filepath}`;
    if (!fs_1.default.existsSync(rcfile_path)) {
        return params;
    }
    try {
        const cloned_params = Object.assign({}, params);
        const rc_content = fs_1.default.readFileSync(rcfile_path, 'utf8');
        const rc_obj = urn_lib_1.urn_util.json.clean_parse(rc_content);
        cloned_params.repo = rc_obj.repo;
        cloned_params.pacman = rc_obj.pacman;
        // cloned_params.deploy = rc_obj.deploy;
        cloned_params.docker = Boolean(rc_obj.docker);
        cloned_params.docker_db = Boolean(rc_obj.docker_db);
        cloned_params.db = rc_obj.db;
        return cloned_params;
    }
    catch (ex) {
        const err = ex;
        process.stderr.write(`Cannot parse rcfile ${rcfile_path}. ${err.message}`);
        process.exit(1);
    }
}
exports.read_init_file = read_init_file;
function merge_params(params) {
    return _merge_params(params, false);
}
exports.merge_params = merge_params;
function merge_init_params(params) {
    return _merge_params(params, true);
}
exports.merge_init_params = merge_init_params;
function _merge_params(params, is_init = false) {
    let merged_params = Object.assign({}, defaults_1.default_params);
    if (!is_init) {
        merged_params = read_init_file(params);
    }
    for (const k in defaults_1.default_params) {
        if (urn_lib_1.urn_util.object.has_key(params, k)) {
            merged_params[k] = params[k];
        }
    }
    for (const l in params) {
        if (!urn_lib_1.urn_util.object.has_key(merge_params, l)) {
            merged_params[l] = params[l];
        }
    }
    return merged_params;
}
function check_repo(repo) {
    if (!urn_lib_1.urn_util.object.has_key(types_1.abstract_repos, repo)) {
        const valid_repos_str = (0, types_1.valid_repos)().join(', ');
        let end_log = '';
        end_log += `Wrong repo. `;
        end_log += `Repo must be one of the following [${valid_repos_str}]\n`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_repo = check_repo;
function check_pacman(pacman) {
    if (!urn_lib_1.urn_util.object.has_key(types_1.abstract_pacman, pacman)) {
        const valid_pacman_str = (0, types_1.valid_pacman)().join(', ');
        let end_log = '';
        end_log += `Wrong package manager. `;
        end_log += `Package manager must be one of the following [${valid_pacman_str}]\n`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_pacman = check_pacman;
function check_deploy(deploy) {
    console.log(deploy);
    // if(!urn_util.object.has_key(abstract_deploy, deploy)){
    //   const valid_deploy_str = valid_deploy().join(', ');
    //   let end_log = '';
    //   end_log += `Wrong deploy value. `;
    //   end_log += `Deploy value must be one of the following [${valid_deploy_str}]\n`;
    //   process.stderr.write(end_log);
    //   process.exit(1);
    // }
}
exports.check_deploy = check_deploy;
function check_db(db) {
    if (!urn_lib_1.urn_util.object.has_key(types_1.abstract_db, db)) {
        const valid_db_str = (0, types_1.valid_db)().join(', ');
        let end_log = '';
        end_log += `Wrong db value. `;
        end_log += `DB value must be one of the following [${valid_db_str}]\n`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_db = check_db;
function check_if_is_dot(path) {
    const data = fs_1.default.readdirSync(path);
    if (!data) {
        return false;
    }
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'urn-dot' || pack.name === 'uranio-dot') {
                    return true;
                }
                return false;
            }
            catch (ex) {
                const err = ex;
                process.stderr.write(`Invalid ${package_json_path}. ${err.message}`);
                return false;
            }
        }
    }
    return false;
}
exports.check_if_is_dot = check_if_is_dot;
exports.package_scripts = {
    'build': `uranio build`,
    'build:server': `uranio build:client`,
    'build:panel': `uranio build:panel`,
    'dev': `uranio dev`,
    'dev:server': `uranio dev:server`,
    'dev:panel': `uranio dev:panel`
};
exports.adm_package_scripts = {
    'postinstall': `yarn patch-package --patch-dir node_modules/uranio/patches`
};
//# sourceMappingURL=common.js.map