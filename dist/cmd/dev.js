"use strict";
/**
 * Init command module
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
exports.dev = void 0;
const cp = __importStar(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const chalk_1 = __importDefault(require("chalk"));
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
const transpose_1 = require("./transpose");
exports.dev = {
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.stop_loading();
        util.read_rc_file();
        _start_dev();
    })
};
let watch_client_scanned = false;
let watch_server_scanned = false;
// let watch_transposed_server_scanned = false;
const cli_options = {
    hide: false,
    verbose: true,
    prefix: chalk_1.default.green('[urn] ')
};
function _start_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        defaults_1.conf.prefix = chalk_1.default.green(`[urn] `);
        copyFolderRecursiveSync(`${defaults_1.conf.root}/src/client/.`, `${defaults_1.conf.root}/.uranio/client/src/.`);
        transpose_1.transpose.run(defaults_1.conf.root, cli_options);
        const nuxt_dev = cp.spawn('npx', [`nuxt`, `-c`, `.uranio/client/nuxt.config.js`]);
        const tsc_watch = cp.spawn('npx', [`tsc`, `-w`, `--project`, `${defaults_1.conf.root}/tsconfig.json`]);
        if (nuxt_dev.stdout) {
            nuxt_dev.stdout.setEncoding('utf8');
            nuxt_dev.stdout.on('data', (chunk) => {
                const plain_text = chunk
                    .toString()
                    .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
                    .replace(/\r?\n|\r/g, ' ');
                output.verbose_log('nuxt', plain_text);
            });
        }
        if (nuxt_dev.stderr) {
            nuxt_dev.stderr.setEncoding('utf8');
            nuxt_dev.stderr.on('data', (chunk) => {
                const plain_text = chunk
                    .toString()
                    .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
                    .replace(/\r?\n|\r/g, ' ');
                output.verbose_log('nuxt', plain_text);
            });
        }
        if (tsc_watch.stdout) {
            tsc_watch.stdout.setEncoding('utf8');
            tsc_watch.stdout.on('data', (chunk) => {
                const plain_text = chunk
                    .toString()
                    .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
                    .replace(/\r?\n|\r/g, ' ');
                output.verbose_log('tscw', plain_text);
            });
        }
        if (tsc_watch.stderr) {
            tsc_watch.stderr.setEncoding('utf8');
            tsc_watch.stderr.on('data', (chunk) => {
                const plain_text = chunk
                    .toString()
                    .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
                    .replace(/\r?\n|\r/g, ' ');
                output.verbose_log('tscw', plain_text);
            });
        }
        const client_folder = `${defaults_1.conf.root}/src/client/.`;
        output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
        const watch_client = chokidar_1.default.watch(client_folder).on('ready', () => {
            output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
            watch_client_scanned = true;
        }).on('all', (_event, _path) => {
            output.verbose_log(_event, _path);
            if (!watch_client_scanned) {
                return false;
            }
            copyFolderRecursiveSync(`${defaults_1.conf.root}/src/client/.`, `${defaults_1.conf.root}/.uranio/client/src/.`);
        });
        const server_folder = `${defaults_1.conf.root}/src/server/.`;
        output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
        const watch_server = chokidar_1.default.watch(server_folder).on('ready', () => {
            output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
            watch_server_scanned = true;
        }).on('all', (_event, _path) => {
            output.verbose_log(_event, _path);
            if (!watch_server_scanned) {
                return false;
            }
            transpose_1.transpose.run(defaults_1.conf.root, cli_options);
        });
        // const transposed_server_folder = `${conf.root}/${defaults.folder}/server/.`;
        // output.log(`wtch`, `Watching Transposed Server Folder [${server_folder}] ...`);
        // const watch_transposed_server = chokidar.watch(transposed_server_folder).on('ready', () => {
        //   output.log(`wtch`, `Initial scanner completed for [${transposed_server_folder}].`);
        //   watch_transposed_server_scanned = true;
        // }).on('all', (_event, _path) => {
        //   output.verbose_log(_event, _path);
        //   if(!watch_transposed_server_scanned){
        //     return false;
        //   }
        // });
        process.on('SIGINT', function () {
            watch_client.close().then(() => {
                output.log(`wtch`, 'Stop watching client folder.');
            });
            watch_server.close().then(() => {
                output.log(`wtch`, 'Stop watching server folder.');
            });
            // watch_transposed_server.close().then(() => {
            //   output.log(`wtch`, 'Stop watching transposed server folder.');
            // });
            process.stdout.write("\r--- Caught interrupt signal ---\n");
            if (nuxt_dev.pid) {
                process.kill(nuxt_dev.pid);
            }
            if (tsc_watch.pid) {
                process.kill(tsc_watch.pid);
            }
        });
    });
}
function copyFileSync(source, target) {
    let targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs_1.default.existsSync(target)) {
        if (fs_1.default.lstatSync(target).isDirectory()) {
            targetFile = path_1.default.join(target, path_1.default.basename(source));
        }
    }
    fs_1.default.writeFileSync(targetFile, fs_1.default.readFileSync(source));
}
//
function copyFolderRecursiveSync(source, target) {
    let files = [];
    // Check if folder needs to be created or integrated
    const targetFolder = path_1.default.join(target, path_1.default.basename(source));
    if (!fs_1.default.existsSync(targetFolder)) {
        fs_1.default.mkdirSync(targetFolder);
    }
    // Copy
    if (fs_1.default.lstatSync(source).isDirectory()) {
        files = fs_1.default.readdirSync(source);
        files.forEach(function (file) {
            const curSource = path_1.default.join(source, file);
            if (fs_1.default.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            }
            else if (!curSource.endsWith('.swp')) {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}
//# sourceMappingURL=dev.js.map