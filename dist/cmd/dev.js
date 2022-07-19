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
exports.dev_panel = exports.dev_server = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const forever_monitor_1 = __importDefault(require("forever-monitor"));
const is_docker_1 = __importDefault(require("is-docker"));
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
const generate_1 = require("./generate");
const transpose_1 = require("./transpose");
const build_1 = require("./build");
const common_1 = require("./common");
const docker = __importStar(require("./docker"));
const is_docker = (0, is_docker_1.default)();
let output_instance;
let util_instance;
let dev_params = defaults_1.default_params;
// let watch_lib_scanned = false;
let watch_src_scanned = false;
let watch_toml_scanned = false;
// const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
// const pane_color = '#4f9ee3';
// const pane_color = '#7464C3';
const pane_color = '#00AA7E';
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
    await (0, build_1.build_server)(dev_params);
    _tsc_watch();
    _watch();
}
async function _dev_panel() {
    // uranio-panel-adm dev doesn't need Forever to reaload (like the server)
    // because it reloads itself by launching Nuxt dev service.
    const cmd_dev_panel = `yarn uranio-panel-${dev_params.repo} dev`;
    util_instance.spawn.log(cmd_dev_panel, 'dev', 'developing panel', pane_color);
}
async function _dev_server() {
    _is_dev_server = true;
    // _fix_mongodb_saslprep_requirement();
    const args = (is_docker === true) ? ['urn_log_prefix_type=true'] : [];
    _service_child = new forever_monitor_1.default.Monitor(`${dev_params.root}/node_modules/uranio/dist/service/ws.js`, {
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
}
function _tsc_watch() {
    const tsc_watch = `yarn tsc -w`;
    util_instance.spawn.log(tsc_watch, 'tsc', 'watching types', tscw_color);
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
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
                output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
        await (0, transpose_1.transpose)(dev_params, _path, _event);
        await (0, generate_1.generate)(dev_params, _path, _event);
        if (_is_dev_server && _valid_reload_extensions.includes(extension)) {
            // clearTimeout(_service_time);
            // _service_time = setTimeout(() => {
            _service_child.restart();
            // }, 500);
        }
        output_instance.done_log(`[src watch] Built [${_event}] [${_path}].`, 'wtch');
    });
    if (!util_instance.fs.exists(dev_params.config)) {
        return;
    }
    output_instance.log(`Watching \`uranio.toml\` file [${dev_params.config}] ...`, 'wtch');
    util_instance.watch(dev_params.config, `watching \`toml\` file.`, () => {
        output_instance.done_log(`Initial scanner completed for [${dev_params.config}].`, 'wtch');
        watch_toml_scanned = true;
    }, async (_event, _path) => {
        if (!watch_toml_scanned) {
            if (_event === 'add' || _event === 'addDir') {
                output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
        await (0, generate_1.generate)(dev_params, _path, _event);
        if (_is_dev_server) {
            // clearTimeout(_service_time);
            // _service_time = setTimeout(() => {
            _service_child.restart();
            // }, 500);
        }
        output_instance.done_log(`[toml watch] Generated [${_event}] [${_path}].`, 'wtch');
    });
}
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