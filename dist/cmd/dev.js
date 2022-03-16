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
// const tscw_color = '#734de3';
const watc_color = '#687a6a';
// const pane_color = '#4f9ee3';
const pane_color = '#7464C3';
let service_child;
function dev(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        if (params.docker === true) {
            yield docker.start(dev_params);
        }
        else {
            yield _init_dev();
            _dev_server();
            if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)) {
                _dev_panel();
            }
        }
    });
}
exports.dev = dev;
function dev_server(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        if (params.docker === true) {
            yield docker.start_server(dev_params);
        }
        else {
            yield _init_dev();
            _dev_server();
        }
    });
}
exports.dev_server = dev_server;
function dev_panel(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        if (params.docker === true) {
            yield docker.start_panel(dev_params);
        }
        else {
            yield _init_dev();
            _dev_panel();
        }
    });
}
exports.dev_panel = dev_panel;
function _init_params(params) {
    params.spin = false;
    dev_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dev_params);
    util_instance = util.create(dev_params, output_instance);
}
function _init_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, build_1.build_server)(dev_params);
        _watch();
    });
}
function _dev_panel() {
    return __awaiter(this, void 0, void 0, function* () {
        // uranio-panel-adm dev doesn't need Forever to reaload (like the server)
        // because it reloads itself by launching Nuxt dev service.
        const cmd_dev_panel = `yarn uranio-panel-${dev_params.repo} dev`;
        util_instance.spawn.log(cmd_dev_panel, 'dev', 'developing panel', pane_color);
    });
}
function _dev_server() {
    return __awaiter(this, void 0, void 0, function* () {
        // _fix_mongodb_saslprep_requirement();
        const args = (is_docker === true) ? ['urn_log_prefix_type=true'] : [];
        service_child = new forever_monitor_1.default.Monitor(`${dev_params.root}/node_modules/uranio/dist/service/ws.js`, {
            args: args,
            // watch: true,
            // watchDirectory: `${dev_params.root}/src`
        });
        service_child.start();
        service_child.on('watch:restart', function (info) {
            output_instance.log('Restarting [dev server] because ' + info.file + ' changed');
        });
        service_child.on('restart', function (_info) {
            output_instance.log('Forever restarting [dev server].');
        });
        service_child.on('exit:code', function (code) {
            output_instance.done_log('Forever detected [dev server] exited with code ' + code);
        });
    });
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
        watch_src_scanned = true;
    }, (_event, _path) => __awaiter(this, void 0, void 0, function* () {
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
        yield (0, transpose_1.transpose)(dev_params, _path, _event);
        yield (0, generate_1.generate)(dev_params, _path, _event);
        service_child.restart();
        output_instance.done_log(`[src watch] Built [${_event}] [${_path}].`, 'wtch');
    }));
    if (!util_instance.fs.exists(dev_params.config)) {
        return;
    }
    output_instance.log(`Watching \`uranio.toml\` file [${dev_params.config}] ...`, 'wtch');
    util_instance.watch(dev_params.config, `watching \`toml\` file.`, () => {
        output_instance.done_log(`Initial scanner completed for [${dev_params.config}].`, 'wtch');
        watch_toml_scanned = true;
    }, (_event, _path) => __awaiter(this, void 0, void 0, function* () {
        if (!watch_toml_scanned) {
            if (_event === 'add' || _event === 'addDir') {
                output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
        yield (0, generate_1.generate)(dev_params, _path, _event);
        service_child.restart();
        output_instance.done_log(`[toml watch] Generated [${_event}] [${_path}].`, 'wtch');
    }));
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