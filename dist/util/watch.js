"use strict";
/**
 * Util Watch
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.watch_child_list = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
exports.watch_child_list = [];
function watch(watch_path, watch_text, on_ready, on_all) {
    const watch_server = chokidar_1.default.watch(watch_path).on('ready', on_ready).on('all', on_all);
    exports.watch_child_list.push({
        child: watch_server,
        context: `wtch`,
        text: watch_text
    });
}
exports.watch = watch;
//# sourceMappingURL=watch.js.map