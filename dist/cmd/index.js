"use strict";
/**
 * Index module for commands
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docker = void 0;
__exportStar(require("./init"), exports);
// export * from './alias';
__exportStar(require("./generate"), exports);
__exportStar(require("./build"), exports);
__exportStar(require("./dev"), exports);
__exportStar(require("./transpose"), exports);
// export * from './hooks';
__exportStar(require("./info"), exports);
__exportStar(require("./help"), exports);
var docker_1 = require("./docker");
Object.defineProperty(exports, "docker", { enumerable: true, get: function () { return docker_1.docker; } });
__exportStar(require("./deinit"), exports);
// export * from './dot';
//# sourceMappingURL=index.js.map