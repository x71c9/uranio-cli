"use strict";
/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.check_deploy = exports.check_pacman = exports.check_repo = exports.merge_params = void 0;
// import fs from 'fs';
// import * as cp from 'child_process';
const urn_lib_1 = require("urn-lib");
// import * as util from '../util/';
// import * as output from '../output/';
// import {default_params, defaults} from '../conf/defaults';
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
function merge_params(params) {
    const merged_params = defaults_1.default_params;
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
exports.merge_params = merge_params;
function check_repo(repo) {
    if (!urn_lib_1.urn_util.object.has_key(types_1.abstract_repos, repo)) {
        const valid_repos_str = types_1.valid_repos().join(', ');
        let end_log = '';
        end_log += `Wrong repo. `;
        end_log += `Repo must be one of the following [${valid_repos_str}]`;
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
        end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
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
        end_log += `Deploy value must be one of the following [${valid_deploy_str}]`;
        process.stderr.write(end_log);
        process.exit(1);
    }
}
exports.check_deploy = check_deploy;
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