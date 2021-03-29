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
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../log/"));
const util = __importStar(require("../util/"));
const title_1 = require("./title");
exports.init = {
    run: (args) => __awaiter(void 0, void 0, void 0, function* () {
        console.clear();
        title_1.title();
        if (_is_already_initialized()) {
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
                    _initialize(args);
                }
                else {
                    process.exit(0);
                }
            }));
        }
        else {
            yield _initialize(args);
        }
    })
};
function _is_already_initialized() {
    return (fs_1.default.existsSync(defaults_1.defaults.rcfile_path));
}
function _initialize(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = args.r || args.repo;
        if (!repo) {
            output.stop_loading();
            inquirer_1.default.
                prompt([
                {
                    type: 'list',
                    name: 'repo',
                    message: 'Which repo do you want to clone?',
                    choices: [
                        'core',
                        'web',
                        'adm',
                        'srvl'
                    ]
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
        console.clear();
        title_1.title();
        output.log('root', `$URNROOT$Project root: [${global.uranio.root}]`);
        output.log('repo', `Selected repo: [${repo}]`);
        output.start_loading('Initialization...');
        util.set_repo(repo);
        _update_aliases();
        _create_urn_folder();
        _ignore_urn_folder();
        _create_rc_file();
        yield _clone_dot();
        _copy_dot_files();
        yield _clone_and_install_repo();
        _remove_tmp();
        output.end_log(`Initialization completed.`);
    });
}
function _ignore_urn_folder() {
    output.start_loading(`Adding ${defaults_1.defaults.folder} to .gitignore...`);
    const gitignore = `.gitignore`;
    if (!fs_1.default.existsSync(gitignore)) {
        util.sync_exec(`touch .gitignore`);
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
    output.done_verbose_log('.git', log_msg);
}
function _remove_tmp() {
    output.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util.remove_folder_if_exists('dot', defaults_1.defaults.tmp_folder);
    output.done_verbose_log('tmp', `Removed tmp folder [${defaults_1.defaults.tmp_folder}].`);
}
function _install_dep(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (repo) {
            case 'core': {
                yield _uninstall_core_dep();
                yield _uninstall_web_dep();
                yield _install_core_dep();
                break;
            }
            case 'web': {
                yield _uninstall_core_dep();
                yield _uninstall_web_dep();
                yield _install_web_dep();
                break;
            }
            default: {
                output.log('init', `Selected repo is not valid. [${repo}]`);
                process.exit(1);
            }
        }
    });
}
function _copy_dot_src_folder() {
    const dot_src_folder = `${defaults_1.defaults.tmp_folder}/urn-dot/src`;
    const dest = `./`;
    util.copy_folder('dot', dot_src_folder, dest);
}
function _copy_dot_tsconfig() {
    const dot_tsc_file = `${defaults_1.defaults.tmp_folder}/urn-dot/tsconfig.json`;
    const dest = `./`;
    util.copy_file('dot', dot_tsc_file, dest);
}
function _copy_dot_eslint_files() {
    const dot_eslint_files = `${defaults_1.defaults.tmp_folder}/urn-dot/.eslint*`;
    const dest = `./`;
    util.copy_files('dot', dot_eslint_files, dest);
}
function _copy_dot_files() {
    _copy_dot_src_folder();
    _copy_dot_tsconfig();
    _copy_dot_eslint_files();
}
function _create_rc_file() {
    output.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `"repo": "${global.uranio.repo}"\n`;
    content += `}`;
    fs_1.default.writeFileSync(defaults_1.defaults.rcfile_path, content);
    util.pretty(defaults_1.defaults.rcfile_path, 'json');
    output.done_log('rcfl', `[${defaults_1.defaults.rcfile_path}] created.`);
}
function _clone_and_install_repo() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning and intalling [${global.uranio.repo}]...`);
        switch (global.uranio.repo) {
            case 'core': {
                yield _clone_core();
                break;
            }
            case 'web': {
                yield _clone_web();
                break;
            }
            default: {
                output.log('init', `Selected repo is not valid. [${global.uranio.repo}]`);
                process.exit(1);
            }
        }
        yield _install_dep(global.uranio.repo);
        output.done_log('repo', `Cloned and installed repo [${global.uranio.repo}].`);
    });
}
function _create_urn_folder() {
    output.start_loading(`Creating ${defaults_1.defaults.folder} folder...`);
    util.remove_folder_if_exists('init', defaults_1.defaults.folder);
    util.create_folder_if_doesnt_exists('init', defaults_1.defaults.folder);
    output.done_log('init', `Created folder ${defaults_1.defaults.folder}.`);
}
function _update_aliases() {
    output.start_loading('Updating aliases...');
    const data = fs_1.default.readFileSync(`./package.json`, 'utf8');
    const package_data = JSON.parse(data);
    package_data['_moduleAliases'] = {
        urn_books: `./dist/${defaults_1.defaults.folder}/books.js`,
        uranio: `./dist/${defaults_1.defaults.folder}/${global.uranio.repo}/`
    };
    fs_1.default.writeFileSync(`./package.json`, JSON.stringify(package_data, null, '\t'));
    output.done_log('alas', `Aliases updated.`);
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
        yield util.install_dep(defaults_1.defaults.web_dep_repo, 'web_');
        yield util.install_dep_dev(defaults_1.defaults.web_dep_dev_repo, 'web_');
        output.done_log('web', `Installed web dependencies.`);
        return true;
    });
}
function _uninstall_core_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Uninstalling core dep...`);
        const dep_folder = `./node_modules/${defaults_1.defaults.core_dep_repo}`;
        util.remove_folder_if_exists('core', dep_folder);
        const dep_dev_folder = `./node_modules/${defaults_1.defaults.core_dep_dev_repo}`;
        util.remove_folder_if_exists('core', dep_dev_folder);
        yield util.uninstall_dep(`${defaults_1.defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults_1.defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
        output.done_log('core', `Uninstalled core dependencies.`);
        return true;
    });
}
function _uninstall_web_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Uninstalling web dep...`);
        const dep_folder = `./node_modules/${defaults_1.defaults.web_dep_repo}`;
        util.remove_folder_if_exists('web_', dep_folder);
        const dep_dev_folder = `./node_modules/${defaults_1.defaults.web_dep_dev_repo}`;
        util.remove_folder_if_exists('web_', dep_dev_folder);
        yield util.uninstall_dep(`${defaults_1.defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults_1.defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
        output.done_log('web', `Uninstalled web dependencies.`);
        return true;
    });
}
function _clone_dot() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning dot...`);
        util.remove_folder_if_exists('dot', defaults_1.defaults.tmp_folder);
        util.create_folder_if_doesnt_exists('dot', defaults_1.defaults.tmp_folder);
        yield util.clone_repo('dot', defaults_1.defaults.dot_repo, `${defaults_1.defaults.tmp_folder}/urn-dot`);
        output.done_log('dot', `Cloned dot repo.`);
    });
}
function _clone_core() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning core...`);
        yield util.clone_repo('core', defaults_1.defaults.core_repo, `${defaults_1.defaults.folder}/core`);
        output.done_log('core', `Cloned core repo.`);
    });
}
function _clone_web() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning web...`);
        yield util.clone_repo_recursive('web_', defaults_1.defaults.web_repo, `${defaults_1.defaults.folder}/web`);
        output.done_log('web', `Cloned web repo.`);
    });
}
//# sourceMappingURL=init.js.map