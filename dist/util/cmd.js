"use strict";
/**
 * Util
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
exports.dependency_exists = exports.clone_repo_recursive = exports.clone_repo = exports.uninstall_dep = exports.install_dep_dev = exports.install_dep = exports.check_deploy = exports.check_pacman = exports.check_repo = exports.set_deploy = exports.set_pacman = exports.set_repo = exports.auto_set_project_root = exports.is_initialized = exports.read_rc_file = exports.merge_options = void 0;
const fs_1 = __importDefault(require("fs"));
const urn_lib_1 = require("urn-lib");
const output = __importStar(require("../output/"));
const common = __importStar(require("../cmd/common"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
function merge_options(options) {
    let k;
    for (k in defaults_1.conf) {
        if (typeof k !== typeof undefined && urn_lib_1.urn_util.object.has_key(options, k)) {
            defaults_1.conf[k] = options[k]; // TODO FIX THIS
        }
    }
}
exports.merge_options = merge_options;
function read_rc_file() {
    if (!is_initialized()) {
        let err = `URANIO was not initialized yet.`;
        err += ` Please run "uranio init" in order to initialize the repo.`;
        output.error_log(err, 'init');
        process.exit(1);
    }
    else {
        const rcfile_path = `${defaults_1.conf.root}/${defaults_1.jsonfile_path}`;
        try {
            const rc_content = fs_1.default.readFileSync(rcfile_path, 'utf8');
            const rc_obj = urn_lib_1.urn_util.json.clean_parse(rc_content);
            set_repo(rc_obj.repo);
            defaults_1.conf.repo = rc_obj.repo;
            defaults_1.conf.pacman = rc_obj.pacman;
            defaults_1.conf.deploy = rc_obj.deploy;
        }
        catch (ex) {
            output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
            process.exit(1);
        }
    }
}
exports.read_rc_file = read_rc_file;
function is_initialized() {
    return (fs_1.default.existsSync(`${defaults_1.conf.root}/${defaults_1.jsonfile_path}`));
}
exports.is_initialized = is_initialized;
function _check_folder(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${folder_path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'urn-cli') {
                    return false;
                }
                else if (pack.name === 'uranio') {
                    const bld_path = `${folder_path}/urn-bld`;
                    if (!fs_1.default.existsSync(bld_path)) {
                        return false;
                    }
                    defaults_1.conf.root = bld_path;
                    return true;
                }
                defaults_1.conf.root = folder_path;
                return true;
            }
            catch (ex) {
                output.error_log(`Invalid ${package_json_path}. ${ex.message}`, 'root');
                return false;
            }
        }
    }
    return false;
}
function auto_set_project_root() {
    // output.start_loading('Getting project root...');
    let folder_path = process.cwd();
    while (!_check_folder(folder_path)) {
        const arr_folder = folder_path.split('/');
        arr_folder.pop();
        folder_path = arr_folder.join('/');
        if (folder_path === '/' || arr_folder.length === 2) {
            defaults_1.conf.filelog = false;
            let err_msg = `Cannot find project root.`;
            err_msg += ' Be sure to run `uranio` inside an NPM project.';
            output.wrong_end_log(err_msg);
            process.exit(1);
        }
    }
    common.init_log();
    output.done_verbose_log(`$URNROOT$Project root found [${defaults_1.conf.root}]`, 'root');
}
exports.auto_set_project_root = auto_set_project_root;
function set_repo(repo) {
    if (check_repo(repo)) {
        defaults_1.conf.repo = repo;
    }
    else {
        const valid_repos_str = types_1.valid_repos().join(', ');
        let end_log = '';
        end_log += `Wrong repo. `;
        end_log += `Repo must be one of the following [${valid_repos_str}]`;
        output.wrong_end_log(end_log);
        process.exit(1);
    }
}
exports.set_repo = set_repo;
function set_pacman(pacman) {
    if (check_pacman(pacman)) {
        defaults_1.conf.pacman = pacman;
    }
    else {
        const valid_pacman_str = types_1.valid_pacman().join(', ');
        let end_log = '';
        end_log += `Wrong package manager. `;
        end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
        output.wrong_end_log(end_log);
        process.exit(1);
    }
}
exports.set_pacman = set_pacman;
function set_deploy(deploy) {
    if (check_deploy(deploy)) {
        defaults_1.conf.deploy = deploy;
    }
    else {
        const valid_deploy_str = types_1.valid_deploy().join(', ');
        let end_log = '';
        end_log += `Wrong deploy value. `;
        end_log += `Deploy value must be one of the following [${valid_deploy_str}]`;
        output.wrong_end_log(end_log);
        process.exit(1);
    }
}
exports.set_deploy = set_deploy;
function check_repo(repo) {
    return urn_lib_1.urn_util.object.has_key(types_1.abstract_repos, repo);
}
exports.check_repo = check_repo;
function check_pacman(pacman) {
    return urn_lib_1.urn_util.object.has_key(types_1.abstract_pacman, pacman);
}
exports.check_pacman = check_pacman;
function check_deploy(deploy) {
    return urn_lib_1.urn_util.object.has_key(types_1.abstract_deploy, deploy);
}
exports.check_deploy = check_deploy;
function install_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `installing dependencies [${repo}]`;
        output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            spawn_cmd(_pacman_commands.install[defaults_1.conf.pacman](repo), context, action, resolve, reject);
        });
    });
}
exports.install_dep = install_dep;
function install_dep_dev(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `installing dev dependencies [${repo}]`;
        output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            spawn_cmd(_pacman_commands.install_dev[defaults_1.conf.pacman](repo), context, action, resolve, reject);
        });
    });
}
exports.install_dep_dev = install_dep_dev;
function uninstall_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `uninstalling dependencies [${repo}]`;
        output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            spawn_cmd(_pacman_commands.uninstall[defaults_1.conf.pacman](repo), context, action, resolve, reject);
        });
    });
}
exports.uninstall_dep = uninstall_dep;
function clone_repo(context, address, dest_folder, branch = 'master') {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _clone_repo(context, address, dest_folder, branch);
    });
}
exports.clone_repo = clone_repo;
function clone_repo_recursive(context, address, dest_folder, branch = 'master') {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _clone_repo(context, address, dest_folder, branch, true);
    });
}
exports.clone_repo_recursive = clone_repo_recursive;
function _clone_repo(context, address, dest_folder, branch = 'master', recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `cloning repo [${address}]`;
        output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            const branch_str = (branch !== 'master' && typeof branch === 'string') ?
                `-b ${branch} ` : '';
            let cmd = `git clone ${branch_str}${address} ${dest_folder} --progress`;
            cmd += (recursive === true) ? ` --recurse-submodules` : '';
            spawn_cmd(cmd, context, action, resolve, reject);
        });
    });
}
function dependency_exists(repo) {
    const package_json_path = `${defaults_1.conf.root}/package.json`;
    try {
        const data = fs_1.default.readFileSync(package_json_path, 'utf8');
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        return ((package_data['dependencies'] && typeof package_data['dependencies'][repo] === 'string') ||
            (package_data['devDependencies'] && typeof package_data['devDependencies'][repo] === 'string'));
    }
    catch (ex) {
        output.wrong_end_log(`Invalid ${package_json_path}. ${ex.message}`);
        process.exit(1);
    }
}
exports.dependency_exists = dependency_exists;
const _pacman_commands = {
    install: {
        npm(repo) {
            return `npm i ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn add ${repo} --verbose`;
        }
    },
    install_dev: {
        npm(repo) {
            return `npm i --save-dev ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn add --dev ${repo} --verbose`;
        }
    },
    uninstall: {
        npm(repo) {
            return `npm uninstall ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn remove ${repo} --verbose`;
        }
    }
};
//# sourceMappingURL=cmd.js.map