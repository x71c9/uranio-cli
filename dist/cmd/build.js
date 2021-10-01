"use strict";
/**
 * Build command module
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build_client = exports.build_server = exports.build = void 0;
// import {Options, Arguments} from '../types';
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const hooks_1 = require("./hooks");
const transpose_1 = require("./transpose");
const common_1 = require("./common");
// import {BuildParams} from './types';
// import * as common from './common';
// // const cli_options = {
// //   hide: false,
// //   verbose: false,
// // };
// // import {server} from './server';
// // import {client} from './client';
let done_building_server = false;
let building_server = false;
let done_building_client = false;
let building_client = false;
// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';
let output_instance;
let util_instance;
let build_params = defaults_1.default_params;
function build(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building...`);
        yield transpose_1.transpose(build_params, true);
        yield hooks_1.hooks(build_params, true);
        yield _build_server();
        yield _build_client();
    });
}
exports.build = build;
function build_server(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building server...`);
        yield transpose_1.transpose(build_params, true);
        yield hooks_1.hooks(build_params, true);
        yield _build_server();
        // output_instance.end_log('Build server completed.');
    });
}
exports.build_server = build_server;
function build_client(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building client...`);
        yield transpose_1.transpose(build_params, true);
        yield hooks_1.hooks(build_params, true);
        yield _build_client();
        // output_instance.end_log('Build client completed.');
    });
}
exports.build_client = build_client;
function _build_server() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Building server...`);
        building_server = true;
        const cd_cmd = `cd ${build_params.root}/.uranio/server`;
        const ts_cmd = `npx tsc -b`;
        const cmd = `${cd_cmd} && ${ts_cmd}`;
        const callback = () => {
            done_building_server = true;
            if (building_client) {
                output_instance.done_log(`Building server completed.`, 'tscb');
                if (done_building_client === true) {
                    output_instance.end_log(`Building completed.`);
                }
            }
            else {
                output_instance.end_log(`Building server completed.`);
            }
        };
        const reject = (err) => {
            done_building_server = true;
            output_instance.error_log(`Building server failed.`, 'tscb');
            if (err) {
                output_instance.error_log(err.message, 'tscb');
            }
        };
        util_instance.spawn.spin_and_verbose_log(cmd, 'tscb', 'building server', undefined, callback, reject);
    });
}
function _build_client() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Building client...`);
        building_client = true;
        const cd_cmd = `cd ${build_params.root}/.uranio/client`;
        const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
        const cmd = `${cd_cmd} && ${nu_cmd}`;
        const callback = () => {
            done_building_client = true;
            if (building_server) {
                output_instance.done_log(`Building client completed.`, 'nugn');
                if (done_building_server === true) {
                    output_instance.end_log(`Building completed.`);
                }
            }
            else {
                output_instance.end_log(`Building client completed.`);
            }
        };
        const reject = (err) => {
            done_building_client = true;
            output_instance.error_log(`Building server failed.`, 'tscb');
            if (err) {
                output_instance.error_log(err.message, 'tscb');
            }
        };
        util_instance.spawn.spin_and_verbose_log(cmd, 'nuxt', 'building client', undefined, callback, reject);
    });
}
function _init_build(params) {
    output_instance = output.create(params);
    build_params = common_1.merge_params(params);
    util_instance = util.create(params, output_instance);
    util_instance.must_be_initialized();
}
// export const build = {
//   run: async (root:string, options?:Partial<Options>):Promise<void> => {
//     build_params.root = root;
//     common.init_run(options);
//     await build.command();
//   },
//   command: async ():Promise<void> => {
//     output.start_loading('Building...');
//     util.read_rc_file();
//     build.server();
//     build.client();
//     // output.end_log(`Building completed.`);
//   },
//   server: ():void => {
//     output.start_loading('Building server...');
//     building_server = true;
//     build_params.spinner = true;
//     output.start_loading(`Building server...`);
//     util.read_rc_file();
//     // transpose.run(build_params.root, undefined, {verbose: true});
//     const cd_cmd = `cd ${build_params.root}/.uranio/server`;
//     // const ts_cmd = `npx tsc -b --verbose`;
//     const ts_cmd = `npx tsc -b`;
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output.log(cmd, 'srv');
//     util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
//       if(building_client){
//         output.done_log(`Building server completed.`, 'tscb');
//         done_building_server = true;
//         if(done_building_client === true){
//           output.end_log(`Building completed.`);
//         }
//       }else{
//         output.end_log(`Building server completed.`);
//       }
//     });
//   },
//   client: (args?:Arguments):void => {
//     output.start_loading('Building client...');
//     building_client = true;
//     build_params.spinner = true;
//     output.start_loading(`Building client...`);
//     // transpose.run(build_params.root, undefined, {verbose: true});
//     util.read_rc_file();
//     const native = args?.native || false;
//     const cd_cmd = `cd ${build_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output.log(cmd, 'clnt');
//     const callback = () => {
//       if(building_server){
//         output.done_log(`Building client completed.`, 'gnrt');
//         done_building_client = true;
//         if(done_building_server === true){
//           output.end_log(`Building completed.`);
//         }
//       }else{
//         output.end_log(`Building client completed.`);
//       }
//     };
//     if(native === true){
//       util.spawn_native_log_command(cmd, 'nuxt', nuxt_color, callback);
//     }else{
//       util.spawn_log_command(cmd, 'nuxt', nuxt_color, callback);
//     }
//   }
// };
//# sourceMappingURL=build.js.map