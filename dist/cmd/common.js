"use strict";
/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge_params = void 0;
// import fs from 'fs';
// import * as cp from 'child_process';
const urn_lib_1 = require("urn-lib");
// import * as util from '../util/';
// import * as output from '../output/';
// import {default_params, defaults} from '../conf/defaults';
const defaults_1 = require("../conf/defaults");
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