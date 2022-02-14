#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./args/index");
const process_1 = require("./process");
const args = (0, index_1.parser)(process.argv.slice(2));
(0, process_1.uranio_process)(args);
//# sourceMappingURL=sh.js.map