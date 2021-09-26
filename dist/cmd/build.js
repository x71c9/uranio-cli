"use strict";
/**
 * Build command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
// const cli_options = {
//   hide: false,
//   verbose: false,
// };
// import {server} from './server';
// import {client} from './client';
let done_building_server = false;
let building_server = false;
let done_building_client = false;
let building_client = false;
const tscw_color = '#734de3';
const nuxt_color = '#677cc7';
exports.build = {
    run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
        defaults_1.conf.root = root;
        common.init_run(options);
        yield exports.build.command();
    }),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Building...');
        util.read_rc_file();
        exports.build.server();
        exports.build.client();
        // output.end_log(`Building completed.`);
    }),
    server: () => {
        output.start_loading('Building server...');
        building_server = true;
        defaults_1.conf.spinner = true;
        output.start_loading(`Building server...`);
        util.read_rc_file();
        // transpose.run(conf.root, undefined, {verbose: true});
        const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/server`;
        // const ts_cmd = `npx tsc -b --verbose`;
        const ts_cmd = `npx tsc -b`;
        const cmd = `${cd_cmd} && ${ts_cmd}`;
        output.log(cmd, 'srv');
        util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
            if (building_client) {
                output.done_log(`Building server completed.`, 'tscb');
                done_building_server = true;
                if (done_building_client === true) {
                    output.end_log(`Building completed.`);
                }
            }
            else {
                output.end_log(`Building server completed.`);
            }
        });
    },
    client: (args) => {
        output.start_loading('Building client...');
        building_client = true;
        defaults_1.conf.spinner = true;
        output.start_loading(`Building client...`);
        // transpose.run(conf.root, undefined, {verbose: true});
        util.read_rc_file();
        const native = (args === null || args === void 0 ? void 0 : args.native) || false;
        const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/client`;
        const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
        const cmd = `${cd_cmd} && ${nu_cmd}`;
        output.log(cmd, 'clnt');
        const callback = () => {
            if (building_server) {
                output.done_log(`Building client completed.`, 'gnrt');
                done_building_client = true;
                if (done_building_server === true) {
                    output.end_log(`Building completed.`);
                }
            }
            else {
                output.end_log(`Building client completed.`);
            }
        };
        if (native === true) {
            util.spawn_native_log_command(cmd, 'nuxt', nuxt_color, callback);
        }
        else {
            util.spawn_log_command(cmd, 'nuxt', nuxt_color, callback);
        }
    }
};
//# sourceMappingURL=build.js.map