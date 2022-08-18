"use strict";
/**
 * Help command module
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
exports.info = void 0;
// import fs from 'fs';
const chalk_1 = __importDefault(require("chalk"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const docker = __importStar(require("../cmd/docker"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let info_params = defaults_1.default_params;
async function info(params) {
    _info_init(params);
    _check_if_is_initialized();
    console.log(`root:   ${_bold(info_params.root)}`);
    console.log(`repo:   ${_bold(info_params.repo)}`);
    console.log(`pacman: ${_bold(info_params.pacman)}`);
    _console_docker();
    process.exit(0);
}
exports.info = info;
function _info_init(params) {
    info_params = (0, common_1.merge_params)(params);
    output_instance = output.create(info_params);
    util_instance = util.create(info_params, output_instance);
}
function _console_docker() {
    if (docker.is_docker_compiled(info_params)) {
        console.log(`docker: true`);
    }
}
function _repo_not_initialized() {
    output_instance.info_log(`This repo is not initialized. In order to initialize it run: \`uranio init\`.`);
    process.exit(0);
}
function _check_if_is_initialized() {
    if (!util_instance.fs.exists(`${info_params.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.init_filepath}`)) {
        _repo_not_initialized();
    }
}
function _bold(str) {
    return chalk_1.default.bold(str);
}
//# sourceMappingURL=info.js.map