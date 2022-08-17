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
const docker = __importStar(require("./docker"));
const cmd_1 = require("../util/cmd");
let output_instance;
let util_instance;
let build_params = defaults_1.default_params;
async function build(params) {
    _init_build(params);
    await _build();
    await build_server(build_params, false);
    if ((0, types_1.valid_admin_repos)().includes(build_params.repo)) {
        await build_panel(build_params, false);
    }
    output_instance.done_log('Build completed.');
    process.exit(0);
}
exports.build = build;
async function build_server(params, init = true, exit = true) {
    if (init) {
        _init_build(params);
    }
    if (init) {
        await _build();
    }
    // await _bundle_service_ws();
    output_instance.done_log('Build server completed.');
    if (exit) {
        process.exit(0);
    }
}
exports.build_server = build_server;
async function build_panel(params, init = true) {
    if (init) {
        _init_build(params);
    }
    // await _bundle_panel_index();
    if (init) {
        await _build();
    }
    const exec = cmd_1.pacman_exec[build_params.pacman];
    const urn_lib_pre = ` --prefix_loglevel`;
    const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
    const cmd_server = `${node_env}${exec} uranio-panel-${build_params.repo} build ${urn_lib_pre}`;
    await util_instance.spawn.native_promise(cmd_server, 'building panel');
    output_instance.done_log('Build panel completed.');
    if (init) {
        process.exit(0);
    }
}
exports.build_panel = build_panel;
async function _build() {
    if (build_params.docker === true) {
        return await docker.build(build_params);
    }
    await (0, transpose_1.transpose)(build_params);
    await (0, generate_1.generate)(build_params);
}
// async function _create_bundles(){
// 	await _bundle_service_ws();
// 	await _bundle_panel_index();
// }
// @ts-ignore
async function _bundle_service_ws(params) {
    const exec = cmd_1.pacman_exec[params.pacman];
    output_instance.start_loading(`Bundling service ws...`);
    let cmd_service = '';
    cmd_service += `${exec} esbuild ${build_params.root}/dist/service/ws.js`;
    cmd_service += `--bundle`;
    cmd_service += `--platform=node`;
    cmd_service += `--minify`;
    cmd_service += `--outfile=${build_params.root}/${defaults_1.defaults.folder}/bundles/ws.bundle.js`;
    await util_instance.spawn.native_promise(cmd_service, 'bundling webservice');
}
// @ts-ignore
async function _bundle_panel_index(params) {
    const exec = cmd_1.pacman_exec[params.pacman];
    output_instance.start_loading(`Bundling panel index...`);
    let cmd_service = '';
    cmd_service += `${exec} esbuild ${build_params.root}/dist/panel/index.js`;
    cmd_service += `--bundle`;
    cmd_service += `--platform=node`;
    cmd_service += `--minify`;
    cmd_service += `--outfile=${build_params.root}/${defaults_1.defaults.folder}/bundles/panel.bundle.js`;
    await util_instance.spawn.native_promise(cmd_service, 'bundling panel');
}
function _init_build(params) {
    build_params = (0, common_1.merge_params)(params);
    output_instance = output.create(build_params);
    util_instance = util.create(build_params, output_instance);
}
//# sourceMappingURL=build.js.map