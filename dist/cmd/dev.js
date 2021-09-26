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
const hooks_1 = require("./hooks");
exports.dev = {
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.stop_loading();
        util.read_rc_file();
        defaults_1.conf.filelog = false;
        _start_dev();
    }),
    server: () => {
        output.stop_loading();
        util.read_rc_file();
        const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/server`;
        const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
        const cmd = `${cd_cmd} && ${ts_cmd}`;
        output.verbose_log(cmd, 'dev');
        util.spawn_log_command(cmd, 'tscw', tscw_color);
    },
    client: (args) => {
        output.stop_loading();
        util.read_rc_file();
        const native = (args === null || args === void 0 ? void 0 : args.native) || false;
        const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/client`;
        const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
        const cmd = `${cd_cmd} && ${nu_cmd}`;
        output.verbose_log(cmd, 'dev');
        if (native === true) {
            util.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
        }
        else {
            util.spawn_log_command(cmd, 'nuxt', nuxt_color);
        }
    }
};
// let watch_client_scanned = false;
// let watch_server_scanned = false;
// let watch_book_scanned = false;
let watch_lib_scanned = false;
let watch_src_scanned = false;
const cli_options = {
    hide: false,
    verbose: true,
};
const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
function _start_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        cli_options.verbose = defaults_1.conf.verbose;
        transpose_1.transpose.run(defaults_1.conf.root, undefined, cli_options);
        if (defaults_1.conf.repo === 'trx') {
            hooks_1.hooks.run(cli_options);
        }
        if (defaults_1.conf.deploy === 'netlify') {
            const ntl_cmd = `npx ntl dev`;
            util.spawn_log_command(ntl_cmd, 'ntlf', nuxt_color);
        }
        else {
            const nuxt_cmd = `cd ${defaults_1.conf.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`;
            util.spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
        }
        const tscw_cmd = `cd ${defaults_1.conf.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`;
        util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
        const src_path = `${defaults_1.conf.root}/src/`;
        output.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch', watc_color);
        util.watch(src_path, `watching \`src\` folder.`, () => {
            output.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
            watch_src_scanned = true;
        }, (_event, _path) => {
            output.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            if (!watch_src_scanned) {
                return false;
            }
            if (_event !== 'unlink') {
                transpose_1.transpose.run(defaults_1.conf.root, _path, cli_options);
                if (defaults_1.conf.repo === 'trx') {
                    hooks_1.hooks.run(cli_options);
                }
                output.done_log(`[Book watch] Transposed [${_path}].`, 'wtch');
            }
            else {
                const relative_path = _path.replace(`${defaults_1.conf.root}/src/`, '');
                const new_path_server = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/src/${relative_path}`;
                const new_path_client = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/src/${relative_path}`;
                util.delete_file_sync(new_path_server);
                util.delete_file_sync(new_path_client);
            }
            _replace_netlify_function_file();
        });
        const lib_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/`;
        output.log(`Watching uranio repo folder [${lib_path}] ...`, 'wtch', watc_color);
        util.watch(lib_path, `watching uranio repo folder.`, () => {
            output.done_log(`Initial scanner completed for [${lib_path}].`, 'wtch');
            watch_lib_scanned = true;
        }, (_event, _path) => {
            output.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            if (!watch_lib_scanned) {
                return false;
            }
            _replace_netlify_function_file();
        });
    });
}
function _replace_netlify_function_file() {
    const api_file_path = `${defaults_1.conf.root}/.uranio/server/src/functions/api.ts`;
    const result = fs_1.default.readFileSync(api_file_path);
    let new_content = result.toString();
    const splitted = new_content.split(`\n`);
    const comment = '// uranio autoupdate';
    if (splitted[splitted.length - 2] !== comment) {
        new_content += `\n${comment}`;
        new_content += `\n// 0`;
    }
    else {
        const last_update = splitted.splice(-1);
        const last_update_split = last_update[0].split(' ');
        const update_number = Number(last_update_split[1]);
        new_content = splitted.join('\n');
        new_content += `\n// ${update_number + 1}`;
    }
    fs_1.default.writeFileSync(api_file_path, new_content, 'utf8');
    output.verbose_log(`Replacing Netlify serverless function file.`, 'less');
}
//# sourceMappingURL=dev.js.map