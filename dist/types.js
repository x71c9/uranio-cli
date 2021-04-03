"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_repos = exports.abstract_repos = void 0;
exports.abstract_repos = {
    core: '',
    web: '',
    fnc: ''
};
function valid_repos() {
    const vals = [];
    for (const k in exports.abstract_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_repos = valid_repos;
//# sourceMappingURL=types.js.map