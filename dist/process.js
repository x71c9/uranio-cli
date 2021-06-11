"use strict";
/**
 * Process module
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
exports.urn_process = void 0;
const fs_1 = __importDefault(require("fs"));
const cp = __importStar(require("child_process"));
const cmd_1 = require("./cmd/");
const defaults_1 = require("./conf/defaults");
const output = __importStar(require("./log/"));
function urn_process(args) {
    _init_global();
    _read_options(args);
    _init_log();
    _get_project_root();
    _log_arguments(args);
    _switch_command(args);
    // process.exit(1);
}
exports.urn_process = urn_process;
function _init_log() {
    if (!fs_1.default.existsSync(defaults_1.defaults.log_filepath)) {
        cp.execSync(`touch ${defaults_1.defaults.log_filepath}`);
    }
}
function _init_global() {
    global.uranio = {
        root: '.',
        repo: defaults_1.defaults.default_repo
    };
}
function _check_folder(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    for (const file of data) {
        if (file === 'package.json') {
            const content = fs_1.default.readFileSync(`${folder_path}/${file}`, 'utf8');
            const pack = JSON.parse(content);
            if (pack.name === 'urn-cli') {
                return false;
            }
            else if (pack.name === 'uranio') {
                const bld_path = `${folder_path}/urn-bld`;
                if (!fs_1.default.existsSync(bld_path)) {
                    return false;
                }
                global.uranio.root = bld_path;
                return true;
            }
            global.uranio.root = folder_path;
            return true;
        }
    }
    return false;
}
function _get_project_root() {
    output.start_loading('Getting project root...');
    let folder_path = process.cwd();
    while (!_check_folder(folder_path)) {
        const arr_folder = folder_path.split('/');
        arr_folder.pop();
        folder_path = arr_folder.join('/');
        if (folder_path === '/') {
            throw new Error('Cannot find project root.');
        }
    }
    process.chdir(global.uranio.root);
    output.done_verbose_log('root', `$URNROOT$Project root found [${global.uranio.root}]`);
}
function _log_arguments(args) {
    output.verbose_log('args', JSON.stringify(args));
}
function _read_options(args) {
    const verbose = args.v || args.verbose;
    if (verbose === true) {
        defaults_1.conf.verbose = true;
    }
    const colors = args['colors'];
    if (colors === false) {
        defaults_1.conf.colors = false;
    }
    const log = args['log'];
    if (log === false) {
        defaults_1.conf.output = false;
    }
}
function _switch_command(args) {
    let cmd = args._[0] || '';
    if (args.version) {
        cmd = 'version';
    }
    if (args.help || args.h) {
        cmd = 'help';
    }
    switch (cmd) {
        case '':
        case 'version': {
            output.stop_loading();
            console.log('v0.0.1');
            break;
        }
        case 'init': {
            cmd_1.init.run(args);
            break;
        }
        case 'transpose': {
            cmd_1.transpose.run();
            break;
        }
        case 'dev': {
            cmd_1.dev.run();
            break;
        }
        case 'help': {
            cmd_1.help.run();
            break;
        }
        case 'test': {
            cmd_1.test.run();
            break;
        }
        default: {
            console.log('Command not found.');
        }
    }
}
//# sourceMappingURL=process.js.map