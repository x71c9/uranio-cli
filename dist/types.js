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
    ntl: ''
};
function valid_repos() {
    const vals = [];
    for (const k in exports.abstract_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_repos = valid_repos;
// export type Conf = Options & {
// root: string,
// repo: Repo
// }
//# sourceMappingURL=types.js.map