"use strict";
/**
 * Start command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.start_panel = exports.start_server = exports.start = void 0;
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const defaults_1 = require("../conf/defaults");
const common_1 = require("./common");
const docker = __importStar(require("./docker"));
const build_1 = require("./build");
const types_1 = require("../types");
const cmd_1 = require("../util/cmd");
let output_instance;
let util_instance;
let start_params = defaults_1.default_params;
async function start(params) {
    _init_params(params);
    output_instance.start_loading(`Starting...`);
    if (params.docker === true) {
        await docker.start(start_params);
    }
    else {
        await _init_start();
        start_server(start_params, false);
        if ((0, types_1.valid_admin_repos)().includes(start_params.repo)) {
            start_panel(start_params, false);
        }
    }
}
exports.start = start;
async function start_server(params, init = true) {
    if (init) {
        _init_params(params);
    }
    output_instance.start_loading(`Starting server...`);
    if (params.docker === true) {
        await docker.start_server(start_params);
    }
    else {
        if (init) {
            await _init_start();
        }
        const exec = cmd_1.pacman_exec[start_params.pacman];
        // const urn_lib_pre = ` urn_log_prefix_type=true`;
        const urn_lib_pre = ` --prefix_loglevel`;
        const urn_config_path = ` -c ${start_params.root}/uranio.toml`;
        const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
        const cmd_server = `${node_env}${exec} uranio-webservice-${start_params.repo}${urn_lib_pre}${urn_config_path}`;
        util_instance.spawn.native(cmd_server, 'starting server', '', defaults_1.defaults.prefix_srv);
    }
}
exports.start_server = start_server;
async function start_panel(params, init = true) {
    if (init) {
        _init_params(params);
    }
    output_instance.start_loading(`Starting panel...`);
    if (params.docker === true) {
        await docker.start_panel(start_params);
    }
    else {
        if (init) {
            await _init_start();
        }
        const exec = cmd_1.pacman_exec[start_params.pacman];
        const urn_lib_pre = ` --prefix_loglevel`;
        const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
        const cmd_server = `${node_env}${exec} uranio-panel-${start_params.repo} start${urn_lib_pre}`;
        util_instance.spawn.native(cmd_server, 'starting panel', 'trace', defaults_1.defaults.prefix_pnl);
    }
}
exports.start_panel = start_panel;
async function _init_start() {
    if (start_params.build === true) {
        await (0, build_1.build_server)(start_params, true, false);
    }
}
function _init_params(params) {
    params.spin = false;
    start_params = (0, common_1.merge_params)(params);
    output_instance = output.create(start_params);
    util_instance = util.create(start_params, output_instance);
}
//# sourceMappingURL=start.js.map