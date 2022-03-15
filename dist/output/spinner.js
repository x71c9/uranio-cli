"use strict";
/**
 * Output class
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner_texts = exports.spinner = void 0;
const ora_1 = __importDefault(require("@nbl7/ora"));
exports.spinner = (0, ora_1.default)({ text: 'Loading...', hex: '#A633FF', interval: 40 });
exports.spinner_texts = [];
//# sourceMappingURL=spinner.js.map