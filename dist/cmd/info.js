"use strict";
/**
 * Help command module
 *
 * @packageDocumentation
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
// import {title} from './title';
// import * as output from '../output/';
const chalk_1 = __importDefault(require("chalk"));
function info(params) {
    return __awaiter(this, void 0, void 0, function* () {
        // title();
        console.log(`root:   ${_bold(params.root)}`);
        console.log(`repo:   ${_bold(params.repo)}`);
        console.log(`deploy: ${_bold(params.deploy)}`);
        console.log(`pacman: ${_bold(params.pacman)}`);
        process.exit(0);
    });
}
exports.info = info;
function _bold(str) {
    return chalk_1.default.bold(str);
}
//# sourceMappingURL=info.js.map