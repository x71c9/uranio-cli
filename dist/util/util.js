"use strict";
/**
 * Util
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relative_to_absolute_path = exports.pretty = void 0;
const fs_1 = __importDefault(require("fs"));
const prettier_1 = __importDefault(require("prettier"));
const output = __importStar(require("../output/"));
const defaults_1 = require("../conf/defaults");
function pretty(filepath, parser = 'typescript') {
    output.start_loading(`Prettier [${filepath}]...`);
    const content = fs_1.default.readFileSync(filepath, 'utf8');
    const pretty_string = prettier_1.default.format(content, { useTabs: true, tabWidth: 2, parser: parser });
    fs_1.default.writeFileSync(filepath, pretty_string);
    // cp.execSync(`npx prettier --write ${filepath} --use-tabs --tab-width 2`);
    output.done_verbose_log(`Prettier [${filepath}] done.`, 'prtt');
}
exports.pretty = pretty;
function relative_to_absolute_path(path) {
    if (path[path.length - 1] === '/') {
        path = path.substr(0, path.length - 1);
    }
    if (path[0] !== '/') {
        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }
        path = `${defaults_1.conf.root}/${path}`;
    }
    return path;
}
exports.relative_to_absolute_path = relative_to_absolute_path;
//# sourceMappingURL=util.js.map