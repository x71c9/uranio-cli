"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_deploy = exports.valid_pacman = exports.valid_admin_repos = exports.valid_hooks_repos = exports.valid_deploy_repos = exports.valid_repos = exports.abstract_deploy = exports.abstract_pacman = exports.abstract_admin_repos = exports.abstract_hooks_repos = exports.abstract_deploy_repos = exports.abstract_repos = void 0;
exports.abstract_repos = {
    core: '',
    api: '',
    trx: '',
    adm: ''
};
exports.abstract_deploy_repos = {
    api: '',
    trx: '',
    adm: ''
};
exports.abstract_hooks_repos = {
    trx: '',
    adm: ''
};
exports.abstract_admin_repos = {
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
function valid_deploy_repos() {
    const vals = [];
    for (const k in exports.abstract_deploy_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_deploy_repos = valid_deploy_repos;
function valid_hooks_repos() {
    const vals = [];
    for (const k in exports.abstract_hooks_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_hooks_repos = valid_hooks_repos;
function valid_admin_repos() {
    const vals = [];
    for (const k in exports.abstract_admin_repos) {
        vals.push(k);
    }
    return vals;
}
exports.valid_admin_repos = valid_admin_repos;
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
//# sourceMappingURL=types.js.map