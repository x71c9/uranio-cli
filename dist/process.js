"use strict";
/**
 * Process module
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uranio_process = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const urn_lib_1 = require("urn-lib");
// import {Arguments, Repo, PacMan, Deploy, Params, DB} from './types';
const types_1 = require("./types");
const output = __importStar(require("./output/index"));
const util = __importStar(require("./util/index"));
const index_1 = require("./cmd/index");
const defaults_1 = require("./conf/defaults");
const common_1 = require("./cmd/common");
let output_instance;
let util_instance;
let process_params = defaults_1.default_params;
function uranio_process(args) {
    process_params.spin = true;
    if (!_cmd_that_do_not_need_root(args)) {
        _set_root(args);
    }
    process_params = (0, common_1.read_init_file)(process_params);
    process_params = _set_args(process_params, args);
    process.chdir(process_params.root);
    // process_params = _autoset_is_dot(process_params, args);
    output_instance = output.create(process_params);
    util_instance = util.create(process_params, output_instance);
    _init_log();
    _switch_command(args);
}
exports.uranio_process = uranio_process;
function _cmd_that_do_not_need_root(args) {
    const full_cmd = args._[0] || '';
    const splitted_cmd = full_cmd.split(':');
    let cmd = splitted_cmd[0];
    if (args.version || args.V) {
        cmd = 'version';
    }
    if (args.help || args.h) {
        cmd = 'help';
    }
    const no_root_cmd = ['', 'help', 'version'];
    if (no_root_cmd.includes(cmd)) {
        return true;
    }
    return false;
}
function _set_root(args) {
    let root = args.s || args.root;
    if (typeof root === 'string' && root !== '') {
        if (root[0] !== '/') {
            root = path_1.default.resolve(process.cwd(), root);
        }
        if (!_check_folder(root)) {
            let end_log = '';
            end_log += `\nInvalid project root.\n`;
            process.stderr.write(end_log);
            process.exit(1);
        }
        else {
            process_params.root = root;
        }
    }
    else {
        process_params.root = _get_project_root();
    }
}
// function _autoset_is_dot(params:Params, args:Arguments):Params{
//   if(typeof args.is_dot === 'undefined' && check_if_is_dot(params.root)){
//     params.is_dot = true;
//   }
//   return params;
// }
function _init_log() {
    const log_file_path = `${process_params.root}/${defaults_1.defaults.log_filepath}`;
    if (!util_instance.fs.exists(log_file_path)) {
        util_instance.fs.create_file(log_file_path);
    }
    _log_arguments(process_params);
    _log_root();
}
function _log_arguments(params) {
    output_instance.debug_log(JSON.stringify(params), 'args');
}
function _log_root() {
    output_instance.verbose_log(`$URNROOT$Project root [${process_params.root}]`, 'root');
}
function _set_args(params, args) {
    // Paramters with default value = false
    const force = args.f || args.force;
    if (force == true) {
        params.force = true;
    }
    if (typeof args.noforce === 'boolean' && !!args.noforce !== !params.force) {
        params.force = !args.noforce;
    }
    const verbose = args.v || args.verbose;
    if (verbose == true) {
        params.verbose = true;
    }
    if (typeof args.noverbose === 'boolean' && !!args.noverbose !== !params.verbose) {
        params.verbose = !args.noverbose;
    }
    const debug = args.u || args.debug;
    if (debug == true) {
        params.debug = true;
    }
    if (typeof args.nodebug === 'boolean' && !!args.nodebug !== !params.debug) {
        params.debug = !args.nodebug;
    }
    const hide = args.n || args.hide;
    if (hide == true) {
        params.hide = true;
    }
    if (typeof args.nohide === 'boolean' && !!args.nohide !== !params.hide) {
        params.hide = !args.nohide;
    }
    const blank = args.b || args.blank;
    if (blank == true) {
        params.blank = true;
    }
    if (typeof args.noblank === 'boolean' && !!args.noblank !== !params.blank) {
        params.blank = !args.noblank;
    }
    const fullwidth = args.w || args.fullwidth;
    if (fullwidth == true) {
        params.fullwidth = true;
    }
    if (typeof args.nofullwidth === 'boolean' && !!args.nofullwidth !== !params.fullwidth) {
        params.fullwidth = !args.nofullwidth;
    }
    const native = args.e || args.native;
    if (native == true) {
        params.native = true;
    }
    if (typeof args.nonative === 'boolean' && !!args.nonative !== !params.native) {
        params.native = !args.nonative;
    }
    const inside_ntl = args.inside_ntl;
    if (inside_ntl == true) {
        params.inside_ntl = true;
    }
    if (typeof args.noinside_ntl === 'boolean' && !!args.noinside_ntl !== !params.inside_ntl) {
        params.inside_ntl = !args.noinside_ntl;
    }
    // const is_dot = args.is_dot;
    // if(is_dot == true){
    //   params.is_dot = true;
    // }
    const time = args.t || args.time;
    if (time == true) {
        params.time = true;
    }
    if (typeof args.notime === 'boolean' && !!args.notime !== !params.time) {
        params.time = !args.notime;
    }
    const context = args.a || args.context;
    if (context == true) {
        params.context = true;
    }
    if (typeof args.nocontext === 'boolean' && !!args.nocontext !== !params.context) {
        params.context = !args.nocontext;
    }
    const prefix_color = args.prefix_color;
    if (prefix_color == true) {
        params.prefix_color = true;
    }
    if (typeof args.noprefix_color === 'boolean' && !!args.noprefix_color !== !params.prefix_color) {
        params.prefix_color = !args.noprefix_color;
    }
    const docker = args.k || args.docker;
    if (docker == true) {
        params.docker = true;
    }
    if (typeof args.nodocker === 'boolean' && !!args.nodocker !== !params.docker) {
        params.docker = !args.nodocker;
    }
    const docker_db = args.docker_db;
    if (docker_db == true) {
        params.docker_db = true;
    }
    if (typeof args.nodocker_db === 'boolean' && !!args.nodocker_db !== !params.docker_db) {
        params.docker_db = !args.nodocker_db;
    }
    // Paramteters with default value = true
    const filelog = args.l || args.filelog;
    if (filelog == false || filelog == 'false') {
        params.filelog = false;
    }
    if (typeof args.nofilelog === 'boolean' && !!args.nofilelog !== !params.filelog) {
        params.filelog = !args.nofilelog;
    }
    const spin = args.i || args.spin;
    if (spin == false || spin == 'false') {
        params.filelog = false;
    }
    if (typeof args.nospin === 'boolean' && !!args.nospin !== !params.spin) {
        params.spin = !args.nospin;
    }
    const color_uranio = args.color_uranio;
    if (color_uranio == false || color_uranio == 'false') {
        params.color_uranio = false;
    }
    if (typeof args.nocolor_uranio === 'boolean' && !!args.nocolor_uranio !== !params.color_uranio) {
        params.color_uranio = !args.nocolor_uranio;
    }
    // Parameters with default value type = string
    const prefix = args.x || args.prefix;
    if (typeof prefix === 'string' && prefix !== '') {
        params.prefix = prefix;
    }
    const branch = args.g || args.branch;
    if (typeof branch === 'string' && branch !== '') {
        params.branch = branch;
    }
    const pacman = args.p || args.pacman;
    if (typeof pacman === 'string' && pacman != '') {
        (0, common_1.check_pacman)(pacman);
        params.pacman = pacman;
    }
    const repo = args.r || args.repo;
    if (typeof repo === 'string' && repo != '') {
        (0, common_1.check_repo)(repo);
        params.repo = repo;
    }
    const config = args.c || args.config;
    if (typeof config === 'string' && config != '') {
        params.config = config;
    }
    // const deploy = args.d || args.deploy;
    // if(typeof deploy === 'string' && deploy != ''){
    //   check_deploy(deploy);
    //   params.deploy = deploy as Deploy;
    // }
    const db = args.db;
    if (typeof db === 'string' && db !== '') {
        (0, common_1.check_db)(db);
        params.db = db;
    }
    const color_log = args.d || args.color_log;
    if (typeof color_log === 'string' && color_log != '') {
        params.color_log = color_log;
    }
    const color_verbose = args.o || args.color_verbose;
    if (typeof color_verbose === 'string' && color_verbose != '') {
        params.color_verbose = color_verbose;
    }
    const color_debug = args.o || args.color_debug;
    if (typeof color_debug === 'string' && color_debug != '') {
        params.color_debug = color_debug;
    }
    // Root parameter
    // let root = args.s || args.root;
    // if(typeof root === 'string' && root !== ''){
    //   if(root[0] !== '/'){
    //     root = path.resolve(process.cwd(), root);
    //   }
    //   if(!_check_folder(root)){
    //     let end_log = '';
    //     end_log += `\nInvalid project root.\n`;
    //     process.stderr.write(end_log);
    //     process.exit(1);
    //   }else{
    //     params.root = root;
    //   }
    // }else{
    //   params.root = _get_project_root();
    // }
    return params;
}
function _get_project_root() {
    let folder_path = process.cwd();
    while (!_folder_is_valid(folder_path)) {
        if (_folder_is_uranio(folder_path)) {
            folder_path = `${folder_path}/urn-bld`;
            break;
        }
        const arr_folder = folder_path.split('/');
        arr_folder.pop();
        folder_path = arr_folder.join('/');
        if (folder_path === '/' || arr_folder.length === 2) {
            let err_msg = `Cannot find project root.`;
            err_msg += ' Be sure to run `uranio` inside an NPM project.\n';
            process.stderr.write(err_msg);
            process.exit(1);
        }
    }
    return folder_path;
}
function _folder_is_valid(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    if (!data) {
        return false;
    }
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${folder_path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'uranio-cli' || (pack.name === 'uranio' && pack.uranio == true)) {
                    return false;
                }
                return true;
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
function _folder_is_uranio(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    if (!data) {
        return false;
    }
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${folder_path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'uranio') {
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
function _check_folder(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    if (!data) {
        return false;
    }
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${folder_path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'urn-cli') {
                    return false;
                }
                else if (pack.name === 'uranio') {
                    const bld_path = `${folder_path}/urn-bld`;
                    if (!fs_1.default.existsSync(bld_path)) {
                        return false;
                    }
                    folder_path = bld_path;
                    return true;
                }
                return true;
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
function _return_version() {
    var _a;
    if (!process.mainModule || typeof process.mainModule.path !== 'string') {
        output_instance.error_log(`Invalid mainModule.path [${(_a = process.mainModule) === null || _a === void 0 ? void 0 : _a.path}].`);
        process.exit(1);
    }
    const data = util_instance.fs.read_file(process.mainModule.path + `/../package.json`);
    const json_data = urn_lib_1.urn_util.json.clean_parse(data);
    const version = json_data.version;
    if (typeof version !== 'string' || version === '') {
        output_instance.error_log(`Invalid package.json version.`);
        process.exit(1);
    }
    return version;
}
function _switch_command(args) {
    const full_cmd = args._[0] || '';
    const splitted_cmd = full_cmd.split(':');
    let cmd = splitted_cmd[0];
    if (args.version || args.V) {
        cmd = 'version';
    }
    if (args.help || args.h) {
        cmd = 'help';
    }
    switch (cmd) {
        case '':
        case 'version': {
            output_instance.stop_loading();
            output_instance.log(_return_version());
            break;
        }
        case 'init': {
            (0, index_1.prompt_init)(process_params, args);
            break;
        }
        case 'dev': {
            switch (splitted_cmd[1]) {
                case 'server': {
                    (0, index_1.dev_server)(process_params);
                    break;
                }
                case 'panel': {
                    if ((0, types_1.valid_admin_repos)().includes(process_params.repo)) {
                        (0, index_1.dev_panel)(process_params);
                    }
                    break;
                }
                case '':
                case undefined:
                default: {
                    (0, index_1.dev)(process_params);
                }
            }
            break;
        }
        case 'build': {
            switch (splitted_cmd[1]) {
                case 'server': {
                    (0, index_1.build_server)(process_params);
                    break;
                }
                case 'panel': {
                    if ((0, types_1.valid_admin_repos)().includes(process_params.repo)) {
                        (0, index_1.build_panel)(process_params);
                    }
                    break;
                }
                case '':
                case undefined:
                default: {
                    (0, index_1.build)(process_params);
                }
            }
            break;
        }
        case 'start': {
            switch (splitted_cmd[1]) {
                case 'server': {
                    (0, index_1.start_server)(process_params);
                    break;
                }
                case 'panel': {
                    if ((0, types_1.valid_admin_repos)().includes(process_params.repo)) {
                        (0, index_1.start_panel)(process_params);
                    }
                    break;
                }
                case '':
                case undefined:
                default: {
                    (0, index_1.start)(process_params);
                }
            }
            break;
        }
        case 'generate': {
            (0, index_1.generate)(process_params);
            break;
        }
        case 'transpose': {
            // if(args._.length > 1 && typeof args._[1] === 'string'){
            //   const final_path = (args._[1][0] === '/') ?
            //     args._[1] : `${process.cwd()}/${args._[1]}`;
            //   transpose_one(final_path, process_params);
            // }else{
            (0, index_1.transpose)(process_params);
            // }
            break;
        }
        case 'info': {
            (0, index_1.info)(process_params);
            break;
        }
        case 'help': {
            (0, index_1.help)();
            break;
        }
        case 'docker': {
            (0, index_1.docker)(process_params, args);
            break;
        }
        case 'deinit': {
            (0, index_1.deinit)(process_params);
            break;
        }
        default: {
            output_instance.error_log(`Invalid argument [${cmd}]`);
            process.exit(1);
        }
    }
}
//# sourceMappingURL=process.js.map