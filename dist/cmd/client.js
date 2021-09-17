"use strict";
/**
 * Client commands module
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
exports.client = exports.building_client = exports.done_building_client = void 0;
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
// import {transpose} from './transpose';
const server_1 = require("./server");
const nuxt_color = '#677cc7';
exports.done_building_client = false;
exports.building_client = false;
exports.client = {
    dev: {
        run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
            defaults_1.conf.root = root;
            common.init_run(options);
            yield exports.client.dev.command();
        }),
        command: (args) => __awaiter(void 0, void 0, void 0, function* () {
            output.stop_loading();
            util.read_rc_file();
            const native = (args === null || args === void 0 ? void 0 : args.native) || false;
            const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/client`;
            const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
            if (native === true) {
                util.spawn_native_log_command(`${cd_cmd} && ${nu_cmd}`, 'nuxt', nuxt_color);
            }
            else {
                util.spawn_log_command(`${cd_cmd} && ${nu_cmd}`, 'nuxt', nuxt_color);
            }
        })
    },
    build: {
        run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
            defaults_1.conf.root = root;
            common.init_run(options);
            exports.client.build.command();
        }),
        command: (args) => __awaiter(void 0, void 0, void 0, function* () {
            exports.building_client = true;
            defaults_1.conf.spinner = true;
            output.start_loading(`Building client...`);
            // transpose.run(conf.root, undefined, {verbose: true});
            util.read_rc_file();
            const native = (args === null || args === void 0 ? void 0 : args.native) || false;
            const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/client`;
            const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
            const cmd = `${cd_cmd} && ${nu_cmd}`;
            output.log(`clnt`, cmd);
            const callback = () => {
                if (server_1.building_server) {
                    output.done_log(`gnrt`, `Building client completed.`);
                    exports.done_building_client = true;
                    if (server_1.done_building_server === true) {
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
        })
    }
};
//# sourceMappingURL=client.js.map