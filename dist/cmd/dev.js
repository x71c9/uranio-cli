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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = void 0;
const cp = __importStar(require("child_process"));
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
exports.dev = {
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.stop_loading();
        util.read_rc_file();
        _start_dev();
    })
};
function _start_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        const register = `-r source-map-support/register -r module-alias/register`;
        const node_run = `node ${register} ./dist/src/index.js`;
        const nodemon = cp.spawn('npx', [
            'nodemon',
            '--watch',
            'src/book.ts',
            '-e',
            'ts',
            '--exec',
            `npx uranio transpose`,
        ]);
        const tscwatch = cp.spawn('npx', ['tsc-watch', '--onSuccess', node_run], { stdio: [null, 'inherit', 'inherit'] });
        // const netlifydev = cp.spawn(
        //   'ntl',
        //   ['dev'],
        //   {stdio: [null, 'inherit', 'inherit']}
        // );
        process.on('SIGINT', function () {
            process.stdout.write("\r--- Caught interrupt signal ---\n");
            if (nodemon.pid) {
                process.kill(nodemon.pid);
            }
            if (tscwatch.pid) {
                process.kill(tscwatch.pid);
            }
            // process.kill(netlifydev.pid);
        });
    });
}
//# sourceMappingURL=dev.js.map