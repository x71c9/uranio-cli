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
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const title_1 = require("./title");
exports.init = {
    run: (root, repo, options) => __awaiter(void 0, void 0, void 0, function* () {
        options.root = root;
        options.repo = repo;
        common.init_run(options);
        yield _initialize();
    }),
    command: (args) => __awaiter(void 0, void 0, void 0, function* () {
        console.clear();
        title_1.title();
        if (_is_already_initialized() && defaults_1.conf.force === false) {
            output.stop_loading();
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
            ]).then((answer) => __awaiter(void 0, void 0, void 0, function* () {
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
    })
};
function _initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        if (defaults_1.conf.pacman === 'yarn' && !fs_1.default.existsSync(`${defaults_1.conf.root}/yarn.lock`)) {
            yield new Promise((resolve, reject) => {
                util.spawn_cmd(`yarn install`, 'yarn', 'Yarn install', resolve, reject);
            });
        }
        output.verbose_log('root', `$URNROOT$Project root: [${defaults_1.conf.root}]`);
        output.verbose_log('repo', `Selected repo: [${defaults_1.conf.repo}]`);
        output.start_loading('Initialization...');
        _update_aliases();
        _create_urn_folder();
        _ignore_urn_folder();
        _create_json_file();
        yield _clone_dot();
        _copy_dot_files();
        yield _clone_and_install_repo();
        _create_client_server_folders();
        _remove_tmp();
        output.end_log(`Initialization completed.`);
    });
}
function _is_already_initialized() {
    return (fs_1.default.existsSync(`${defaults_1.conf.root}/${defaults_1.jsonfile_path}`));
}
function _ask_for_pacman(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pacman = args.pacman;
        if (!pacman && defaults_1.conf.force === false) {
            output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'pacman',
                    message: 'Select which package manager you want to use:',
                    choices: Object.keys(types_1.abstract_pacman)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                util.set_pacman(answers.pacman);
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
        if (!repo && defaults_1.conf.force === false) {
            output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'repo',
                    message: 'Select which URANIO repo you want to use:',
                    choices: Object.keys(types_1.abstract_repos)
                }
            ]).then((answers) => __awaiter(this, void 0, void 0, function* () {
                yield _proceed_with_repo(answers.repo);
            }));
        }
        else {
            yield _proceed_with_repo(repo);
        }
    });
}
function _proceed_with_repo(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        util.set_repo(repo);
        console.clear();
        title_1.title();
        yield _initialize();
    });
}
function _ignore_urn_folder() {
    output.start_loading(`Adding ${defaults_1.defaults.folder} to .gitignore...`);
    const gitignore = `${defaults_1.conf.root}/.gitignore`;
    if (!fs_1.default.existsSync(gitignore)) {
        util.sync_exec(`touch ${gitignore}`);
    }
    let content = fs_1.default.readFileSync(gitignore, 'utf8');
    if (content.indexOf(defaults_1.defaults.folder + '/') === -1) {
        content += `\n${defaults_1.defaults.folder}/`;
    }
    if (content.indexOf(defaults_1.defaults.log_filepath + '/') === -1) {
        content += `\n${defaults_1.defaults.log_filepath}/`;
    }
    fs_1.default.writeFileSync(gitignore, content);
    const log_msg = `Added ${defaults_1.defaults.folder} and ${defaults_1.defaults.log_filepath} to .gitignore.`;
    output.done_log('.git', log_msg);
}
function _remove_tmp() {
    output.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util.remove_folder_if_exists('dot', defaults_1.defaults.tmp_folder);
    output.done_verbose_log('tmp', `Removed tmp folder [${defaults_1.defaults.tmp_folder}].`);
}
function _install_dep(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield _uninstall_core_dep();
        yield _uninstall_web_dep();
        yield _uninstall_ntl_dep();
        switch (repo) {
            case 'core': {
                yield _install_core_dep();
                return true;
            }
            case 'web': {
                yield _install_web_dep();
                return true;
            }
            case 'ntl': {
                yield _install_ntl_dep();
                return true;
            }
            // default:{
            //   output.log('init', `Selected repo is not valid. [${repo}]`);
            //   process.exit(1);
            // }
        }
    });
}
function _copy_dot_src_folder() {
    const dot_src_folder = `${defaults_1.conf.root}/${defaults_1.defaults.tmp_folder}/urn-dot/src`;
    const dest = `${defaults_1.conf.root}/`;
    util.copy_folder('dot', dot_src_folder, dest);
}
function _copy_dot_tsconfig() {
    const dot_tsc_file = `${defaults_1.conf.root}/${defaults_1.defaults.tmp_folder}/urn-dot/tsconfig.json`;
    const dest = `${defaults_1.conf.root}/`;
    util.copy_file('dot', dot_tsc_file, dest);
}
function _copy_dot_eslint_files() {
    const dot_eslint_files = `${defaults_1.conf.root}/${defaults_1.defaults.tmp_folder}/urn-dot/.eslint*`;
    const dest = `${defaults_1.conf.root}/`;
    util.copy_files('dot', dot_eslint_files, dest);
}
function _copy_dot_files() {
    if (fs_1.default.existsSync(`${defaults_1.conf.root}/src`) === false) {
        _copy_dot_src_folder();
    }
    // if(fs.existsSync(`${conf.root}/tsconfig.json`) === false){
    _copy_dot_tsconfig();
    // }
    _copy_dot_eslint_files();
}
function _create_json_file() {
    output.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `\t"repo": "${defaults_1.conf.repo}",\n`;
    content += `\t"pacman": "${defaults_1.conf.pacman}"\n`;
    content += `}`;
    fs_1.default.writeFileSync(`${defaults_1.conf.root}/${defaults_1.jsonfile_path}`, content);
    util.pretty(`${defaults_1.conf.root}/${defaults_1.jsonfile_path}`, 'json');
    output.done_log('rcfl', `Created file ${defaults_1.jsonfile_path}.`);
}
function _clone_and_install_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning and intalling [${defaults_1.conf.repo}]...`);
        switch (defaults_1.conf.repo) {
            case 'core': {
                yield _clone_core();
                break;
            }
            case 'web': {
                yield _clone_web();
                break;
            }
            case 'ntl': {
                yield _clone_ntl();
                break;
            }
            default: {
                output.log('init', `Selected repo is not valid. [${defaults_1.conf.repo}]`);
                process.exit(1);
            }
        }
        yield _install_dep(defaults_1.conf.repo);
        output.done_log('repo', `Cloned and installed repo [${defaults_1.conf.repo}].`);
    });
}
function _create_urn_folder() {
    output.start_loading(`Creating ${defaults_1.defaults.folder} folder...`);
    util.remove_folder_if_exists('init', `${defaults_1.conf.root}/${defaults_1.defaults.folder}`);
    util.create_folder_if_doesnt_exists('init', `${defaults_1.conf.root}/${defaults_1.defaults.folder}`);
    output.done_log('init', `Created folder ${defaults_1.defaults.folder}.`);
}
function _create_client_server_folders() {
    output.start_loading(`Creating client folder...`);
    util.create_folder_if_doesnt_exists('init', `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client`);
    output.start_loading(`Creating server folder...`);
    util.create_folder_if_doesnt_exists('init', `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server`);
    if (defaults_1.conf.repo === 'ntl') {
        output.start_loading(`Creating server functions folder...`);
        util.create_folder_if_doesnt_exists('init', `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/functions`);
    }
    output.done_log('init', `Created client server folders.`);
}
function _update_aliases() {
    output.start_loading('Updating aliases...');
    const data = fs_1.default.readFileSync(`${defaults_1.conf.root}/package.json`, 'utf8');
    const package_data = JSON.parse(data);
    package_data['_moduleAliases'] = {
        'uranio': `./dist/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}/`,
        'uranio-books': `./dist/${defaults_1.defaults.folder}/server/books.js`,
        'uranio-client': `./dist/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}/client`
    };
    if (defaults_1.conf.repo !== 'core') {
        package_data['_moduleAliases']['uranio-core'] = `./dist/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}/core/`;
    }
    fs_1.default.writeFileSync(`${defaults_1.conf.root}/package.json`, JSON.stringify(package_data, null, '\t'));
    output.done_log('alas', `Updated aliases.`);
}
function _install_core_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Installing core dep...`);
        yield util.install_dep(defaults_1.defaults.core_dep_repo, 'core');
        yield util.install_dep_dev(defaults_1.defaults.core_dep_dev_repo, 'core');
        output.done_log('core', `Installed core dependencies.`);
        return true;
    });
}
function _install_web_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Installing web dep...`);
        yield util.install_dep(defaults_1.defaults.web_dep_repo, 'web');
        yield util.install_dep_dev(defaults_1.defaults.web_dep_dev_repo, 'web');
        output.done_log('web', `Installed web dependencies.`);
        return true;
    });
}
function _install_ntl_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Installing ntl dep...`);
        yield util.install_dep(defaults_1.defaults.ntl_dep_repo, 'ntl');
        yield util.install_dep_dev(defaults_1.defaults.ntl_dep_dev_repo, 'ntl');
        output.done_log('ntl', `Installed ntl dependencies.`);
        return true;
    });
}
function _uninstall_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const short_repo = (repo.substr(0, 3) === 'ssh' || repo.substr(0, 7) === 'git+ssh') ?
            repo.split('/').slice(-1)[0] : repo;
        if (util.dependency_exists(short_repo)) {
            output.start_loading(`Uninstalling ${short_repo} dep...`);
            const dep_folder = `${defaults_1.conf.root}/node_modules/${short_repo}`;
            util.remove_folder_if_exists(context, dep_folder);
            const dep_dev_folder = `${defaults_1.conf.root}/node_modules/${short_repo}`;
            util.remove_folder_if_exists(context, dep_dev_folder);
            yield util.uninstall_dep(`${short_repo}`, context);
            output.done_log(context, `Uninstalled ${short_repo} dependencies.`);
            return true;
        }
    });
}
function _uninstall_core_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        // output.start_loading(`Uninstalling core dep...`);
        // const dep_folder = `${conf.root}/node_modules/${defaults.core_dep_repo}`;
        // util.remove_folder_if_exists('core', dep_folder);
        // const dep_dev_folder = `${conf.root}/node_modules/${defaults.core_dep_dev_repo}`;
        // util.remove_folder_if_exists('core', dep_dev_folder);
        // await util.uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
        // output.done_log('core', `Uninstalled core dependencies.`);
        // return true;
        yield _uninstall_dep(defaults_1.defaults.core_dep_repo, 'core');
        yield _uninstall_dep(defaults_1.defaults.core_dep_dev_repo, 'core');
        return true;
    });
}
function _uninstall_web_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        // output.start_loading(`Uninstalling web dep...`);
        // const dep_folder = `${conf.root}/node_modules/${defaults.web_dep_repo}`;
        // util.remove_folder_if_exists('web_', dep_folder);
        // const dep_dev_folder = `${conf.root}/node_modules/${defaults.web_dep_dev_repo}`;
        // util.remove_folder_if_exists('web_', dep_dev_folder);
        // await util.uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.web_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
        // output.done_log('web', `Uninstalled web dependencies.`);
        // return true;
        yield _uninstall_dep(defaults_1.defaults.web_dep_repo, 'web');
        yield _uninstall_dep(defaults_1.defaults.web_dep_dev_repo, 'web');
        return true;
    });
}
function _uninstall_ntl_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        // output.start_loading(`Uninstalling ntl dep...`);
        // const dep_folder = `${conf.root}/node_modules/${defaults.ntl_dep_repo}`;
        // util.remove_folder_if_exists('ntl_', dep_folder);
        // const dep_dev_folder = `${conf.root}/node_modules/${defaults.ntl_dep_dev_repo}`;
        // util.remove_folder_if_exists('ntl_', dep_dev_folder);
        // await util.uninstall_dep(`${defaults.ntl_dep_repo.split('/').slice(-1)[0]} ${defaults.ntl_dep_dev_repo.split('/').slice(-1)[0]}`, 'ntl_');
        // output.done_log('ntl', `Uninstalled ntl dependencies.`);
        // return true;
        yield _uninstall_dep(defaults_1.defaults.ntl_dep_repo, 'ntl');
        yield _uninstall_dep(defaults_1.defaults.ntl_dep_dev_repo, 'ntl');
        return true;
    });
}
function _clone_dot() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning dot...`);
        util.remove_folder_if_exists('dot', defaults_1.defaults.tmp_folder);
        util.create_folder_if_doesnt_exists('dot', defaults_1.defaults.tmp_folder);
        yield util.clone_repo('dot', defaults_1.defaults.dot_repo, `${defaults_1.conf.root}/${defaults_1.defaults.tmp_folder}/urn-dot`);
        output.done_log('dot', `Cloned dot repo.`);
    });
}
function _clone_core() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning core...`);
        yield util.clone_repo('core', defaults_1.defaults.core_repo, `${defaults_1.conf.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`);
        output.done_log('core', `Cloned core repo.`);
    });
}
function _clone_web() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning web...`);
        yield util.clone_repo_recursive('web_', defaults_1.defaults.web_repo, `${defaults_1.conf.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`);
        output.done_log('web', `Cloned web repo.`);
    });
}
function _clone_ntl() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning ntl...`);
        yield util.clone_repo_recursive('ntl_', defaults_1.defaults.ntl_repo, `${defaults_1.conf.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`);
        output.done_log('ntl', `Cloned ntl repo.`);
    });
}
//# sourceMappingURL=init.js.map