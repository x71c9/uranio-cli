"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_deploy = exports.valid_pacman = exports.valid_repos = exports.abstract_deploy = exports.abstract_pacman = exports.abstract_repos = void 0;
exports.abstract_repos = {
    core: '',
    api: '',
    trx: '',
    adm: ''
};
exports.abstract_pacman = {
    yarn: '',
    npm: '',
};
exports.abstract_deploy = {
    netlify: '',
    express: '',
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
function valid_deploy() {
    const vals = [];
    for (const k in exports.abstract_deploy) {
        vals.push(k);
    }
    return vals;
}
exports.valid_deploy = valid_deploy;
// export type Conf = Options & {
// root: string,
// repo: Repo
// }
//# sourceMappingURL=types.js.map