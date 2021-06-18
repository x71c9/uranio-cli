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
    command: () => {
        output.stop_loading();
        title_1.title();
        console.log(``);
        console.log(`usage: uranio [command] <options>`);
        console.log(``);
        console.log(`commands:`);
        console.log(`  init ............... init uranio repo.`);
        console.log(`  dev ................ start uranio development mode.`);
        console.log(`  transpose .......... transpose atom books.`);
        console.log(`  version ............ show package version.`);
        console.log(`  help ............... show help menu [this one].`);
        console.log(``);
        console.log(`list of arguments`);
        console.log(`  -r --repo .......... set uranio repo to use.`);
        console.log(`  -s --root .......... set the project root folder.`);
        console.log(`  -v --verbose ....... log in verbose mode.`);
        console.log(`  -n --hide .......... do not output log.`);
        console.log(`  -b --blank ......... log with no colors.`);
        console.log(`  -f --fullwidth ..... log in full width.`);
        console.log(`  -p --prefix ........ set a log prefix.`);
        console.log(``);
        console.log(``);
        process.exit(0);
    }
};
//# sourceMappingURL=help.js.map