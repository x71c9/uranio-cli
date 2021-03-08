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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const output = __importStar(require("../log/"));
const util = __importStar(require("../util/"));
exports.dev = {
    run: (args) => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Developing...');
        util.check_if_initialized();
        _start_dev(args);
    })
};
function _start_dev(args) {
    return __awaiter(this, void 0, void 0, function* () {
        args;
        return new Promise((resolve, reject) => {
            const register = `-r source-map-support/register -r module-alias/register`;
            const node_run = `node ${register} ./dist/src/index.js`;
            const on_success = `uranio transpose && ${node_run}`;
            const cmd = `npx tsc-watch --onSuccess "${on_success}"`;
            util.spawn_cmd(cmd, 'dev', 'Developing', resolve, reject);
        });
    });
}
//# sourceMappingURL=dev.js.map