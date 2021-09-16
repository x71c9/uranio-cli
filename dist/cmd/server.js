"use strict";
/**
 * Server commands module
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
exports.server = exports.building_server = exports.done_building_server = void 0;
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const client_1 = require("./client");
const tscw_color = '#734de3';
exports.done_building_server = false;
exports.building_server = false;
exports.server = {
    dev: {
        run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
            defaults_1.conf.root = root;
            common.init_run(options);
            yield exports.server.dev.command();
        }),
        command: () => __awaiter(void 0, void 0, void 0, function* () {
            output.stop_loading();
            util.read_rc_file();
            const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/server`;
            const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
            util.spawn_log_command(`${cd_cmd} && ${ts_cmd}`, 'tscw', tscw_color);
        })
    },
    build: {
        run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
            defaults_1.conf.root = root;
            common.init_run(options);
            exports.server.build.command();
        }),
        command: () => __awaiter(void 0, void 0, void 0, function* () {
            exports.building_server = true;
            defaults_1.conf.spinner = true;
            output.start_loading(`Building server...`);
            util.read_rc_file();
            const cd_cmd = `cd ${defaults_1.conf.root}/.uranio/server`;
            // const ts_cmd = `npx tsc -b --verbose`;
            const ts_cmd = `npx tsc -b`;
            const cmd = `${cd_cmd} && ${ts_cmd}`;
            output.log(`srv`, cmd);
            util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
                if (client_1.building_client) {
                    output.done_log(`tscb`, `Building server completed.`);
                    exports.done_building_server = true;
                    if (client_1.done_building_client === true) {
                        output.end_log(`Building completed.`);
                    }
                }
                else {
                    output.end_log(`Building server completed.`);
                }
            });
        })
    }
};
//# sourceMappingURL=server.js.map