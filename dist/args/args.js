"use strict";
/**
 * Module for parsing arguments
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
const minimist_1 = __importDefault(require("minimist"));
function parser(args, options) {
    return (0, minimist_1.default)(args, options);
}
exports.parser = parser;
//# sourceMappingURL=args.js.map