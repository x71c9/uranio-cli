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
// import {UtilParams} from './types';
// DO NO CANCEL IT
// import * as common from '../cmd/common';
const fs = __importStar(require("./fs"));
const spawn = __importStar(require("./spawn"));
// import {defaults} from '../conf/defaults';
class CMD {
    constructor(params, output) {
        this.params = params;
        this.output = output;
        this.fs = fs.create(output);
        this.spawn = spawn.create(output);
    }
    // public read_rc_file()
    //     :void{
    //   if(!this.is_initialized()){
    //     let err =  `URANIO was not initialized yet.`;
    //     err += ` Please run "uranio init" in order to initialize the repo.`;
    //     this.output.error_log(err, 'init');
    //     process.exit(1);
    //   }else{
    //     const rcfile_path = `${this.params.root}/${jsonfile_path}`;
    //     try{
    //       const rc_content = this.fs.read_file(rcfile_path, 'utf8');
    //       const rc_obj = urn_util.json.clean_parse(rc_content);
    //       this.set_repo(rc_obj.repo);
    //       this.params.repo = rc_obj.repo;
    //       this.params.pacman = rc_obj.pacman;
    //       this.params.deploy = rc_obj.deploy;
    //     }catch(ex){
    //       this.output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
    //       process.exit(1);
    //     }
    //   }
    // }
    // public is_initialized()
    //     :boolean{
    //   return (this.fs.exists(`${this.params.root}/${jsonfile_path}`));
    // }
    yarn_install() {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `yarn install`;
            this.output.verbose_log(`Started ${action}`, 'pacman');
            return new Promise((resolve, reject) => {
                this.spawn.spin(`yarn install --verbose`, 'pacman', action, undefined, resolve, reject);
            });
        });
    }
    install_dep(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `installing dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.install[this.params.pacman](repo), context, action, undefined, resolve, reject);
            });
        });
    }
    install_dep_dev(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `installing dev dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.install_dev[this.params.pacman](repo), context, action, undefined, resolve, reject);
            });
        });
    }
    uninstall_dep(repo, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = `uninstalling dependencies [${repo}]`;
            this.output.verbose_log(`Started ${action}`, context);
            return new Promise((resolve, reject) => {
                this.spawn.spin(_pacman_commands.uninstall[this.params.pacman](repo), context, action, undefined, resolve, reject);
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
    get_package_data(package_json_path) {
        try {
            const data = this.fs.read_file(package_json_path, 'utf8');
            const pack_data = urn_lib_1.urn_util.json.clean_parse(data);
            return pack_data;
        }
        catch (ex) {
            const e = ex;
            this.output.wrong_end_log(`Invalid ${package_json_path}. ${e.message}`);
            process.exit(1);
        }
    }
    dependency_exists(repo, package_data) {
        let pack_data = package_data;
        if (!package_data) {
            const package_json_path = `${this.params.root}/package.json`;
            pack_data = this.get_package_data(package_json_path);
        }
        const packdata_dep = pack_data['dependencies'];
        const packdata_dep_dev = pack_data['devDependencies'];
        return ((packdata_dep && typeof packdata_dep[repo] === 'string') ||
            (packdata_dep_dev && typeof packdata_dep_dev[repo] === 'string'));
    }
    read_dotenv() {
        const dotenv_path = `${this.params.root}/.env`;
        const content = this.fs.read_file(dotenv_path);
        const dotenv = {};
        const lines = content.split('\n');
        for (const line of lines) {
            const splitted = line.split('=');
            dotenv[splitted[0]] = splitted[1];
        }
        return dotenv;
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
                this.spawn.spin(cmd, context, action, undefined, resolve, reject);
            });
        });
    }
}
function create(params, output) {
    // const full_params = merge_params(params);
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