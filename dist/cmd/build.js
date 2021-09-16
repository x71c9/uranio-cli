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
const hooks_1 = require("./hooks");
const transpose_1 = require("./transpose");
const cli_options = {
    hide: false,
    verbose: true,
};
exports.build = {
    run: (root, options) => __awaiter(void 0, void 0, void 0, function* () {
        defaults_1.conf.root = root;
        common.init_run(options);
        yield exports.build.command();
    }),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Building...');
        util.read_rc_file();
        transpose_1.transpose.run(defaults_1.conf.root, undefined, cli_options);
        if (defaults_1.conf.repo === 'trx') {
            hooks_1.hooks.run(cli_options);
        }
        defaults_1.conf.spinner = true;
        // util.sync_exec(`cd ${conf.root}/.uranio/server/ && npx tsc -b`);
        // util.sync_exec(`cd ${conf.root}/.uranio/client/ && npx nuxt generate -c ./nuxt.config.js`);
        yield new Promise((resolve, reject) => {
            util.spawn_cmd(`cd ${defaults_1.conf.root}/.uranio/server/ && npx tsc -b --verbose`, `tscb`, `Compiling Typescript server.`, resolve, reject);
        });
        output.done_log(`tscb`, `Compiled server.`);
        yield new Promise((resolve, reject) => {
            util.spawn_cmd(`cd ${defaults_1.conf.root}/.uranio/client/ && npx nuxt generate -c ./nuxt.config.js`, `nuxt`, `Generating nuxt file.`, resolve, reject);
        });
        output.done_log(`tscb`, `Compiled client.`);
        output.end_log(`Build completed.`);
    })
};
//# sourceMappingURL=build.js.map