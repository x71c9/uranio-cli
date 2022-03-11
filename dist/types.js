"use strict";
/**
 * Type module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.valid_db = exports.valid_pacman = exports.valid_admin_repos = exports.valid_hooks_repos = exports.valid_client_repos = exports.valid_deploy_repos = exports.valid_repos = exports.abstract_db = exports.abstract_pacman = exports.abstract_admin_repos = exports.abstract_hooks_repos = exports.abstract_deploy_repos = exports.abstract_repos = void 0;
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
// export const abstract_deploy = {
//   netlify: '',
//   express: '',
// } as const;
exports.abstract_db = {
    mongo: ''
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
function valid_client_repos() {
    return valid_hooks_repos();
}
exports.valid_client_repos = valid_client_repos;
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
// export function valid_deploy()
//     :string[]{
//   const vals:string[] = [];
//   for(const k in abstract_deploy){
//     vals.push(k);
//   }
//   return vals;
// }
function valid_db() {
    const vals = [];
    for (const k in exports.abstract_db) {
        vals.push(k);
    }
    return vals;
}
exports.valid_db = valid_db;
//# sourceMappingURL=types.js.map