#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args_1 = require("./args/");
const process_1 = require("./process");
const args = args_1.parser(process.argv.slice(2));
process_1.urn_process(args);
//# sourceMappingURL=urn-cli.js.map