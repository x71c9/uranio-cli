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
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../log/"));
const util = __importStar(require("../util/"));
const title_1 = require("./title");
exports.init = {
    run: (args) => __awaiter(void 0, void 0, void 0, function* () {
        console.clear();
        title_1.title();
        output.start_loading('Initialization...');
        const repo = args.r || args.repo || defaults_1.defaults.default_repo;
        _check_repo(repo);
        _update_aliases(repo);
        // _create_src_folder();
        _create_urn_folder();
        _create_rc_file(repo);
        yield _clone_dot();
        _copy_dot_files();
        _copy_uranio_repo(repo);
        _remove_tmp();
        yield _install_dep(repo);
        // await _clone_and_install_repo(repo);
        output.end_log(`Initialization completed.`);
    })
};
function _remove_tmp() {
    output.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util.remove_folder_if_exists('dot', `${global.uranio.root}/${defaults_1.defaults.tmp_folder}`);
    // util.sync_exec(`rm -rf ${global.uranio.root}/${defaults.tmp_folder}`);
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
function _copy_uranio_repo(repo) {
    const dot_folder = `${global.uranio.root}/${defaults_1.defaults.tmp_folder}/urn-dot`;
    let srcs = '';
    switch (repo) {
        case 'core': {
            srcs = `${dot_folder}/${defaults_1.defaults.folder}/web/core`;
            break;
        }
        case 'web': {
            srcs = `${dot_folder}/${defaults_1.defaults.folder}/web`;
            break;
        }
    }
    if (srcs !== '') {
        util.copy_files('dot', srcs, `${global.uranio.root}/${defaults_1.defaults.folder}`);
    }
}
function _copy_dot_files() {
    const dot_folder = `${global.uranio.root}/${defaults_1.defaults.tmp_folder}/urn-dot`;
    let srcs = ``;
    srcs += `${dot_folder}/src `;
    srcs += `${dot_folder}/tsconfig.json `;
    srcs += `${dot_folder}/.eslintignore ${dot_folder}/.eslintrc.js`;
    const dest = `${global.uranio.root}/`;
    util.copy_files('dot', srcs, dest);
}
function _create_rc_file(repo) {
    output.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `"repo": "${repo}"\n`;
    content += `}`;
    fs_1.default.writeFileSync(`${global.uranio.root}/${defaults_1.defaults.rcfile_path}`, content);
    util.prettier(`${global.uranio.root}/${defaults_1.defaults.rcfile_path}`);
    output.done_log('rcfl', `${defaults_1.defaults.rcfile_path} created.`);
}
function _check_repo(repo) {
    switch (repo) {
        case 'core':
        case 'web': {
            break;
        }
        default: {
            const valid_repos_str = types_1.valid_repos().join(', ');
            let end_log = '';
            end_log += `Wrong repo. `;
            end_log += `Repo must be one of the following [${valid_repos_str}]`;
            output.end_log(end_log);
            process.exit(1);
        }
    }
}
// async function _clone_dot_in_temp(){
//   output.start_loading(`Cloning and intalling [${defaults.dot_repo}]...`);
//   await _clone_dot();
//   output.done_log('repo', `Cloned and installed repo [${defaults.dot_repo}].`);
// }
// async function _clone_and_install_repo(repo:Repo){
//   output.start_loading(`Cloning and intalling [${repo}]...`);
//   // await _clone_dot();
//   output.done_log('repo', `Cloned and installed repo [${repo}].`);
// }
// async function _clone_and_install_repo(repo:Repo){
//   output.start_loading(`Cloning and intalling [${repo}]...`);
//   switch(repo){
//     case 'core':{
//       await _clone_core();
//       await _uninstall_core_dep();
//       await _install_core_dep();
//       break;
//     }
//     case 'web':{
//       await _clone_core();
//       await _clone_web();
//       await _uninstall_web_dep();
//       await _install_web_dep();
//       break;
//     }
//     default:{
//       output.log('init', `Selected repo is not valid. [${repo}]`);
//       process.exit(1);
//     }
//   }
//   output.done_log('repo', `Cloned and installed repo [${repo}].`);
// }
function _create_urn_folder() {
    output.start_loading(`Creating ${defaults_1.defaults.folder} folder...`);
    util.remove_folder_if_exists('init', `${global.uranio.root}/${defaults_1.defaults.folder}`);
    util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/${defaults_1.defaults.folder}`);
    output.done_log('init', `Created folder ${defaults_1.defaults.folder}.`);
}
// function _create_src_folder(){
//   output.start_loading(`Creating src folder...`);
//   util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/src`);
//   // util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/dist`);
//   output.done_log('init', `Created src folder.`);
// }
// function _copy_book_file(){
//   output.start_loading(`Copying book file...`);
//   _copy_file('init', './src/files/book.ts', `./${defaults.folder}/book.ts`);
//   output.done_log('init', `Copied book file.`);
// }
// function _copy_types_file(){
//   output.start_loading(`Copying types file...`);
//   _copy_file('init', './src/files/types.ts', `./${defaults.folder}/types.ts`);
//   output.done_log('init', `Copied types file.`);
// }
function _update_aliases(repo) {
    output.start_loading('Updating aliases...');
    const data = fs_1.default.readFileSync(`${global.uranio.root}/package.json`, 'utf8');
    const package_data = JSON.parse(data);
    package_data['_moduleAliases'] = {
        urn_books: `./dist/${defaults_1.defaults.folder}/books.js`,
        uranio: `./dist/${defaults_1.defaults.folder}/core/`
    };
    if (repo === 'web') {
        package_data['_moduleAliases']['uranio'] = `./dist/${defaults_1.defaults.folder}/web/`;
    }
    fs_1.default.writeFileSync(`${global.uranio.root}/package.json`, JSON.stringify(package_data, null, '\t'));
    output.done_log('alas', `Aliases updated.`);
}
// function _copy_tsconfig_file(){
//   _copy_file('./src/files/tsconfig.json', './tsconfig.json');
//   output.done_log('tsco', `Copied tsconfig file.`);
// }
// function _copy_eslint_files(){
//   output.start_loading(`Copying eslint files...`);
//   _copy_files('init', `${global.uranio.root}/src/files/.eslintrc.js ${global.uranio.root}/src/files/.eslintignore`, global.uranio.root);
//   output.done_log('esln', `Copied eslint files.`);
// }
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
        const dep_folder = `${global.uranio.root}/node_modules/${defaults_1.defaults.core_dep_repo}`;
        util.remove_folder_if_exists('core', dep_folder);
        const dep_dev_folder = `${global.uranio.root}/node_modules/${defaults_1.defaults.core_dep_dev_repo}`;
        util.remove_folder_if_exists('core', dep_dev_folder);
        yield util.uninstall_dep(`${defaults_1.defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults_1.defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
        output.done_log('core', `Uninstalled core dependencies.`);
        return true;
    });
}
function _uninstall_web_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Uninstalling web dep...`);
        const dep_folder = `${global.uranio.root}/node_modules/${defaults_1.defaults.web_dep_repo}`;
        util.remove_folder_if_exists('web_', dep_folder);
        const dep_dev_folder = `${global.uranio.root}/node_modules/${defaults_1.defaults.web_dep_dev_repo}`;
        util.remove_folder_if_exists('web_', dep_dev_folder);
        yield util.uninstall_dep(`${defaults_1.defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults_1.defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
        output.done_log('web', `Uninstalled web dependencies.`);
        return true;
    });
}
function _clone_dot() {
    return __awaiter(this, void 0, void 0, function* () {
        output.start_loading(`Cloning dot...`);
        const tmp = `${global.uranio.root}/${defaults_1.defaults.tmp_folder}`;
        util.remove_folder_if_exists('dot', tmp);
        util.create_folder_if_doesnt_exists('dot', tmp);
        yield util.clone_repo('dot', defaults_1.defaults.dot_repo, `${defaults_1.defaults.tmp_folder}/urn-dot`);
        output.done_log('dot', `Cloned dot repo.`);
    });
}
// async function _clone_core(){
//   output.start_loading(`Cloning core...`);
//   await util.clone_repo('core', defaults.core_repo, 'urn-core');
//   output.done_log('core', `Cloned core repo.`);
// }
// async function _clone_web(){
//   output.start_loading(`Cloning web...`);
//   await util.clone_repo('web_', defaults.web_repo, 'urn-web');
//   output.done_log('web', `Cloned web repo.`);
// }
//# sourceMappingURL=init.js.map