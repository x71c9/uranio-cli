"use strict";
/**
 * Build command module
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
exports.build_panel = exports.build_server = exports.build = void 0;
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const types_1 = require("../types");
const common_1 = require("./common");
const transpose_1 = require("./transpose");
const generate_1 = require("./generate");
// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';
let output_instance;
let util_instance;
let build_params = defaults_1.default_params;
async function build(params) {
    _init_build(params);
    output_instance.start_loading(`Building...`);
    await _build();
    build_server(build_params, false);
    if ((0, types_1.valid_admin_repos)().includes(build_params.repo)) {
        build_panel(build_params, false);
    }
    output_instance.done_log('Build completed.');
}
exports.build = build;
async function build_server(params, init = true) {
    if (init) {
        _init_build(params);
    }
    output_instance.start_loading(`Building server...`);
    if (init) {
        await _build();
    }
    output_instance.done_log('Build server completed.');
}
exports.build_server = build_server;
async function build_panel(params, init = true) {
    if (init) {
        _init_build(params);
    }
    output_instance.start_loading(`Building panel...`);
    if (init) {
        await _build();
    }
    const urn_lib_pre = ` urn_log_prefix_type=true`;
    // const urn_config_path = ` -c ${build_params.root}/uranio.toml`;
    // const cmd_server = `NODE_ENV=production yarn uranio-panel-${build_params.repo} generate ${urn_lib_pre}`;
    const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
    const cmd_server = `${node_env}yarn uranio-panel-${build_params.repo} build ${urn_lib_pre}`;
    util_instance.spawn.log(cmd_server, 'panel', 'building panel');
    output_instance.done_log('Build panel completed.');
}
exports.build_panel = build_panel;
async function _build() {
    await (0, transpose_1.transpose)(build_params);
    await (0, generate_1.generate)(build_params);
}
function _init_build(params) {
    build_params = (0, common_1.merge_params)(params);
    output_instance = output.create(build_params);
    util_instance = util.create(build_params, output_instance);
}
//# sourceMappingURL=build.js.map