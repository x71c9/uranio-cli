"use strict";
/**
 * Help command module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const title_1 = require("./title");
exports.help = {
    run: () => {
        title_1.title();
        console.log(``);
        console.log(`uranio [command] <options>`);
        console.log(``);
        console.log(`init ............... init uranio repo`);
        console.log(`version ............ show package version`);
        console.log(`help ............... show help menu for a command`);
    }
};
//# sourceMappingURL=help.js.map