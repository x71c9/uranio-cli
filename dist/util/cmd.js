"use strict";
/**
 * Util CMD
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const toml_1 = __importDefault(require("toml"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
// DO NO CANCEL IT
// import * as common from '../cmd/common';
const fs = __importStar(require("./fs"));
const spawn = __importStar(require("./spawn"));
class CMD {
    constructor(params, output) {
        this.params = params;
        this.output = output;
        this.fs = fs.create(output);
        this.spawn = spawn.create(output);
    }
    async yarn_install() {
        const action = `yarn install`;
        this.output.verbose_log(`Started ${action}`, 'pacman');
        return new Promise((resolve, reject) => {
            this.spawn.spin(`yarn install --verbose`, 'pacman', action, undefined, resolve, reject);
        });
    }
    async install_package(pack, context) {
        const action = `installing package [${pack}]`;
        this.output.verbose_log(`Started ${action}`, context);
        this.output.start_loading(`Installing package [${pack}]...`);
        return new Promise((resolve, reject) => {
            this.spawn.spin(_pacman_commands.install[this.params.pacman](pack), context || 'install', action, undefined, resolve, reject);
        });
    }
    async install_package_dev(pack, context) {
        const action = `installing dev package [${pack}]`;
        this.output.verbose_log(`Started ${action}`, context);
        this.output.start_loading(`Installing dev package [${pack}]...`);
        return new Promise((resolve, reject) => {
            this.spawn.spin(_pacman_commands.install_dev[this.params.pacman](pack), context || 'install', action, undefined, resolve, reject);
        });
    }
    async install_dep(repo, context) {
        const action = `installing dependencies [${repo}]`;
        this.output.verbose_log(`Started ${action}`, context);
        this.output.start_loading(`Installing dep [${repo}]...`);
        return new Promise((resolve, reject) => {
            this.spawn.spin(_pacman_commands.install[this.params.pacman](repo), context, action, undefined, resolve, reject);
        });
    }
    async install_dep_dev(repo, context) {
        const action = `installing dev dependencies [${repo}]`;
        this.output.verbose_log(`Started ${action}`, context);
        this.output.start_loading(`Installing dep dev [${repo}]...`);
        return new Promise((resolve, reject) => {
            this.spawn.spin(_pacman_commands.install_dev[this.params.pacman](repo), context, action, undefined, resolve, reject);
        });
    }
    async uninstall_dep(repo, context) {
        const action = `uninstalling dependencies [${repo}]`;
        this.output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            this.spawn.spin(_pacman_commands.uninstall[this.params.pacman](repo), context, action, undefined, resolve, reject);
        });
    }
    async clone_repo(address, dest_folder, context = 'clrp', branch = 'master') {
        return await this._clone_repo(address, dest_folder, context, branch);
    }
    async clone_repo_recursive(address, dest_folder, context = 'clrr', branch = 'master') {
        return await this._clone_repo(address, dest_folder, context, branch, true);
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
    read_toml() {
        const toml_path = `${this.params.config}`;
        if (!this.fs.exists(toml_path)) {
            this.output.warn_log(`Missing .toml file.`);
            // process.exit(1);
        }
        const content = this.fs.read_file(toml_path);
        const parsed_toml = toml_1.default.parse(content);
        const converted_toml = _convert_toml(parsed_toml);
        return converted_toml;
    }
    read_dotenv() {
        const dotenv_path = `${this.params.root}/.env`;
        if (!this.fs.exists(dotenv_path)) {
            this.output.error_log(`Missing .env file.`);
            process.exit(1);
        }
        const content = this.fs.read_file(dotenv_path);
        const dotenv = {};
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim()[0] === '#') {
                continue;
            }
            const splitted = line.split('=');
            dotenv[splitted[0]] = splitted[1];
        }
        return dotenv;
    }
    client_env_variables_to_command_string() {
        const dotenv_obj = this.read_dotenv();
        const client_env_var = [];
        for (const [key, value] of Object.entries(dotenv_obj)) {
            if (key.substring(0, 11) === 'URN_CLIENT_') {
                client_env_var.push(`${key}=${value}`);
            }
        }
        const env_string = client_env_var.join(' ');
        return env_string;
    }
    write_dotenv(dotenv) {
        const dotenv_path = `${this.params.root}/.env`;
        let content = ``;
        for (const [key, value] of Object.entries(dotenv)) {
            content += `${key}=${value}\n`;
        }
        this.fs.write_file(dotenv_path, content);
    }
    async install_core_dep() {
        this.output.start_loading(`Installing core dep...`);
        await this.install_dep(defaults_1.defaults.core_dep_repo, 'core');
        await this.install_dep_dev(defaults_1.defaults.core_dep_dev_repo, 'core');
        this.output.done_log(`Installed core dependencies.`, 'core');
        return true;
    }
    async install_api_dep() {
        this.output.start_loading(`Installing api dep...`);
        await this.install_dep(defaults_1.defaults.api_dep_repo, 'api');
        await this.install_dep_dev(defaults_1.defaults.api_dep_dev_repo, 'api');
        this.output.done_log(`Installed api dependencies.`, 'api');
        return true;
    }
    async install_trx_dep() {
        this.output.start_loading(`Installing trx dep...`);
        await this.install_dep(defaults_1.defaults.trx_dep_repo, 'trx');
        await this.install_dep_dev(defaults_1.defaults.trx_dep_dev_repo, 'trx');
        this.output.done_log(`Installed trx dependencies.`, 'trx');
        return true;
    }
    async install_adm_dep() {
        this.output.start_loading(`Installing adm dep...`);
        await this.install_dep(defaults_1.defaults.adm_dep_repo, 'adm');
        await this.install_dep_dev(defaults_1.defaults.adm_dep_dev_repo, 'adm');
        this.output.done_log(`Installed adm dependencies.`, 'adm');
        return true;
    }
    async uninstall_uranio(pack_data) {
        if (this.dependency_exists('uranio', pack_data)) {
            await this.uninstall_dep('uranio', 'urn');
        }
        return true;
    }
    async uninstall_core_dep(pack_data) {
        await this._uninstall_uranio_dep(defaults_1.defaults.core_dep_repo, 'core', pack_data);
        await this._uninstall_uranio_dep(defaults_1.defaults.core_dep_dev_repo, 'core', pack_data);
        return true;
    }
    async uninstall_api_dep(pack_data) {
        await this._uninstall_uranio_dep(defaults_1.defaults.api_dep_repo, 'api', pack_data);
        await this._uninstall_uranio_dep(defaults_1.defaults.api_dep_dev_repo, 'api', pack_data);
        return true;
    }
    async uninstall_trx_dep(pack_data) {
        await this._uninstall_uranio_dep(defaults_1.defaults.trx_dep_repo, 'trx', pack_data);
        await this._uninstall_uranio_dep(defaults_1.defaults.trx_dep_dev_repo, 'trx', pack_data);
        return true;
    }
    async uninstall_adm_dep(pack_data) {
        await this._uninstall_uranio_dep(defaults_1.defaults.adm_dep_repo, 'adm', pack_data);
        await this._uninstall_uranio_dep(defaults_1.defaults.adm_dep_dev_repo, 'adm', pack_data);
        return true;
    }
    async _uninstall_uranio_dep(repo, context, pack_data) {
        const short_repo = (repo.substr(0, 3) === 'ssh' || repo.substr(0, 7) === 'git+ssh') ?
            repo.split('/').slice(-1)[0].replace('uranio', 'urn') : repo;
        if (this.dependency_exists(short_repo, pack_data)) {
            this.output.start_loading(`Uninstalling ${short_repo} dep...`);
            const dep_folder = `${this.params.root}/node_modules/${short_repo}`;
            this.fs.remove_directory(dep_folder, context);
            await this.uninstall_dep(`${short_repo}`, context);
            this.output.done_log(`Uninstalled ${short_repo} dependencies.`, context);
            return true;
        }
    }
    async _clone_repo(address, dest_folder, context = '_clr', branch = 'master', recursive = false) {
        const action = `cloning repo [${address}]`;
        this.output.verbose_log(`Started ${action}`, context);
        return new Promise((resolve, reject) => {
            const branch_str = (branch !== 'master' && typeof branch === 'string') ?
                `-b ${branch} ` : '';
            let cmd = `git clone ${branch_str}${address} ${dest_folder} --progress`;
            cmd += (recursive === true) ? ` --recurse-submodules` : '';
            this.spawn.spin(cmd, context, action, undefined, resolve, reject);
        });
    }
}
function create(params, output) {
    // const full_params = merge_params(params);
    return new CMD(params, output);
}
exports.create = create;
function _convert_toml(parsed_toml) {
    const converted_config = {};
    for (const [key, value] of Object.entries(parsed_toml)) {
        if (value === null || value === undefined) {
            continue;
        }
        if (typeof value === 'object') {
            _convert_subobject(converted_config, key, value);
        }
        else {
            converted_config[key] = value;
        }
    }
    return converted_config;
}
function _convert_subobject(config, key, obj) {
    for (const [subkey, subvalue] of Object.entries(obj)) {
        if (subvalue === null || subvalue === undefined) {
            continue;
        }
        const full_key = `${key}_${subkey}`;
        if (typeof subvalue === 'object') {
            _convert_subobject(config, full_key, subvalue);
        }
        else {
            config[full_key] = subvalue;
        }
    }
    return config;
}
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