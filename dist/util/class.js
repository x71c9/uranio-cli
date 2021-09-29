"use strict";
/**
 * Util module
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
exports.create = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const prettier_1 = __importDefault(require("prettier"));
const fs = __importStar(require("./fs"));
const spawn = __importStar(require("./spawn"));
const cmd = __importStar(require("./cmd"));
const watch_child_list = [];
process.on('SIGINT', function () {
    process.stdout.write("\r--- Caught interrupt signal [watch] ---\n");
    for (let i = 0; i < watch_child_list.length; i++) {
        const watch_child_object = watch_child_list[i];
        watch_child_object.child.close().then(() => {
            process.stdout.write(`Stopped ${watch_child_object.text}\n`);
        });
    }
});
class Util {
    constructor(params, output) {
        this.params = params;
        this.output = output;
        this.fs = fs.create(output);
        this.spawn = spawn.create(output);
        this.cmd = cmd.create(params, output);
    }
    watch(watch_path, watch_text, on_ready, on_all) {
        const watch_child = chokidar_1.default.watch(watch_path).on('ready', on_ready).on('all', on_all);
        watch_child_list.push({
            child: watch_child,
            context: `wtch`,
            text: watch_text
        });
    }
    pretty(filepath, parser = 'typescript') {
        this.output.start_loading(`Prettier [${filepath}]...`);
        const content = this.fs.read_file_sync(filepath, 'utf8');
        const pretty_string = prettier_1.default.format(content, { useTabs: true, tabWidth: 2, parser: parser });
        this.fs.write_file_sync(filepath, pretty_string);
        this.output.done_verbose_log(`Prettier [${filepath}] done.`, 'prtt');
    }
}
function create(params, output) {
    return new Util(params, output);
}
exports.create = create;
//# sourceMappingURL=class.js.map