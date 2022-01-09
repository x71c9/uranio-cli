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
exports.prompt_init = exports.init = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const docker = __importStar(require("./docker"));
const types_1 = require("../types");
const alias_1 = require("./alias");
const title_1 = require("./title");
const common_1 = require("./common");
// import {InitParams} from './types';
let output_instance;
let util_instance;
let init_params = defaults_1.default_params;
function init(params) {
    return __awaiter(this, void 0, void 0, function* () {
        init_params = (0, common_1.merge_init_params)(params);
        output_instance = output.create(init_params);
        util_instance = util.create(init_params, output_instance);
        _log_important_params();
        _create_rc_file();
        _create_urn_folder();
        _create_client_server_folders();
        yield _clone_assets_repo();
        _copy_assets();
        _create_dot_env();
        _ignore_files();
        if (init_params.docker === true) {
            yield docker.build(init_params);
        }
        else {
            yield _init_pacman();
            _update_package_aliases();
            _update_package_scripts();
            yield _clone_repo();
            yield _install_repo();
            _remove_git_files();
            _copy_specific_assets();
            yield _replace_aliases();
        }
        if (init_params.docker_db === true) {
            yield docker.network_create(init_params, true);
            yield docker.db_create(init_params, init_params.db);
            yield docker.db_start(init_params, init_params.db);
            docker.update_env();
        }
        _remove_tmp();
        output_instance.end_log(`Initialization completed.`);
    });
}
exports.init = init;
function prompt_init(params, args) {
    return __awaiter(this, void 0, void 0, function* () {
        init_params = params;
        output_instance = output.create(params);
        util_instance = util.create(init_params, output_instance);
        console.clear();
        (0, title_1.title)();
        if (util_instance.is_initialized() && init_params.force === false) {
            let confirm_msg = '';
            confirm_msg += `It appears the repo is already initialized.\n`;
            confirm_msg += `? Are you sure you want to proceed?\n`;
            const suffix = `? All data will be lost and replaced.`;
            inquirer_1.default.
                prompt([
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: confirm_msg,
                    suffix: suffix
                }
            ]).then((answer) => __awaiter(this, void 0, void 0, function* () {
                if (answer.proceed && answer.proceed === true) {
                    yield _ask_for_pacman(args);
                }
                else {
                    process.exit(0);
                }
            }));
        }
        else {
            yield _ask_for_pacman(args);
        }
    });
}
exports.prompt_init = prompt_init;
function _log_important_params() {
    output_instance.verbose_log(`$URNROOT$Project root: [${init_params.root}]`, 'root');
    output_instance.verbose_log(`Selected repository: [${init_params.repo}]`, 'repo');
    output_instance.verbose_log(`Selected pacman: [${init_params.pacman}]`, 'repo');
    if ((0, types_1.valid_deploy_repos)().includes(init_params.repo)) {
        output_instance.verbose_log(`Selected deploy: [${init_params.deploy}]`, 'dply');
    }
}
function _init_pacman() {
    return __awaiter(this, void 0, void 0, function* () {
        const yarn_lock = `${init_params.root}/yarn.lock`;
        if (init_params.pacman === 'yarn' && !util_instance.fs.exists(yarn_lock)) {
            yield util_instance.cmd.yarn_install();
        }
    });
}
function _ask_for_pacman(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pacman = args.p || args.pacman;
        if (!pacman && init_params.force === false) {
            // output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'pacman',
                    message: 'Select which package manager you want to use:',
                    choices: Object.keys(types_1.abstract_pacman)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                (0, common_1.check_pacman)(answers.pacman);
                init_params.pacman = answers.pacman;
                yield _ask_for_docker(args);
            }));
        }
        else {
            yield _ask_for_docker(args);
        }
    });
}
function _ask_for_docker(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const docker = args.k || args.docker;
        if (!docker && init_params.force === false) {
            let confirm_msg = '';
            confirm_msg += `? Do you want to compile and run inside a docker container?\n`;
            const suffix = `? Docker need to be installed on your system.`;
            inquirer_1.default.
                prompt([
                {
                    type: 'confirm',
                    name: 'docker',
                    message: confirm_msg,
                    suffix: suffix
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                if (answers.docker === true) {
                    init_params.docker = true;
                }
                yield _ask_for_docker_db(args);
            }));
        }
        else {
            yield _ask_for_docker_db(args);
        }
    });
}
function _ask_for_docker_db(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const docker_db = args.docker_db;
        if (!docker_db && init_params.force === false) {
            let confirm_msg = '';
            confirm_msg += `? Do you want to run the db in a docker container?\n`;
            const suffix = `? Docker need to be installed on your system.`;
            inquirer_1.default.
                prompt([
                {
                    type: 'confirm',
                    name: 'docker_db',
                    message: confirm_msg,
                    suffix: suffix
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                if (answers.docker_db === true) {
                    init_params.docker_db = true;
                    yield _ask_for_db_type(args);
                }
                else {
                    yield _ask_for_repo(args);
                }
            }));
        }
        else {
            yield _ask_for_repo(args);
        }
    });
}
function _ask_for_db_type(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (init_params.force === false) {
            let confirm_msg = '';
            confirm_msg += `Select db:`;
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'db',
                    message: confirm_msg,
                    choices: Object.keys(types_1.abstract_db)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                init_params.db = answers.db;
                yield _ask_for_repo(args);
            }));
        }
        else {
            yield _ask_for_repo(args);
        }
    });
}
function _ask_for_repo(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = args.r || args.repo;
        if (!repo && init_params.force === false) {
            // output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'repo',
                    message: 'Select which URANIO repo you want to use:',
                    choices: Object.keys(types_1.abstract_repos)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                (0, common_1.check_repo)(answers.repo);
                init_params.repo = answers.repo;
                if (answers.repo !== 'core') {
                    yield _ask_for_deploy(args);
                }
                else {
                    yield init(init_params);
                }
            }));
        }
        else {
            yield _ask_for_deploy(args);
        }
    });
}
function _ask_for_deploy(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const deploy = args.d || args.deploy;
        if (!deploy && init_params.force === false) {
            // output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'deploy',
                    message: 'How you want to deploy?',
                    choices: Object.keys(types_1.abstract_deploy)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                (0, common_1.check_deploy)(answers.deploy);
                init_params.deploy = answers.deploy;
                yield init(init_params);
            }));
        }
        else {
            yield init(init_params);
        }
    });
}
function _add_admin_files() {
    output_instance.start_loading(`Adding admin files...`);
    const fix_file_nuxt_types = `${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
    if (!util_instance.fs.exists(fix_file_nuxt_types)) {
        util_instance.spawn.exec_sync(`touch ${fix_file_nuxt_types}`);
    }
    output_instance.done_verbose_log('Added admin files.', 'adm');
}
function _replace_aliases() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Updating relative paths aliases...`);
        yield (0, alias_1.alias)(init_params, true);
        output_instance.done_verbose_log('Updated relative paths aliases.', 'alias');
    });
}
function _remove_tmp() {
    output_instance.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util_instance.fs.remove_directory(`${init_params.root}/${defaults_1.defaults.tmp_folder}`, 'tmp');
    output_instance.done_verbose_log(`Removed tmp folder [${defaults_1.defaults.tmp_folder}].`, 'tmp');
}
function _copy_assets() {
    _copy_book();
    _copy_sample();
    _copy_tsconfigs();
    _update_tsconfig_paths();
    _copy_eslint_files();
    _copy_main_files(init_params.repo);
}
function _copy_specific_assets() {
    if ((0, types_1.valid_deploy_repos)().includes(init_params.repo)) {
        if (init_params.deploy === 'netlify') {
            _copy_netlify_files();
        }
    }
    if ((0, types_1.valid_admin_repos)().includes(init_params.repo)) {
        _add_admin_files();
        _copy_admin_files();
    }
    if (init_params.repo === 'trx') {
        _copy_trx_files();
    }
}
function _create_dot_env() {
    const dot_env_path = `${init_params.root}/.env`;
    if (util_instance.fs.exists(dot_env_path)) {
        return;
    }
    util_instance.fs.copy_file(`${init_params.root}/sample.env`, dot_env_path);
}
function _update_tsconfig_paths() {
    const prefix = init_params.is_dot === true ? '.' : `${defaults_1.defaults.folder}/server`;
    const main_paths = _generate_paths_server(init_params.repo, prefix);
    const real_paths_server = _generate_paths_server(init_params.repo, `.`);
    const real_paths_client = _generate_paths_client(init_params.repo, `.`);
    const main_tsconfig = `tsconfig.json`;
    _update_paths(main_tsconfig, main_paths);
    const real_tsconfig_server = `.uranio/server/tsconfig.json`;
    _update_paths(real_tsconfig_server, real_paths_server);
    const real_tsconfig_client = `.uranio/client/tsconfig.json`;
    _update_paths(real_tsconfig_client, real_paths_client);
}
function _update_paths(tsconfig_filepath, paths) {
    if (!util_instance.fs.exists(tsconfig_filepath)) {
        util_instance.fs.write_file(tsconfig_filepath, '');
    }
    const content = util_instance.fs.read_file(tsconfig_filepath, 'utf8');
    const tsdata = JSON.parse(content);
    if (!tsdata.compilerOptions) {
        tsdata.compilerOptions = {};
    }
    if (!tsdata.compilerOptions.paths) {
        tsdata.compilerOptions.paths = [];
    }
    tsdata.compilerOptions.paths = paths;
    util_instance.fs.write_file(tsconfig_filepath, JSON.stringify(tsdata, null, '\t'));
}
function _generate_paths_server(repo, prefix) {
    const paths = {};
    paths['uranio'] = [`${prefix}/src/uranio`];
    paths['uranio-books'] = [`${prefix}/src/books`];
    paths['uranio-books/*'] = [`${prefix}/src/books/*`];
    switch (repo) {
        case 'core': {
            break;
        }
        case 'api': {
            paths['uranio-core'] = [`${prefix}/src/uranio/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/core/*`];
            break;
        }
        case 'trx': {
            paths['uranio-core'] = [`${prefix}/src/uranio/api/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/api/core/*`];
            paths['uranio-api'] = [`${prefix}/src/uranio/api`];
            paths['uranio-api/*'] = [`${prefix}/src/uranio/api/*`];
            break;
        }
        case 'adm': {
            paths['uranio-core'] = [`${prefix}/src/uranio/trx/api/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/trx/api/core/*`];
            paths['uranio-api'] = [`${prefix}/src/uranio/trx/api`];
            paths['uranio-api/*'] = [`${prefix}/src/uranio/trx/api/*`];
            paths['uranio-trx'] = [`${prefix}/src/uranio/trx`];
            paths['uranio-trx/*'] = [`${prefix}/src/uranio/trx/*`];
            break;
        }
    }
    return paths;
}
function _generate_paths_client(repo, prefix) {
    const paths = {};
    paths['uranio'] = [`${prefix}/src/uranio/client`];
    paths['uranio-books'] = [`${prefix}/src/books`];
    paths['uranio-books/*'] = [`${prefix}/src/books/*`];
    switch (repo) {
        case 'core': {
            break;
        }
        case 'api': {
            paths['uranio-core'] = [`${prefix}/src/uranio/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/core/*`];
            break;
        }
        case 'trx': {
            paths['uranio-core'] = [`${prefix}/src/uranio/api/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/api/core/*`];
            paths['uranio-api'] = [`${prefix}/src/uranio/api`];
            paths['uranio-api/*'] = [`${prefix}/src/uranio/api/*`];
            break;
        }
        case 'adm': {
            paths['uranio-core'] = [`${prefix}/src/uranio/trx/api/core`];
            paths['uranio-core/*'] = [`${prefix}/src/uranio/trx/api/core/*`];
            paths['uranio-api'] = [`${prefix}/src/uranio/trx/api`];
            paths['uranio-api/*'] = [`${prefix}/src/uranio/trx/api/*`];
            paths['uranio-trx'] = [`${prefix}/src/uranio/trx`];
            paths['uranio-trx/*'] = [`${prefix}/src/uranio/trx/*`];
            break;
        }
    }
    return paths;
}
function _clone_assets_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning assets...`);
        util_instance.fs.remove_directory(defaults_1.defaults.tmp_folder, 'assets');
        util_instance.fs.create_directory(defaults_1.defaults.tmp_folder, 'assets');
        yield util_instance.cmd.clone_repo(defaults_1.defaults.assets_repo, `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets`, 'assets', init_params.branch);
        output_instance.done_log(`Cloned assets repo.`, 'assets');
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
function _clone_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning [${init_params.repo}]...`);
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
            case 'adm': {
                yield _clone_adm();
                break;
            }
            default: {
                output_instance.error_log(`Selected repo is not valid. [${init_params.repo}]`, 'init');
                process.exit(1);
            }
        }
        output_instance.done_log(`Cloned repo [${init_params.repo}].`, 'repo');
    });
}
function _install_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Intalling [${init_params.repo}]...`);
        yield _install_dep();
        output_instance.done_log(`Installed repo [${init_params.repo}].`, 'repo');
    });
}
function _create_client_server_folders() {
    output_instance.start_loading(`Creating server folder...`);
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server/src`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/server/src/books`, 'init');
    output_instance.done_verbose_log(`Created server folders.`, 'init');
    output_instance.start_loading(`Creating client folder...`);
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client/src`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}/client/src/books`, 'init');
    output_instance.done_verbose_log(`Created client folders.`, 'init');
}
function _create_rc_file() {
    output_instance.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `\t"repo": "${init_params.repo}",\n`;
    content += `\t"pacman": "${init_params.pacman}",\n`;
    content += `\t"deploy": "${init_params.deploy}",\n`;
    content += `\t"docker": ${init_params.docker},\n`;
    content += `\t"docker_db": ${init_params.docker_db},\n`;
    content += `\t"db": "${init_params.db}",\n`;
    content += `}`;
    util_instance.fs.write_file(`${init_params.root}/${defaults_1.defaults.json_filename}`, content);
    util_instance.pretty(`${init_params.root}/${defaults_1.defaults.json_filename}`, 'json');
    output_instance.done_log(`Created file ${defaults_1.defaults.json_filename}.`, 'rcfl');
}
function _ignore_files() {
    output_instance.start_loading(`Adding entries to .gitignore...`);
    const gitignore = `${init_params.root}/.gitignore`;
    if (!util_instance.fs.exists(gitignore)) {
        util_instance.fs.create_file(gitignore, 'giti');
    }
    let content = util_instance.fs.read_file(gitignore, 'utf8');
    if (content.indexOf(defaults_1.defaults.folder + '/') === -1) {
        content += `\n${defaults_1.defaults.folder}/`;
    }
    if (content.indexOf(defaults_1.defaults.log_filepath) === -1) {
        content += `\n${defaults_1.defaults.log_filepath}`;
    }
    // if(content.indexOf(defaults.json_filename) === -1){
    //   content += `\n${defaults.json_filename}`;
    // }
    if (content.indexOf(`.env`) === -1) {
        content += `\n.env`;
    }
    util_instance.fs.write_file(gitignore, content);
    const log_msg = `Added entries to .gitignore.`;
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
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        const old_scripts = package_data['scripts'] || {};
        package_data['scripts'] = Object.assign(Object.assign({}, old_scripts), { 'build': `uranio build`, 'build:server': `uranio build:client`, 'build:client': `uranio build:client`, 'dev': `uranio dev`, 'dev:server': `uranio dev:server`, 'dev:client': `uranio dev:client` });
        try {
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
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
    output_instance.start_loading('Updating package.json aliases...');
    const package_json_path = `${init_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        package_data['_moduleAliases'] = {
            'uranio': `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/`,
            'uranio-books': `./dist/${defaults_1.defaults.folder}/server/src/books/`,
        };
        switch (init_params.repo) {
            case 'adm': {
                package_data['_moduleAliases']['uranio-trx'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx/`;
                package_data['_moduleAliases']['uranio-api'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx/api/`;
                package_data['_moduleAliases']['uranio-core'] =
                    `./dist/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx/api/core/`;
                break;
            }
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
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
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
function _copy_book() {
    const book_file = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/main/book.txt`;
    const dest = `${init_params.root}/src/book.ts`;
    if (!util_instance.fs.exists(dest)) {
        util_instance.fs.copy_file(book_file, dest, 'book');
    }
}
function _copy_sample() {
    const sample_file = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/env/sample.env`;
    const dest = `${init_params.root}/sample.env`;
    util_instance.fs.copy_file(sample_file, dest, 'book');
}
function _copy_tsconfigs() {
    const ass_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets`;
    const ts_dir = `${ass_dir}/typescript`;
    const dot_tsc_file = `${ts_dir}/root/tsconfig.json`;
    const dest = `${init_params.root}/tsconfig.json`;
    util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
    const dot_tsc_file_server = `${ts_dir}/server/${init_params.deploy}/tsconfig.json`;
    const dest_server = `${init_params.root}/.uranio/server/tsconfig.json`;
    util_instance.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
    const dot_tsc_file_client = `${ts_dir}/client/tsconfig.json`;
    const dest_client = `${init_params.root}/.uranio/client/tsconfig.json`;
    util_instance.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}
function _copy_eslint_files() {
    const eslint_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/eslint`;
    const dest_dir = `${init_params.root}`;
    util_instance.fs.copy_file(`${eslint_dir}/.eslintignore`, `${dest_dir}/.eslintignore`, 'esln');
    util_instance.fs.copy_file(`${eslint_dir}/.eslintrc.js`, `${dest_dir}/.eslintrc.js`, 'esln');
    util_instance.fs.copy_file(`${eslint_dir}/.stylelintrc.json`, `${dest_dir}/.stylelintrc.json`, 'esln');
}
function _copy_netlify_files() {
    const netlify_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/netlify`;
    const toml_file = `${netlify_dir}/netlify.toml`;
    const toml_dest = `${init_params.root}/netlify.toml`;
    util_instance.fs.copy_file(toml_file, toml_dest, 'ntlf');
    const function_folder = `${init_params.root}/${defaults_1.defaults.folder}/server/src/functions`;
    if (!util_instance.fs.exists(function_folder)) {
        util_instance.fs.create_directory(function_folder);
    }
    let api_file = `api.txt`;
    if (init_params.repo === 'api') {
        api_file = `api-api.txt`;
    }
    const functions_file = `${netlify_dir}/functions/${api_file}`;
    const functions_dest = `${function_folder}/api.ts`;
    util_instance.fs.copy_file(functions_file, functions_dest, 'assets');
}
function _copy_admin_files() {
    const nuxt_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/nuxt`;
    const nuxt_config_file = `${nuxt_dir}/nuxt.config.${init_params.deploy}.js`;
    const nuxt_config_dest = `${init_params.root}/${defaults_1.defaults.folder}/client/nuxt.config.js`;
    util_instance.fs.copy_file(nuxt_config_file, nuxt_config_dest, 'adm');
}
function _copy_trx_files() {
    const assets_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/`;
    const trx_main_dir = `${assets_dir}/main/trx`;
    const dist_folder = `${init_params.root}/dist`;
    if (!util_instance.fs.exists(dist_folder)) {
        util_instance.fs.create_directory(dist_folder, 'trx');
    }
    const html_file = `${trx_main_dir}/index.html`;
    const html_dest = `${dist_folder}/index.html`;
    util_instance.fs.copy_file(html_file, html_dest, 'trx');
    const webpack_config = `${assets_dir}/webpack/webpack.config.js`;
    const webpack_dest = `${init_params.root}/${defaults_1.defaults.folder}/client/webpack.config.js`;
    util_instance.fs.copy_file(webpack_config, webpack_dest, 'trx');
}
function _copy_main_files(repo) {
    const core_assets_dir = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/main/${repo}`;
    const src_folder = `${init_params.root}/src`;
    if (!util_instance.fs.exists(src_folder)) {
        util_instance.fs.create_directory(src_folder);
    }
    const index_file = `${core_assets_dir}/index.txt`;
    const index_dest = `${src_folder}/index.ts`;
    const repo_dest = `${src_folder}/${repo}.ts`;
    util_instance.fs.copy_file(index_file, repo_dest, 'core');
    if (!util_instance.fs.exists(index_dest)) {
        util_instance.fs.copy_file(index_file, index_dest, 'core');
    }
}
function _clone_core() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning core...`);
        yield util_instance.cmd.clone_repo(defaults_1.defaults.core_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'core', init_params.branch);
        yield util_instance.cmd.clone_repo(defaults_1.defaults.core_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'core', init_params.branch);
        output_instance.done_verbose_log(`Cloned core repo.`, 'core');
    });
}
function _clone_api() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning api...`);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.api_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'api', init_params.branch);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.api_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'api', init_params.branch);
        output_instance.done_verbose_log(`Cloned api repo.`, 'api');
    });
}
function _clone_trx() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning trx...`);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.trx_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'trx', init_params.branch);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.trx_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'trx', init_params.branch);
        output_instance.done_verbose_log(`Cloned trx repo.`, 'trx');
    });
}
function _clone_adm() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning adm...`);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.adm_repo, `${init_params.root}/${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`, 'adm', init_params.branch);
        yield util_instance.cmd.clone_repo_recursive(defaults_1.defaults.adm_repo, `${init_params.root}/${defaults_1.defaults.folder}/client/src/${defaults_1.defaults.repo_folder}`, 'adm', init_params.branch);
        output_instance.done_verbose_log(`Cloned adm repo.`, 'adm');
    });
}
function _install_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        const pack_data = util_instance.cmd.get_package_data(`${init_params.root}/package.json`);
        yield util_instance.cmd.uninstall_core_dep(pack_data);
        yield util_instance.cmd.uninstall_api_dep(pack_data);
        yield util_instance.cmd.uninstall_trx_dep(pack_data);
        yield util_instance.cmd.uninstall_adm_dep(pack_data);
        switch (init_params.repo) {
            case 'core': {
                yield util_instance.cmd.install_core_dep();
                return true;
            }
            case 'api': {
                yield util_instance.cmd.install_api_dep();
                return true;
            }
            case 'trx': {
                yield util_instance.cmd.install_trx_dep();
                return true;
            }
            case 'adm': {
                yield util_instance.cmd.install_adm_dep();
                return true;
            }
            default: {
                output_instance.log(`Selected repo is not valid. [${init_params.repo}]`, 'init');
                process.exit(1);
            }
        }
    });
}
//# sourceMappingURL=init.js.map