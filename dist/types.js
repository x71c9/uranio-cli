"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_repos = void 0;
const repos = {
    core: '',
    web: ''
};
function valid_repos() {
    const vals = [];
    for (const k in repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_repos = valid_repos;
//# sourceMappingURL=types.js.map