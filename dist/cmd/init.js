"use strict";
/**
 * Init command module
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
exports.init = void 0;
const fs_1 = __importDefault(require("fs"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const alias_1 = require("./alias");
const common_1 = require("./common");
let output_instance;
let util_instance;
let init_params = defaults_1.default_params;
function init(params, output_params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!output_params) {
            output_params = {};
        }
        if (!output_params.root) {
            output_params.root = params.root;
        }
        output_instance = output.create(output_params);
        init_params = common_1.merge_params(params);
        const util_params = Object.assign({}, init_params);
        util_instance = util.create(util_params, output_instance);
        output_instance.verbose_log(`$URNROOT$Project root: [${init_params.root}]`, 'root');
        output_instance.verbose_log(`Selected repo: [${init_params.repo}]`, 'repo');
        if (init_params.repo === 'api') {
            output_instance.verbose_log(`Selected deploy: [${init_params.deploy}]`, 'dply');
        }
        _update_package_aliases();
        _update_package_scripts();
        _create_urn_folder();
        _ignore_urn_folder();
        _create_rc_file();
        _create_client_server_folders();
        yield _clone_and_install_repo();
        _remove_git_files();
        yield _clone_dot();
        _copy_dot_files();
        _remove_tmp();
        _replace_aliases();
        if (init_params.repo === 'adm') {
            _add_admin_files();
        }
        output_instance.end_log(`Initialization completed.`);
    });
}
exports.init = init;
function _add_admin_files() {
    output_instance.start_loading(`Adding admin files...`);
    const fix_file_nuxt_types = `${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
    if (!fs_1.default.existsSync(fix_file_nuxt_types)) {
        util_instance.spawn.exec_sync(`touch ${fix_file_nuxt_types}`);
    }
}
function _replace_aliases() {
    output_instance.start_loading(`Updating relative paths aliases...`);
    alias_1.alias(init_params);
}
function _remove_tmp() {
    output_instance.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util_instance.fs.remove_directory(`${init_params.root}/${defaults_1.defaults.tmp_folder}`, 'tmp');
    output_instance.done_verbose_log(`Removed tmp folder [${defaults_1.defaults.tmp_folder}].`, 'tmp');
}
function _copy_dot_files() {
    if (fs_1.default.existsSync(`${init_params.root}/src`) === false) {
        _copy_dot_src_folder();
    }
    _copy_dot_tsconfigs();
    _copy_dot_eslint_files();
    if (init_params.deploy === 'netlify') {
        _copy_netlify_files();
    }
    else {
        _copy_express_files();
    }
}
function _clone_dot() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning dot...`);
        util_instance.fs.remove_directory(defaults_1.defaults.tmp_folder, 'dot');
        util_instance.fs.create_directory(defaults_1.defaults.tmp_folder, 'dot');
        yield util_instance.cmd.clone_repo(defaults_1.defaults.dot_repo, `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot`, 'dot', init_params.branch);
        output_instance.done_log(`Cloned dot repo.`, 'dot');
    });
}
function _remove_git_files() {
    output_instance.start_loading(`Removing git files...`);
    const cloned_server_repo_path = `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`;
    util_instance.spawn.exec_sync(`( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`);
    const cloned_client_repo_path = `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`;
    util_instance.spawn.exec_sync(`( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`);
    output_instance.done_log(`Removed uranio .git files.`, '.git');
}
function _clone_and_install_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning and intalling [${init_params.repo}]...`);
        switch (init_params.repo) {
            case 'core': {
                yield _clone_core();
                break;
            }
            case 'api': {
                yield _clone_api();
                break;
            }
            case 'trx': {
                yield _clone_trx();
                break;
            }
            default: {
                output_instance.log(`Selected repo is not valid. [${init_params.repo}]`, 'init');
                process.exit(1);
            }
        }
        yield _install_dep();
        output_instance.done_log(`Cloned and installed repo [${init_params.repo}].`, 'repo');
    });
}
function _create_client_server_folders() {
    output_instance.start_loading(`Creating server folder...`);
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server/src`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server/src/books`, 'init');
    output_instance.start_loading(`Creating client folder...`);
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client/src`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client/src/books`, 'init');
    output_instance.done_log(`Created client server folders.`, 'init');
}
function _create_rc_file() {
    output_instance.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `\t"repo": "${init_params.repo}",\n`;
    content += `\t"pacman": "${init_params.pacman}",\n`;
    content += `\t"deploy": "${init_params.deploy}"\n`;
    content += `}`;
    fs_1.default.writeFileSync(`${init_params.root}/${defaults_1.jsonfile_path}`, content);
    util_instance.pretty(`${init_params.root}/${defaults_1.jsonfile_path}`, 'json');
    output_instance.done_log(`Created file ${defaults_1.jsonfile_path}.`, 'rcfl');
}
function _ignore_urn_folder() {
    output_instance.start_loading(`Adding ${defaults_1.defaults.folder} to .gitignore...`);
    const gitignore = `${init_params.root}/.gitignore`;
    if (!fs_1.default.existsSync(gitignore)) {
        util_instance.fs.create_file(gitignore, 'giti');
    }
    let content = fs_1.default.readFileSync(gitignore, 'utf8');
    if (content.indexOf(defaults_1.defaults.folder + '/') === -1) {
        content += `\n${defaults_1.defaults.folder}/`;
    }
    if (content.indexOf(defaults_1.defaults.log_filepath + '/') === -1) {
        content += `\n${defaults_1.defaults.log_filepath}`;
    }
    fs_1.default.writeFileSync(gitignore, content);
    const log_msg = `Added ${defaults_1.defaults.folder} and ${defaults_1.defaults.log_filepath} to .gitignore.`;
    output_instance.done_log(log_msg, '.git');
}
function _create_urn_folder() {
    output_instance.start_loading(`Creating ${defaults_1.defaults.folder} folder...`);
    util_instance.fs.remove_directory(`${init_params.root}/${defaults_1.defaults.folder}`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}`, 'init');
    output_instance.done_log(`Created folder ${defaults_1.defaults.folder}.`, 'init');
}
function _update_package_scripts() {
    output_instance.start_loading('Updating scripts...');
    const package_json_path = `${init_params.root}/package.json`;
    const data = fs_1.default.readFileSync(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        package_data['scripts'] = {
            'build': `uranio build`,
            'build:server': `uranio build:client`,
            'build:client': `uranio build:client`,
            'dev': `uranio dev`,
            'dev:server': `uranio dev:server`,
            'dev:client': `uranio dev:client`
        };
        try {
            fs_1.default.writeFileSync(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json scripts.`, 'alias');
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
    }
}
function _update_package_aliases() {
    output_instance.start_loading('Updating aliases...');
    const package_json_path = `${init_params.root}/package.json`;
    const data = fs_1.default.readFileSync(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        package_data['_moduleAliases'] = {
            'uranio': `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/`,
            'uranio-books': `./dist/${defaults_1.defaults.folder}/server/src/books/`,
        };
        switch (init_params.repo) {
            case 'trx': {
                package_data['_moduleAliases']['uranio-api'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/api/`;
                package_data['_moduleAliases']['uranio-core'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/api/core/`;
                break;
            }
            case 'api': {
                package_data['_moduleAliases']['uranio-core'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/api/core/`;
                break;
            }
            case 'core': {
                break;
            }
        }
        try {
            fs_1.default.writeFileSync(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json module aliases.`, 'alias');
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
    }
}
function _copy_dot_src_folder() {
    const dot_src_folder = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/src`;
    const dest = `${init_params.root}/`;
    util_instance.fs.copy_directory(dot_src_folder, dest, 'dot');
}
function _copy_dot_tsconfigs() {
    const dot_tsc_file = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/tsconfig.json`;
    const dest = `${init_params.root}/`;
    util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
    const dot_tsc_file_server = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/.uranio/server/tsconfig.json`;
    const dest_server = `${init_params.root}/.uranio/server/`;
    util_instance.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
    const dot_tsc_file_client = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/.uranio/client/tsconfig.json`;
    const dest_client = `${init_params.root}/.uranio/client/`;
    util_instance.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}
function _copy_dot_eslint_files() {
    const dot_eslint_files = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/.eslint*`;
    const dest = `${init_params.root}/`;
    util_instance.fs.copy_file(dot_eslint_files, dest, 'esln');
}
function _copy_netlify_files() {
    const dot_deploy_folder = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/deploy`;
    const toml_file = `${dot_deploy_folder}/netlify/netlify.toml`;
    const toml_dest = `${init_params.root}/`;
    util_instance.fs.copy_file(toml_file, toml_dest, 'ntlf');
    const function_folder = `${init_params.root}/${defaults_1.defaults.folder}/server/src/functions`;
    if (!fs_1.default.existsSync(function_folder)) {
        fs_1.default.mkdirSync(function_folder);
    }
    let api_file = `trx-api.txt`;
    if (init_params.repo === 'api') {
        api_file = `api-api.txt`;
    }
    const functions_file = `${dot_deploy_folder}/netlify/functions/${api_file}`;
    const functions_dest = `${function_folder}/api.ts`;
    util_instance.fs.copy_file(functions_file, functions_dest, 'dot');
}
function _copy_express_files() {
    const dot_deploy_folder = `${init_params.root}/${defaults_1.defaults.tmp_folder}/urn-dot/deploy`;
    const src_folder = `${init_params.root}/src`;
    if (!fs_1.default.existsSync(src_folder)) {
        fs_1.default.mkdirSync(src_folder);
    }
    const index_file = `${dot_deploy_folder}/express/index.txt`;
    const index_dest = `${src_folder}/index.ts`;
    util_instance.fs.copy_file(index_file, index_dest, 'xprs');
}
function _clone_core() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning core...`);
        yield util_instance.cmd.clone_repo(defaults_1.defaults.core_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'core', init_params.branch);
        yield util_instance.cmd.clone_repo(defaults_1.defaults.core_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'core', init_params.branch);
        output_instance.done_log(`Cloned core repo.`, 'core');
    });
}
function _clone_api() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning api...`);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.api_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'api', init_params.branch);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.api_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'api', init_params.branch);
        output_instance.done_log(`Cloned api repo.`, 'api');
    });
}
function _clone_trx() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning trx...`);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.trx_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'trx', init_params.branch);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.trx_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'trx', init_params.branch);
        output_instance.done_log(`Cloned trx repo.`, 'trx');
    });
}
function _install_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _uninstall_core_dep();
        yield _uninstall_api_dep();
        yield _uninstall_trx_dep();
        switch (init_params.repo) {
            case 'core': {
                yield _install_core_dep();
                return true;
            }
            case 'api': {
                yield _install_api_dep();
                return true;
            }
            case 'trx': {
                yield _install_trx_dep();
                return true;
            }
            case 'adm': {
                // await _install_adm_dep();
                return true;
            }
            default: {
                output_instance.log('init', `Selected repo is not valid. [${init_params.repo}]`);
                process.exit(1);
            }
        }
    });
}
function _uninstall_core_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _uninstall_dep(defaults_1.defaults.core_dep_repo, 'core');
        yield _uninstall_dep(defaults_1.defaults.core_dep_dev_repo, 'core');
        return true;
    });
}
function _uninstall_api_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _uninstall_dep(defaults_1.defaults.api_dep_repo, 'api');
        yield _uninstall_dep(defaults_1.defaults.api_dep_dev_repo, 'api');
        return true;
    });
}
function _uninstall_trx_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _uninstall_dep(defaults_1.defaults.trx_dep_repo, 'trx');
        yield _uninstall_dep(defaults_1.defaults.trx_dep_dev_repo, 'trx');
        return true;
    });
}
function _uninstall_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const short_repo = (repo.substr(0, 3) === 'ssh' || repo.substr(0, 7) === 'git+ssh') ?
            repo.split('/').slice(-1)[0] : repo;
        if (util_instance.cmd.dependency_exists(short_repo)) {
            output_instance.start_loading(`Uninstalling ${short_repo} dep...`);
            const dep_folder = `${init_params.root}/node_modules/${short_repo}`;
            util_instance.fs.remove_directory(dep_folder, context);
            const dep_dev_folder = `${init_params.root}/node_modules/${short_repo}`;
            util_instance.fs.remove_directory(dep_dev_folder, context);
            yield util_instance.cmd.uninstall_dep(`${short_repo}`, context);
            output_instance.done_log(`Uninstalled ${short_repo} dependencies.`, context);
            return true;
        }
    });
}
function _install_core_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Installing core dep...`);
        yield util_instance.cmd.install_dep(defaults_1.defaults.core_dep_repo, 'core');
        yield util_instance.cmd.install_dep_dev(defaults_1.defaults.core_dep_dev_repo, 'core');
        output_instance.done_log(`Installed core dependencies.`, 'core');
        return true;
    });
}
function _install_api_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Installing api dep...`);
        yield util_instance.cmd.install_dep(defaults_1.defaults.api_dep_repo, 'api');
        yield util_instance.cmd.install_dep_dev(defaults_1.defaults.api_dep_dev_repo, 'api');
        output_instance.done_log(`Installed api dependencies.`, 'api');
        return true;
    });
}
function _install_trx_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Installing trx dep...`);
        yield util_instance.cmd.install_dep(defaults_1.defaults.trx_dep_repo, 'trx');
        yield util_instance.cmd.install_dep_dev(defaults_1.defaults.trx_dep_dev_repo, 'trx');
        output_instance.done_log(`Installed trx dependencies.`, 'trx');
        return true;
    });
}
//# sourceMappingURL=init.js.map