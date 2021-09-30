"use strict";
/**
 * Util CMD
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const urn_lib_1 = require("urn-lib");
// DO NO CANCEL IT
// import * as common from '../cmd/common';
const fs = __importStar(require("./fs"));
const spawn = __importStar(require("./spawn"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
class CMD {
    constructor(params, output) {
        this.params = params;
        this.output = output;
        this.fs = fs.create(output);
        this.spawn = spawn.create(output);
    }
    read_rc_file() {
        if (!this.is_initialized()) {
            let err = `URANIO was not initialized yet.`;
            err += ` Please run "uranio init" in order to initialize the repo.`;
            this.output.error_log(err, 'init');
            process.exit(1);
        }
        else {
            const rcfile_path = `${this.params.root}/${defaults_1.jsonfile_path}`;
            try {
                const rc_content = this.fs.read_file_sync(rcfile_path, 'utf8');
                const rc_obj = urn_lib_1.urn_util.json.clean_parse(rc_content);
                this.set_repo(rc_obj.repo);
                this.params.repo = rc_obj.repo;
                this.params.pacman = rc_obj.pacman;
                this.params.deploy = rc_obj.deploy;
            }
            catch (ex) {
                this.output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
                process.exit(1);
            }
        }
    }
    is_initialized() {
        return (this.fs.exists_sync(`${this.params.root}/${defaults_1.jsonfile_path}`));
    }
    auto_set_project_root() {
        // this.output.start_loading('Getting project root...');
        let folder_path = process.cwd();
        while (!this._check_folder(folder_path)) {
            const arr_folder = folder_path.split('/');
            arr_folder.pop();
            folder_path = arr_folder.join('/');
            if (folder_path === '/' || arr_folder.length === 2) {
                this.output.filelog = false;
                let err_msg = `Cannot find project root.`;
                err_msg += ' Be sure to run `uranio` inside an NPM project.';
                this.output.wrong_end_log(err_msg);
                process.exit(1);
            }
        }
        // common.init_log();
        this.output.done_verbose_log(`$URNROOT$Project root found [${this.params.root}]`, 'root');
    }
    set_repo(repo) {
        if (this.check_repo(repo)) {
            this.params.repo = repo;
        }
        else {
            const valid_repos_str = types_1.valid_repos().join(', ');
            let end_log = '';
            end_log += `Wrong repo. `;
            end_log += `Repo must be one of the following [${valid_repos_str}]`;
            this.output.wrong_end_log(end_log);
            process.exit(1);
        }
    }
    set_pacman(pacman) {
        if (this.check_pacman(pacman)) {
            this.params.pacman = pacman;
        }
        else {
            const valid_pacman_str = types_1.valid_pacman().join(', ');
            let end_log = '';
            end_log += `Wrong package manager. `;
            end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
            this.output.wrong_end_log(end_log);
            process.exit(1);
        }
    }
    set_deploy(deploy) {
        if (this.check_deploy(deploy)) {
            this.params.deploy = deploy;
        }
        else {
            const valid_deploy_str = types_1.valid_deploy().join(', ');
            let end_log = '';
            end_log += `Wrong deploy value. `;
            end_log += `Deploy value must be one of the following [${valid_deploy_str}]`;
            this.output.wrong_end_log(end_log);
            process.exit(1);
        }
    }
    check_repo(repo) {
        return urn_lib_1.urn_util.object.has_key(types_1.abstract_repos, repo);
    }
    check_pacman(pacman) {
        return urn_lib_1.urn_util.object.has_key(types_1.abstract_pacman, pacman);
    }
    check_deploy(deploy) {
        return urn_lib_1.urn_util.object.has_key(types_1.abstract_deploy, deploy);
    }
    install_dep(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `installing dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.install[this.params.pacman](repo), context, action, resolve, reject);
            });
        });
    }
    install_dep_dev(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `installing dev dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.install_dev[this.params.pacman](repo), context, action, resolve, reject);
            });
        });
    }
    uninstall_dep(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `uninstalling dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.uninstall[this.params.pacman](repo), context, action, resolve, reject);
            });
        });
    }
    clone_repo(address, dest_folder, context = 'clrp', branch = 'master') {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._clone_repo(address, dest_folder, context, branch);
        });
    }
    clone_repo_recursive(address, dest_folder, context = 'clrr', branch = 'master') {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._clone_repo(address, dest_folder, context, branch, true);
        });
    }
    dependency_exists(repo) {
        const package_json_path = `${this.params.root}/package.json`;
        try {
            const data = this.fs.read_file_sync(package_json_path, 'utf8');
            const package_data = urn_lib_1.urn_util.json.clean_parse(data);
            const packdata_dep = package_data['dependencies'];
            const packdata_dep_dev = package_data['devDependencies'];
            return ((packdata_dep && typeof packdata_dep[repo] === 'string') ||
                (packdata_dep_dev && typeof packdata_dep_dev[repo] === 'string'));
        }
        catch (ex) {
            this.output.wrong_end_log(`Invalid ${package_json_path}. ${ex.message}`);
            process.exit(1);
        }
    }
    _clone_repo(address, dest_folder, context = '_clr', branch = 'master', recursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `cloning repo [${address}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                const branch_str = (branch !== 'master' && typeof branch === 'string') ?
                    `-b ${branch} ` : '';
                let cmd = `git clone ${branch_str}${address} ${dest_folder} --progress`;
                cmd += (recursive === true) ? ` --recurse-submodules` : '';
                this.spawn.spin(cmd, context, action, resolve, reject);
            });
        });
    }
    _check_folder(folder_path) {
        const data = this.fs.read_dir_sync(folder_path);
        for (const file of data) {
            if (file === 'package.json') {
                const package_json_path = `${folder_path}/${file}`;
                try {
                    const content = this.fs.read_file_sync(package_json_path, 'utf8');
                    const pack = urn_lib_1.urn_util.json.clean_parse(content);
                    if (pack.name === 'urn-cli') {
                        return false;
                    }
                    else if (pack.name === 'uranio') {
                        const bld_path = `${folder_path}/urn-bld`;
                        if (!this.fs.exists_sync(bld_path)) {
                            return false;
                        }
                        this.params.root = bld_path;
                        return true;
                    }
                    this.params.root = folder_path;
                    return true;
                }
                catch (ex) {
                    this.output.error_log(`Invalid ${package_json_path}. ${ex.message}`, 'root');
                    return false;
                }
            }
        }
        return false;
    }
}
function create(params, output) {
    return new CMD(params, output);
}
exports.create = create;
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