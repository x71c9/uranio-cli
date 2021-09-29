"use strict";
// import urn_cli from './index';
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
// urn_cli.init('./');
// urn_cli.transpose('/home/nbl7/repos/urn-tst');
// SPAWN IN SPINNER
// SPAWN AND LOG
// SPAWN NATIVE LOG
// EXECUTE / SPAWN NO LOG
// LOG NATIVE
// COPY FILE FILES FOLDERS DELETE ...
const spawn = __importStar(require("./util/spawn"));
const out = __importStar(require("./output/"));
const output = out.create({
    verbose: true,
    spin: false,
    native: false,
    blank: false,
    hide: false,
    fullwidth: false
});
const spa = spawn.create(output);
spa.exec_sync('rm -rf /home/nbl7/tmp/urn-dot');
const cmd = 'git clone ssh+git://git@bitbucket.org/nbl7/urn-dot.git /home/nbl7/tmp/urn-dot';
// const cmd = 'ls -a';
function run() {
    return new Promise((res, rej) => {
        spa.verbose_log(cmd, 'tst', 'action', res, rej);
    });
}
run().then(() => {
    output.stop_loading();
    console.log('DONE');
}).catch((err) => {
    output.stop_loading();
    console.log('ERROR', err);
});
// console.log('TEST');
//# sourceMappingURL=test.js.map