"use strict";
/**
 * Generate command module
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
exports.generate = void 0;
const fs_1 = __importDefault(require("fs"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const transpose_1 = require("./transpose");
const cli_options = {
    hide: false,
    verbose: true,
};
exports.generate = {
    run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
        defaults_1.conf.root = root;
        common.init_run(options);
        yield exports.generate.command();
    }),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Generating...');
        util.read_rc_file();
        const client_folder = `${defaults_1.conf.root}/src/client/.`;
        if (!fs_1.default.existsSync(client_folder)) {
            output.wrong_end_log(`No such file or directory [${client_folder}]`);
            process.exit(0);
        }
        util.copy_folder_recursive_sync(client_folder, `${defaults_1.conf.root}/.uranio/client/src/.`);
        transpose_1.transpose.run(defaults_1.conf.root, undefined, cli_options);
        // util.sync_exec(`npx tsc -b --verbose`);
        // util.sync_exec(`npx nuxt generate -c .uranio/client/nuxt.config.js`);
        // util.spawn_log_command(`npx tsc -b --verbose`, `gnrt`, '');
        // util.spawn_log_command(`npx nuxt generate -c .uranio/client/nuxt.config.js`, `gnrt`, '');
        yield new Promise((resolve, reject) => {
            util.spawn_cmd(`npx tsc -b --verbose`, `tscb`, `Compiling Typescript server.`, resolve, reject);
        });
        output.done_log(`tscb`, `Compiled server.`);
        yield new Promise((resolve, reject) => {
            util.spawn_cmd(`npx nuxt generate -c .uranio/client/nuxt.config.js`, `nuxt`, `Generating nuxt file.`, resolve, reject);
        });
        output.done_log(`tscb`, `Compiled client.`);
        output.end_log(`Generate completed.`);
    })
};
//# sourceMappingURL=generate.js.map