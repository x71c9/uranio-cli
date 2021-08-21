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
const fs_1 = __importDefault(require("fs"));
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
const transpose_1 = require("./transpose");
exports.dev = {
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.stop_loading();
        util.read_rc_file();
        defaults_1.conf.filelog = false;
        _start_dev();
    })
};
let watch_client_scanned = false;
let watch_server_scanned = false;
let watch_book_scanned = false;
let watch_lib_scanned = false;
const cli_options = {
    hide: false,
    verbose: true,
};
const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
function _start_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        const client_folder = `${defaults_1.conf.root}/src/client/.`;
        if (fs_1.default.existsSync(client_folder)) {
            util.copy_folder_recursive_sync(client_folder, `${defaults_1.conf.root}/.uranio/client/src/.`);
        }
        transpose_1.transpose.run(defaults_1.conf.root, undefined, cli_options);
        if (defaults_1.conf.deploy === 'netlify') {
            const ntl_cmd = `npx ntl dev`;
            util.spawn_log_command(ntl_cmd, 'ntlf', nuxt_color);
        }
        else {
            const nuxt_cmd = `npx nuxt -c ${defaults_1.defaults.folder}/client/nuxt.config.js`;
            util.spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
        }
        const tscw_cmd = `npx tsc -w --project ${defaults_1.conf.root}/tsconfig.json`;
        util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
        output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
        util.watch(client_folder, `watching client folder.`, () => {
            output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
            watch_client_scanned = true;
        }, (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_client_scanned) {
                return false;
            }
            if (_path.endsWith('.swp')) {
                return false;
            }
            const relative_path_to_client = _path.replace(`${defaults_1.conf.root}/src/client/`, '');
            const new_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/src/${relative_path_to_client}`;
            if (_event === 'unlink') {
                util.delete_file_sync(new_path);
            }
            else {
                output.log(`wtch`, `[Client watch] Copy file sync [${_path}] to [${new_path}]`);
                util.copy_file_sync(_path, new_path);
            }
        });
        const server_folder = `${defaults_1.conf.root}/src/server/.`;
        output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
        util.watch(server_folder, `watching server folder.`, () => {
            output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
            watch_server_scanned = true;
        }, (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_server_scanned) {
                return false;
            }
            const relative_path_to_server = _path.replace(`${defaults_1.conf.root}/src/server/`, '');
            const new_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/${relative_path_to_server}`;
            if (_event === 'unlink') {
                output.log(`wtch`, `[Server watch] Unlink [${_path}].`);
                util.delete_file_sync(new_path);
            }
            else {
                output.log(`wtch`, `[Server watch] Transpose [${_path}].`);
                transpose_1.transpose.run(defaults_1.conf.root, _path, cli_options);
            }
            _replace_netlify_function_file();
        });
        const book_path = `${defaults_1.conf.root}/src/book.ts`;
        output.log(`wtch`, `Watching Book file [${book_path}] ...`);
        util.watch(book_path, `watching book file.`, () => {
            output.log(`wtch`, `Initial scanner completed for [${book_path}].`);
            watch_book_scanned = true;
        }, (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_book_scanned) {
                return false;
            }
            if (_event !== 'unlink') {
                output.log(`wtch`, `[Book watch] Transpose [${_path}].`);
                transpose_1.transpose.run(defaults_1.conf.root, _path, cli_options);
            }
            _replace_netlify_function_file();
        });
        const lib_path = `${defaults_1.conf.root}/.uranio/lib/.`;
        output.log(`wtch`, `Watching Lib folder [${lib_path}] ...`);
        util.watch(lib_path, `watching lib folder.`, () => {
            output.log(`wtch`, `Initial scanner completed for [${lib_path}].`);
            watch_lib_scanned = true;
        }, (_event, _path) => {
            if (_event !== 'add' && _event !== 'addDir') {
                output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            }
            if (!watch_lib_scanned) {
                return false;
            }
            _replace_netlify_function_file();
        });
    });
}
function _replace_netlify_function_file() {
    const api_file_path = `${defaults_1.conf.root}/.uranio/server/functions/api.ts`;
    const result = fs_1.default.readFileSync(api_file_path);
    let new_content = result.toString();
    const splitted = new_content.split(`\n`);
    const comment = '// uranio autoupdate';
    if (splitted[splitted.length - 1] === comment) {
        splitted.splice(-1);
        new_content = splitted.join('\n');
    }
    else {
        new_content += `\n${comment}`;
    }
    fs_1.default.writeFileSync(api_file_path, new_content, 'utf8');
}
//# sourceMappingURL=dev.js.map