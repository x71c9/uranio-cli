"use strict";
/**
 * Dev command module
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev_client = exports.dev_server = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
const transpose_1 = require("./transpose");
const hooks_1 = require("./hooks");
const common_1 = require("./common");
const docker_1 = require("./docker");
let output_instance;
let util_instance;
let dev_params = defaults_1.default_params;
// let watch_lib_scanned = false;
let watch_src_scanned = false;
const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
function dev(params) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(params);
        if (params.docker === true) {
            yield (0, docker_1.docker_start)(params);
        }
        else {
            _init_params(params);
            _init_dev();
            yield _dev_server();
            if ((0, types_1.valid_client_repos)().includes(dev_params.repo)) {
                yield _dev_client();
            }
        }
    });
}
exports.dev = dev;
function dev_server(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield (0, docker_1.docker_start)(params);
        }
        else {
            _init_params(params);
            _init_dev();
            yield _dev_server();
        }
    });
}
exports.dev_server = dev_server;
function dev_client(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield (0, docker_1.docker_start)(dev_params);
        }
        else {
            _init_params(params);
            if ((0, types_1.valid_client_repos)().includes(dev_params.repo)) {
                if (params.native != true) {
                    _init_dev();
                }
                yield _dev_client();
            }
            else {
                output_instance.error_log(`The selected repo [${dev_params.repo}] has no client development.`);
            }
        }
    });
}
exports.dev_client = dev_client;
function _dev_server() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dev_params.deploy === 'netlify' && (0, types_1.valid_deploy_repos)().includes(dev_params.repo)) {
            const cd_cmd = `cd ${dev_params.root}/${defaults_1.defaults.folder}/server`;
            const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
            const cmd = `${cd_cmd} && ${ts_cmd}`;
            util_instance.spawn.log(cmd, 'tscw', 'developing server', tscw_color);
        }
        else { // this is valid also if the repo is core.
            const cd_cmd = `cd ${dev_params.root}/${defaults_1.defaults.folder}/server`;
            // const dotenv_var = `DOTENV_CONFIG_PATH=${dev_params.root}/.env`;
            const dotenv_part = ` -r dotenv/config`;
            const dotenv_after = ` dotenv_config_path=${dev_params.root}/.env`;
            const source_part = ` -r source-map-support/register`;
            const urn_lib_pre = ` urn_log_prefix_type=true`;
            const ts_cmd = `npx tsc-watch --onSuccess "node${dotenv_part}${source_part} ../../dist/server/index.js${dotenv_after}${urn_lib_pre}"`;
            const cmd = `${cd_cmd} && ${ts_cmd}`;
            util_instance.spawn.log(cmd, 'tscw', 'developing server', tscw_color);
        }
    });
}
function _dev_client() {
    return __awaiter(this, void 0, void 0, function* () {
        switch (dev_params.repo) {
            case 'trx': {
                yield _dev_trx_client();
                break;
            }
            case 'adm': {
                yield _dev_client_adm();
            }
        }
    });
}
function _dev_trx_client() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dev_params.deploy === 'express' || dev_params.native === true) {
            yield _dev_trx_webpack_express();
        }
        else if (dev_params.deploy === 'netlify') {
            yield _dev_trx_webpack_netlify();
        }
    });
}
function _dev_trx_webpack_express() {
    return __awaiter(this, void 0, void 0, function* () {
        const cd_cmd = `cd ${dev_params.root}/${defaults_1.defaults.folder}/client`;
        const nu_cmd = `npx webpack serve --open`;
        const cmd = `${cd_cmd} && ${nu_cmd}`;
        util_instance.spawn.log(cmd, 'webpack', 'developing client', nuxt_color);
    });
}
function _dev_trx_webpack_netlify() {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = `npx ntl dev`;
        util_instance.spawn.log(cmd, 'ntlf', 'developing client', nuxt_color);
    });
}
function _dev_client_adm() {
    return __awaiter(this, void 0, void 0, function* () {
        if (dev_params.deploy === 'express' || dev_params.native === true) {
            yield _dev_admin_nuxt_express();
        }
        else if (dev_params.deploy === 'netlify') {
            yield _dev_admin_nuxt_netlify();
        }
    });
}
function _dev_admin_nuxt_express() {
    return __awaiter(this, void 0, void 0, function* () {
        const cd_cmd = `cd ${dev_params.root}/${defaults_1.defaults.folder}/client`;
        const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
        const cmd = `${cd_cmd} && ${nu_cmd}`;
        util_instance.spawn.log(cmd, 'nuxt', 'developing client', nuxt_color);
    });
}
function _dev_admin_nuxt_netlify() {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = `npx ntl dev`;
        util_instance.spawn.log(cmd, 'ntlf', 'developing client', nuxt_color);
    });
}
function _init_params(params) {
    params.spin = false;
    dev_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dev_params);
    util_instance = util.create(dev_params, output_instance);
    util_instance.must_be_initialized();
}
function _init_dev() {
    (0, transpose_1.transpose)(dev_params, true);
    if ((0, types_1.valid_hooks_repos)().includes(dev_params.repo)) {
        (0, hooks_1.hooks)(dev_params, true);
    }
    _watch();
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    const base_path = `${dev_params.root}/${defaults_1.defaults.folder}`;
    output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
        watch_src_scanned = true;
    }, (_event, _path) => {
        if (dev_params.is_dot === true && _path === `${dev_params.root}/src/books`) {
            return false;
        }
        const basename = path_1.default.basename(_path);
        const extension = path_1.default.extname(basename);
        const not_valid_extensions = ['.swp', '.swo'];
        if (not_valid_extensions.includes(extension)) {
            return false;
        }
        output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
        if (!watch_src_scanned) {
            return false;
        }
        const base_path_server = `${base_path}/server/src`;
        const base_path_client = `${base_path}/client/src`;
        const relative_path_to_src = _path.replace(`${dev_params.root}/src/`, '');
        const new_path_server = `${base_path_server}/${relative_path_to_src}`;
        const new_path_client = `${base_path_client}/${relative_path_to_src}`;
        if (_event === 'addDir') {
            if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)
                && _path.includes(`${dev_params.root}/src/frontend`)) {
                util_instance.fs.create_directory(`${base_path_client}/${defaults_1.defaults.repo_folder}/nuxt/${path_1.default.basename(_path)}`);
            }
            else {
                util_instance.fs.create_directory(new_path_server);
                util_instance.fs.create_directory(new_path_client);
            }
            output_instance.done_log(`[Src watch] Transposed dir [${_path}].`, 'wtch');
        }
        else if (_event === 'unlink' || _event === 'unlinkDir') {
            if (util_instance.fs.exists(new_path_server)) {
                if (util_instance.fs.is_directory(new_path_server)) {
                    util_instance.fs.remove_directory(new_path_server);
                }
                else {
                    util_instance.fs.remove_file(new_path_server);
                }
            }
            if (util_instance.fs.exists(new_path_client)) {
                if (util_instance.fs.is_directory(new_path_client)) {
                    util_instance.fs.remove_directory(new_path_client);
                }
                else {
                    util_instance.fs.remove_file(new_path_client);
                }
            }
        }
        else {
            (0, transpose_1.transpose_one)(_path, dev_params, true);
            if ((0, types_1.valid_hooks_repos)().includes(dev_params.repo)) {
                (0, hooks_1.hooks)(dev_params, true);
            }
            output_instance.done_log(`[src watch] Transposed [${_path}].`, 'wtch');
        }
        if (dev_params.deploy === 'netlify' && _is_file_related_to_lambda_function(_path)) {
            _replace_netlify_function_file();
        }
    });
    // const lib_path = `${base_path}/server/src/${defaults.repo_folder}/`;
    // output_instance.log(`Watching uranio repo folder [${lib_path}] ...`, 'wtch');
    // util_instance.watch(
    //   lib_path,
    //   `watching uranio repo folder.`,
    //   () => {
    //     output_instance.done_log(
    //       `Initial scanner completed for [${lib_path}].`,
    //       'wtch'
    //     );
    //     watch_lib_scanned = true;
    //   },
    //   (_event, _path) => {
    //     output_instance.verbose_log(
    //       `[uranio repo folder] ${_event} ${_path}`,
    //       'wtch',
    //       watc_color
    //     );
    //     if(!watch_lib_scanned){
    //       return false;
    //     }
    //     if(_path.includes(`hooks/index.ts`) || _path.includes(`src/books/`)){
    //       return false;
    //     }
    //     if(!dev_params.is_dot && _path.includes(`nuxt/`)){
    //       return false;
    //     }
    //     output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
    //     _replace_netlify_function_file();
    //   }
    // );
}
function _is_file_related_to_lambda_function(_path) {
    if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)
        && _path.includes(`${dev_params.root}/src/frontend`)) {
        return false;
    }
    if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)
        && _path.includes(`${dev_params.root}/src/uranio/nuxt`)) {
        return false;
    }
    return true;
}
function _replace_netlify_function_file() {
    const api_file_path = `${dev_params.root}/.uranio/server/src/functions/api.ts`;
    const result = util_instance.fs.read_file(api_file_path);
    let new_content = result.toString();
    const splitted = new_content.split(`\n`);
    const comment = '// uranio autoupdate';
    if (splitted[splitted.length - 2] !== comment) {
        new_content += `\n${comment}`;
        new_content += `\n// 0`;
    }
    else {
        const last_update = splitted.splice(-1);
        const last_update_split = last_update[0].split(' ');
        const update_number = Number(last_update_split[1]);
        new_content = splitted.join('\n');
        new_content += `\n// ${update_number + 1}`;
    }
    util_instance.fs.write_file(api_file_path, new_content, 'utf8');
    output_instance.done_verbose_log(`Replaced Netlify serverless function file.`, 'less');
}
// export const dev = {
//   command: async ():Promise<void> => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     dev_params.filelog = false;
//     _start_dev();
//   },
//   server: ():void => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     const cd_cmd = `cd ${dev_params.root}/.uranio/server`;
//     const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
//     util_instance.spawn_log_command(cmd, 'tscw', tscw_color);
//   },
//   client: (args?:Arguments):void => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     const native = args?.native || false;
//     const cd_cmd = `cd ${dev_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
//     if(native === true){
//       util_instance.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
//     }else{
//       util_instance.spawn_log_command(cmd, 'nuxt', nuxt_color);
//     }
//   }
// };
// }
// async function _start_dev(params:DevParams, output_params?:Partial<output_instance.OutputParams>)
//     :Promise<any>{
//   transpose(params, output_params);
//   // if(dev_params.repo === 'trx'){
//   //   hooks.run(cli_options);
//   // }
//   if(dev_params.deploy === 'netlify'){
//     const ntl_cmd = `npx ntl dev`;
//     util_instance.spawn.log(ntl_cmd, 'ntlf', 'developing netlify');
//   }else{
//     const nuxt_cmd = `cd ${dev_params.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`;
//     util_instance.spawn.log(nuxt_cmd, 'nuxt', 'developing nuxt');
//   }
//   const tscw_cmd = `cd ${dev_params.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`;
//   util_instance.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
//   const src_path = `${dev_params.root}/src/`;
//   output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch', watc_color);
//   util_instance.watch(
//     src_path,
//     `watching \`src\` folder.`,
//     () => {
//       output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
//       watch_src_scanned = true;
//     },
//     (_event, _path) => {
//       output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
//       if(!watch_src_scanned){
//         return false;
//       }
//       if(_event !== 'unlink'){
//         transpose.run(dev_params.root, _path, cli_options);
//         if(dev_params.repo === 'trx'){
//           hooks.run(cli_options);
//         }
//         output_instance.done_log(`[Book watch] Transposed [${_path}].`, 'wtch');
//       }else{
//         const relative_path = _path.replace(`${dev_params.root}/src/`, '');
//         const new_path_server = `${dev_params.root}/${defaults.folder}/server/src/${relative_path}`;
//         const new_path_client = `${dev_params.root}/${defaults.folder}/client/src/${relative_path}`;
//         util_instance.delete_file_sync(new_path_server);
//         util_instance.delete_file_sync(new_path_client);
//       }
//       _replace_netlify_function_file();
//     }
//   );
//   const lib_path = `${dev_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}/`;
//   output_instance.log(`Watching uranio repo folder [${lib_path}] ...`, 'wtch', watc_color);
//   util_instance.watch(
//     lib_path,
//     `watching uranio repo folder.`,
//     () => {
//       output_instance.done_log(`Initial scanner completed for [${lib_path}].`, 'wtch');
//       watch_lib_scanned = true;
//     },
//     (_event, _path) => {
//       output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
//       if(!watch_lib_scanned){
//         return false;
//       }
//       _replace_netlify_function_file();
//     }
//   );
// }
// export const dev = {
//   command: async ():Promise<void> => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     dev_params.filelog = false;
//     _start_dev();
//   },
//   server: ():void => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     const cd_cmd = `cd ${dev_params.root}/.uranio/server`;
//     const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
//     util_instance.spawn_log_command(cmd, 'tscw', tscw_color);
//   },
//   client: (args?:Arguments):void => {
//     output_instance.stop_loading();
//     util_instance.read_rc_file();
//     const native = args?.native || false;
//     const cd_cmd = `cd ${dev_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
//     if(native === true){
//       util_instance.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
//     }else{
//       util_instance.spawn_log_command(cmd, 'nuxt', nuxt_color);
//     }
//   }
// };
//# sourceMappingURL=dev.js.map