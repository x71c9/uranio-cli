"use strict";
/**
 * Help command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const title_1 = require("./title");
const output = __importStar(require("../log/"));
exports.help = {
    run: () => {
        output.stop_loading();
        title_1.title();
        console.log(``);
        console.log(`uranio [command] <options>`);
        console.log(``);
        console.log(`init ............... init uranio repo`);
        console.log(`version ............ show package version`);
        console.log(`help ............... show help menu for a command`);
        console.log(``);
        console.log(``);
        process.exit(0);
    }
};
//# sourceMappingURL=help.js.map