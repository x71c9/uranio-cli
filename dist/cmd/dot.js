"use strict";
/**
 * Dev command module
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dot = void 0;
const child_process_1 = __importDefault(require("child_process"));
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const init_1 = require("./init");
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
let output_instance;
let util_instance;
const common_1 = require("./common");
let dot_params = defaults_1.default_params;
function dot(params, args) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        if (!(0, common_1.check_if_is_dot)(dot_params.root)) {
            output_instance.error_log(`Cannot run dot command outside uranio-dot repo.`);
            process.exit(1);
        }
        switch (args._[1]) {
            case 'switch': {
                yield _switch(args);
                break;
            }
            default: {
                output_instance.error_log(`Invalid dot command.`);
                process.exit(1);
            }
        }
    });
}
exports.dot = dot;
function _init_params(params) {
    params.color_log = '#AAAAAA';
    // params.blank = true;
    dot_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dot_params);
    util_instance = util.create(dot_params, output_instance);
    // util_instance.must_be_initialized();
}
function _switch(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let repo = (args._[2]);
        if (typeof repo === 'undefined' && typeof args.repo === 'string') {
            repo = args.repo;
        }
        let pacman = (args._[3] || 'yarn');
        if (typeof pacman === 'undefined' && typeof args.pacman === 'string') {
            pacman = args.pacman;
        }
        let deploy = (args._[4] || 'express');
        if (typeof deploy === 'undefined' && typeof args.deploy === 'string') {
            deploy = args.deploy;
        }
        const branch = (args._[5] || 'master');
        output_instance.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`, `args`);
        output_instance.log(`!!! Do not interrupt this process or you might end up in a corrupted repo !!!`, `args`);
        output_instance.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`, `args`);
        output_instance.log(`Selected repo: ${repo}`, `args`);
        output_instance.log(`Selected pacman: ${pacman}`, `args`);
        if ((0, types_1.valid_deploy_repos)().includes(repo)) {
            output_instance.log(`Selected deploy: ${deploy}`, `args`);
        }
        (0, common_1.check_repo)(repo);
        (0, common_1.check_pacman)(pacman);
        (0, common_1.check_deploy)(deploy);
        yield _check_if_clean_repo();
        yield _execute(`git checkout ${repo}`, 'git', 'checking out');
        output_instance.done_log(`Checked out ${repo}`);
        if (repo !== dot_params.repo) {
            const origin = defaults_1.defaults[`${repo}_repo`];
            const dest = `src/uranio`;
            yield _commit_previous_submodule();
            yield _deinit(dest);
            yield _add_submodule(repo, origin, dest, branch);
            yield _remove_node_modules_and_lock_files();
            yield _install_dependencies(pacman);
        }
        yield _uranio_init(repo, pacman, deploy);
    });
}
function _uranio_init(repo, pacman, deploy) {
    return __awaiter(this, void 0, void 0, function* () {
        const cloned_params = Object.assign({}, dot_params);
        const tscw_color = '#734de3';
        cloned_params.color_log = tscw_color;
        cloned_params.repo = repo;
        cloned_params.pacman = pacman;
        cloned_params.deploy = deploy;
        output_instance.log(`Initializing uranio ...`);
        yield (0, init_1.init)(cloned_params);
        output_instance.done_log(`Uranio initialized.`);
    });
}
function _check_if_clean_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        const output = child_process_1.default.execSync(`git status --porcelain`).toString();
        if (output === '') {
            output_instance.done_verbose_log('Working directory clean.');
        }
        else {
            output_instance.error_log('-------------------------------------------------------------');
            output_instance.error_log('Working directory not clean. Please commit before proceeding.');
            output_instance.error_log('-------------------------------------------------------------');
            process.exit(1);
        }
    });
}
function _commit_previous_submodule() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _execute('git add .', 'git', 'add');
        yield _execute(`git commit -m "[updated submodule of previous repo ${dot_params.repo}]"`, 'git', 'commit');
        output_instance.done_log(`Commited previous repo ${dot_params.repo}.`);
    });
}
function _install_dependencies(pacman) {
    return __awaiter(this, void 0, void 0, function* () {
        const install_cmd = (pacman === 'yarn') ? `yarn install` : 'npm install';
        yield _execute(install_cmd, 'pacman', 'installing');
        output_instance.done_log(`Installed dependencies.`);
    });
}
function _remove_node_modules_and_lock_files() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _execute(`rm -rf node_modules/ yarn.lock package-lock.json`, 'git', `removing node_modules and lock files`);
        output_instance.done_log(`Deleted node_modules and lock files.`);
    });
}
function _add_submodule(repo, origin, dest, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield _execute(`git submodule add --force -b ${branch} ${origin} ${dest}`, 'git', 'adding submodule');
        yield _execute(`git config -f .gitmodules submodule.${dest}.update rebase`, 'git', 'updating config');
        yield _execute(`git submodule update --remote --init --recursive`, 'git', 'updating submodule');
        let cmd = '';
        // cmd += `git submodule foreach --recursive 'case $displaypath in ".uranio"*)`;
        cmd += `git submodule foreach --recursive 'case $displaypath in "${dest}"*)`;
        cmd += ` git checkout ${branch} ;; *) : ;; esac'`;
        yield _execute(cmd, 'git', 'foreach submodule');
        yield _execute('git add .', 'git', 'add');
        yield _execute(`git commit -m "[added submodule ${repo} in ${dest}]"`, 'git', 'commit');
        output_instance.done_log(`Added submodule ${origin}.`);
    });
}
function _deinit(dest) {
    return __awaiter(this, void 0, void 0, function* () {
        yield _execute(`git submodule deinit ${dest}`, 'git', 'deinit');
        yield _execute(`git rm ${dest}`, 'git', 'gitrm');
        yield _execute(`rm -rf ${dest}`, 'git', 'rm');
        const included_repo = `../.git/modules/urn-dot/modules/${dest}`;
        if (util_instance.fs.exists(included_repo)) {
            yield _execute(`rm -rf ${included_repo}`, 'git', 'rm');
        }
        const included_repo_uranio = `../.git/modules/uranio-dot/modules/${dest}`;
        if (util_instance.fs.exists(included_repo_uranio)) {
            yield _execute(`rm -rf ${included_repo_uranio}`, 'git', 'rm');
        }
        const not_included_repo = `.git/modules/${dest}`;
        if (util_instance.fs.exists(not_included_repo)) {
            yield _execute(`rm -rf ${not_included_repo}`, 'git', 'rm');
        }
        yield _execute('git add .', 'git', 'add');
        yield _execute(`git commit -m "[removed submodule ${dest}]"`, 'git', 'commit');
        output_instance.done_log(`Deinitialized submodule ${dest}.`);
    });
}
function _execute(cmd, context, action) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            util_instance.spawn.spin_and_verbose_log(cmd, context, action, undefined, resolve, reject);
        });
    });
}
//# sourceMappingURL=dot.js.map