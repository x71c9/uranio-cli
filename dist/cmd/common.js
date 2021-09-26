"use strict";
/**
 * Common procedures among all "run" functions
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init_run = exports.init_log = void 0;
const fs_1 = __importDefault(require("fs"));
const cp = __importStar(require("child_process"));
const util = __importStar(require("../util/"));
const output = __importStar(require("../output/"));
const defaults_1 = require("../conf/defaults");
function init_log() {
    if (!fs_1.default.existsSync(`${defaults_1.conf.root}/${defaults_1.defaults.log_filepath}`)) {
        cp.execSync(`touch ${defaults_1.conf.root}/${defaults_1.defaults.log_filepath}`);
    }
}
exports.init_log = init_log;
function init_run(options) {
    defaults_1.conf.hide = true;
    defaults_1.conf.spinner = false;
    if (options) {
        util.merge_options(options);
    }
    if (!util.check_folder(defaults_1.conf.root)) {
        throw new Error(`Invalid root path [${defaults_1.conf.root}].`);
    }
    if (!util.check_repo(defaults_1.conf.repo)) {
        throw new Error(`Invalid repo [${defaults_1.conf.repo}].`);
    }
    init_log();
    _log_options();
}
exports.init_run = init_run;
function _log_options() {
    output.verbose_log(JSON.stringify(defaults_1.conf), 'opts');
}
//# sourceMappingURL=common.js.map