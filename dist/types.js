"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_pacman = exports.valid_repos = exports.abstract_pacman = exports.abstract_repos = void 0;
exports.abstract_repos = {
    core: '',
    web: '',
    ntl: ''
};
exports.abstract_pacman = {
    yarn: '',
    npm: '',
};
function valid_repos() {
    const vals = [];
    for (const k in exports.abstract_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_repos = valid_repos;
function valid_pacman() {
    const vals = [];
    for (const k in exports.abstract_pacman) {
        vals.push(k);
    }
    return vals;
}
exports.valid_pacman = valid_pacman;
// export type Conf = Options & {
// root: string,
// repo: Repo
// }
//# sourceMappingURL=types.js.map