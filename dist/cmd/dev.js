"use strict";
/**
 * Dev command module
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
exports._watch = exports.dev_panel = exports.dev_server = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const forever_monitor_1 = __importDefault(require("forever-monitor"));
// import isDocker from 'is-docker';
// import chalk from 'chalk';
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const defaults_1 = require("../conf/defaults");
// import {Params} from '../types';
const types_1 = require("../types");
const generate_1 = require("./generate");
const transpose_1 = require("./transpose");
const build_1 = require("./build");
const common_1 = require("./common");
const docker = __importStar(require("./docker"));
// const is_docker = isDocker();
let output_instance;
let util_instance;
let dev_params = defaults_1.default_params;
// let watch_lib_scanned = false;
let watch_src_scanned = false;
let watch_toml_scanned = false;
// const nuxt_color = '#677cc7';
// const tscw_color = '#734de3';
// const watc_color = '#687a6a';
// const pane_color = '#4f9ee3';
// const pane_color = '#7464C3';
// const pane_color = '#00AA7E';
let _service_child;
// let _service_time:ReturnType<typeof setTimeout>;
let _is_dev_server = false;
const _valid_reload_extensions = ['.ts', '.js'];
async function dev(params) {
    _init_params(params);
    if (params.docker === true) {
        await docker.start(dev_params);
    }
    else {
        await _init_dev();
        _dev_server();
        if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)) {
            _dev_panel();
        }
    }
}
exports.dev = dev;
async function dev_server(params) {
    _init_params(params);
    if (params.docker === true) {
        await docker.start_server(dev_params);
    }
    else {
        await _init_dev();
        _dev_server();
    }
}
exports.dev_server = dev_server;
async function dev_panel(params) {
    _init_params(params);
    if (params.docker === true) {
        await docker.start_panel(dev_params);
    }
    else {
        await _init_dev();
        _dev_panel();
    }
}
exports.dev_panel = dev_panel;
function _init_params(params) {
    params.spin = false;
    dev_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dev_params);
    util_instance = util.create(dev_params, output_instance);
}
async function _init_dev() {
    await (0, build_1.build_server)(dev_params, true, false);
    _tsc_watch();
    _watch();
}
async function _dev_panel() {
    // uranio-panel-adm dev doesn't need Forever to reaload (like the server)
    // because it reloads itself by launching Nuxt dev service.
    // const args = (is_docker === true) ? ' urn_log_prefix_type=true' : '';
    // const args = ' urn_log_prefix_type=true';
    // const args = '';
    const args = ' --prefix_loglevel';
    const prefix = (dev_params.no_colors === true) ? defaults_1.defaults.prefix_pnl_blank : defaults_1.defaults.prefix_pnl;
    const cmd_dev_panel = `yarn uranio-panel-${dev_params.repo} dev${args}`;
    util_instance.spawn.native(cmd_dev_panel, 'developing panel', 'trace', prefix);
}
async function _dev_server() {
    _is_dev_server = true;
    // _fix_mongodb_saslprep_requirement();
    // const args = (is_docker === true) ? ['urn_log_prefix_type=true'] : [];
    // const args = ['urn_log_prefix_type=true'];
    // const args:string[] = [];
    const args = ['--prefix_loglevel'];
    // Forever module needs for ensuring that a given script runs continuously
    _service_child = new forever_monitor_1.default.Monitor(`${dev_params.root}/node_modules/uranio/dist/service/ws.js`, {
        silent: true,
        args: args,
        // watch: true,
        // watchDirectory: `${dev_params.root}/src`
    });
    _service_child.start();
    _service_child.on('watch:restart', function (info) {
        output_instance.log('Restarting [dev server] because ' + info.file + ' changed');
    });
    _service_child.on('restart', function (_info) {
        output_instance.log('Forever restarting [dev server].');
    });
    _service_child.on('exit:code', function (code) {
        output_instance.done_log('Forever detected [dev server] exited with code ' + code);
    });
    _service_child.on('stdout', function (chunk) {
        // process.stdout.write(`${prefix} ${data.toString()}`);
        // process.stdout.write(chunk.toString());
        const splitted_chunk = chunk.toString().split('\n');
        for (const split of splitted_chunk) {
            let plain_text = output_instance.clean_chunk(split);
            if (plain_text === '') {
                continue;
            }
            const prefix = (dev_params.no_colors === true) ? defaults_1.defaults.prefix_srv_blank : defaults_1.defaults.prefix_srv;
            plain_text = `${prefix} ${plain_text}`;
            output_instance.translate_loglevel(plain_text);
        }
    });
}
function _tsc_watch() {
    const tsc_watch = `yarn tsc -w`;
    const prefix = (dev_params.no_colors === true) ? defaults_1.defaults.prefix_tsc_blank : defaults_1.defaults.prefix_tsc;
    util_instance.spawn.log(tsc_watch, 'watching types', prefix);
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    output_instance.debug_log(`Watching \`src\` folder [${src_path}] ...`);
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`);
        watch_src_scanned = true;
    }, async (_event, _path) => {
        const basename = path_1.default.basename(_path);
        const extension = path_1.default.extname(basename);
        const not_valid_extensions = ['.swp', '.swo'];
        if (not_valid_extensions.includes(extension) || not_valid_extensions.includes(basename)) {
            return false;
        }
        if (!watch_src_scanned) {
            if (_event === 'add' || _event === 'addDir') {
                output_instance.debug_log(`${_event} ${_path}`);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`);
        await (0, transpose_1.transpose)(dev_params, _path, _event);
        await (0, generate_1.generate)(dev_params, _path, _event);
        if (_is_dev_server && _valid_reload_extensions.includes(extension)) {
            // clearTimeout(_service_time);
            // _service_time = setTimeout(() => {
            _service_child.restart();
            // }, 500);
        }
        output_instance.done_log(`[src watch] Built [${_event}] [${_path}].`);
    });
    if (!util_instance.fs.exists(dev_params.config)) {
        return;
    }
    output_instance.debug_log(`Watching \`uranio.toml\` file [${dev_params.config}] ...`);
    util_instance.watch(dev_params.config, `watching \`toml\` file.`, () => {
        output_instance.done_log(`Initial scanner completed for [${dev_params.config}].`);
        watch_toml_scanned = true;
    }, async (_event, _path) => {
        if (!watch_toml_scanned) {
            if (_event === 'add' || _event === 'addDir') {
                output_instance.debug_log(`${_event} ${_path}`);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`);
        await (0, generate_1.generate)(dev_params, _path, _event);
        if (_is_dev_server) {
            // clearTimeout(_service_time);
            // _service_time = setTimeout(() => {
            _service_child.restart();
            // }, 500);
        }
        output_instance.done_log(`[toml watch] Generated [${_event}] [${_path}].`);
    });
}
exports._watch = _watch;
// function _fix_mongodb_saslprep_requirement(){
//   const dist_dir = `${dev_params.root}/dist`;
//   if(!util_instance.fs.exists(dist_dir)){
//     util_instance.fs.create_directory(dist_dir);
//   }
//   const saslprep_filename = `code-points.mem`;
//   const saslprep_module_dir = `${dev_params.root}/node_modules/saslprep/`;
//   util_instance.fs.copy_file(
//     `${saslprep_module_dir}/${saslprep_filename}`,
//     `${dist_dir}/${saslprep_filename}`
//   );
//   // util_instance.fs.copy_file(
//   //   `${saslprep_module_dir}/${saslprep_filename}`,
//   //   `${dist_dir}/server/${saslprep_filename}`
//   // );
// }
//# sourceMappingURL=dev.js.map