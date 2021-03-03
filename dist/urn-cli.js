#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args_1 = require("./args/");
const process_1 = require("./process");
const args = args_1.parser(process.argv.slice(2));
process_1.urn_process(args);
// import * as output from './log/';
// output.start_loading('A', 'Some');
// _anot();
// function _anot(){
//   output.start_loading('B', 'Some 2');
//   output.verbose_log('sss', 'VVEVVEVE');
//   _som();
//   output.done_log('B', 'd', 'AAAAA DOne');
// }
// function _som(){
//   output.start_loading('c', 'Some dkfhjds');
//   output.done_log('c', 'ddd', 'AAAAA DOdsalfjlksjafne');
// }
//# sourceMappingURL=urn-cli.js.map