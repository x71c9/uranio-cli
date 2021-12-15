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
exports.check_if_is_dot = exports.check_deploy = exports.check_pacman = exports.check_repo = exports.merge_init_params = exports.merge_params = exports.read_rc_file = void 0;
const fs_1 = __importDefault(require("fs"));
// import * as cp from 'child_process';
const urn_lib_1 = require("urn-lib");
// import * as util from '../util/';
// import * as output from '../output/';
// import {default_params, defaults} from '../conf/defaults';
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
function read_rc_file(params) {
    const rcfile_path = `${params.root}/${defaults_1.jsonfile_path}`;
    if (!fs_1.default.existsSync(rcfile_path)) {
        return params;
    }
    try {
        const cloned_params = Object.assign({}, params);
        const rc_content = fs_1.default.readFileSync(rcfile_path, 'utf8');
        const rc_obj = urn_lib_1.urn_util.json.clean_parse(rc_content);
        cloned_params.repo = rc_obj.repo;
        cloned_params.pacman = rc_obj.pacman;
        cloned_params.deploy = rc_obj.deploy;
        return cloned_params;
    }
    catch (ex) {
        process.stderr.write(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
        process.exit(1);
    }
}
exports.read_rc_file = read_rc_file;
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
        merged_params = read_rc_file(params);
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
        const valid_repos_str = types_1.valid_repos().join(', ');
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
        const valid_pacman_str = types_1.valid_pacman().join(', ');
        let end_log = '';
        end_log += `Wrong package manager. `;
        end_log += `Package manager must be one of the following [${valid_pacman_str}]\n`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_pacman = check_pacman;
function check_deploy(deploy) {
    if (!urn_lib_1.urn_util.object.has_key(types_1.abstract_deploy, deploy)) {
        const valid_deploy_str = types_1.valid_deploy().join(', ');
        let end_log = '';
        end_log += `Wrong deploy value. `;
        end_log += `Deploy value must be one of the following [${valid_deploy_str}]\n`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_deploy = check_deploy;
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
                if (pack.name === 'urn-dot') {
                    return true;
                }
                return false;
            }
            catch (ex) {
                process.stderr.write(`Invalid ${package_json_path}. ${ex.message}`);
                return false;
            }
        }
    }
    return false;
}
exports.check_if_is_dot = check_if_is_dot;
// export function init_log()
//     :void{
//   if(!fs.existsSync(`${conf.root}/${defaults.log_filepath}`)){
//     cp.execSync(`touch ${conf.root}/${defaults.log_filepath}`);
//   }
// }
// export function init_run(options?:Partial<Options>)
//     :void {
//   conf.hide = true;
//   conf.spinner = false;
//   if(options){
//     util.merge_options(options);
//   }
//   if(!util.check_folder(conf.root)){
//     throw new Error(`Invalid root path [${conf.root}].`);
//   }
//   if(!util.check_repo(conf.repo)){
//     throw new Error(`Invalid repo [${conf.repo}].`);
//   }
//   init_log();
//   _log_options();
// }
// function _log_options(){
//   output.verbose_log(JSON.stringify(conf), 'opts');
// }
//# sourceMappingURL=common.js.map