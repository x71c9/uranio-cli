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
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const docker = __importStar(require("./docker"));
const types_1 = require("../types");
const title_1 = require("./title");
const common_1 = require("./common");
let output_instance;
let util_instance;
let init_params = defaults_1.default_params;
let dot_folder = `./${defaults_1.defaults.folder}`;
let init_filepath = `${dot_folder}/${defaults_1.defaults.init_filepath}`;
function init(params) {
    return __awaiter(this, void 0, void 0, function* () {
        init_params = (0, common_1.merge_init_params)(params);
        output_instance = output.create(init_params);
        util_instance = util.create(init_params, output_instance);
        dot_folder = `${init_params.root}/${defaults_1.defaults.folder}`;
        init_filepath = `${dot_folder}/${defaults_1.defaults.init_filepath}`;
        yield _clone_assets_repo();
        _log_important_params();
        _create_dot_dir();
        _create_init_file();
        _create_src_dirs();
        _copy_assets();
        _create_dot_env();
        _ignore_files();
        _update_resolutions();
        if (init_params.docker === true) {
            yield docker.build(init_params);
            yield docker.create(init_params);
            yield docker.network_create(init_params);
        }
        else {
            yield _init_pacman();
            yield _install_dev_dep();
            _update_package_scripts();
            yield _install_packages();
        }
        if (init_params.docker_db === true) {
            if (init_params.docker === false) {
                yield docker.network_create(init_params);
            }
            yield docker.db_create(init_params);
            yield docker.db_start(init_params);
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
                // if(answers.repo !== 'core'){
                //   await _ask_for_deploy(args);
                // }else{
                yield init(init_params);
                // }
            }));
        }
        else {
            // await _ask_for_deploy(args);
            yield init(init_params);
        }
    });
}
// async function _ask_for_deploy(args:Arguments){
//   const deploy = args.d || args.deploy;
//   if(!deploy && init_params.force === false){
//     // output.stop_loading();
//     inquirer.
//       prompt([
//         {
//           type: 'list',
//           name: 'deploy',
//           message: 'How you want to deploy?',
//           choices: Object.keys(abstract_deploy)
//         }
//       ]).then(async (answers) => {
//         check_deploy(answers.deploy);
//         init_params.deploy = answers.deploy;
//         await init(init_params);
//       });
//   }else{
//     await init(init_params);
//   }
// }
function _log_important_params() {
    output_instance.verbose_log(`$URNROOT$Project root: [${init_params.root}]`, 'root');
    output_instance.verbose_log(`Selected repository: [${init_params.repo}]`, 'repo');
    output_instance.verbose_log(`Selected pacman: [${init_params.pacman}]`, 'pacman');
    // if(valid_deploy_repos().includes(init_params.repo)){
    //   output_instance.verbose_log(
    //     `Selected deploy: [${init_params.deploy}]`,
    //     'dply'
    //   );
    // }
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
function _copy_assets() {
    _copy_sample();
    _copy_toml();
    // _copy_tsconfigs();
    // _copy_eslint_files();
}
function _copy_sample() {
    const sample_file = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/env/sample.env`;
    const dest = `${init_params.root}/sample.env`;
    util_instance.fs.copy_file(sample_file, dest, 'book');
}
function _copy_toml() {
    const ass_toml_filepath = `${init_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/toml/uranio.toml`;
    const dest = `${init_params.root}/uranio.toml`;
    if (!util_instance.fs.exists(dest)) {
        util_instance.fs.copy_file(ass_toml_filepath, dest, 'book');
    }
}
// function _copy_tsconfigs(){
//   const ass_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets`;
//   const ts_dir = `${ass_dir}/typescript`;
//   const dot_tsc_file = `${ts_dir}/root/tsconfig.json`;
//   const dest = `${init_params.root}/tsconfig.json`;
//   util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
// }
// function _copy_eslint_files(){
//   const eslint_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets/eslint`;
//   const dest_dir = `${init_params.root}`;
//   const dest_ignore = `${dest_dir}/.eslintignore`;
//   const dest_esrc = `${dest_dir}/.eslintrc.js`;
//   const dest_style = `${dest_dir}/.stylelintrc.json`;
//   if(!util_instance.fs.exists(dest_ignore)){
//     util_instance.fs.copy_file(
//       `${eslint_dir}/.eslintignore`,
//       dest_ignore,
//       'esln'
//     );
//   }
//   if(!util_instance.fs.exists(dest_esrc)){
//     util_instance.fs.copy_file(
//       `${eslint_dir}/.eslintrc.js`,
//       dest_esrc,
//       'esln'
//     );
//   }
//   if(!util_instance.fs.exists(dest_style)){
//     util_instance.fs.copy_file(
//       `${eslint_dir}/.stylelintrc.json`,
//       dest_style,
//       'esln'
//     );
//   }
// }
function _create_src_admin_dir() {
    const src_folder = `${init_params.root}/src`;
    const atoms_folder = `${src_folder}/admin`;
    if (!util_instance.fs.exists(atoms_folder)) {
        util_instance.fs.create_directory(atoms_folder);
    }
}
function _create_src_server_dir() {
    const src_folder = `${init_params.root}/src`;
    const atoms_folder = `${src_folder}/server`;
    if (!util_instance.fs.exists(atoms_folder)) {
        util_instance.fs.create_directory(atoms_folder);
    }
}
function _create_src_atoms_dir() {
    const src_folder = `${init_params.root}/src`;
    const atoms_folder = `${src_folder}/atoms`;
    if (!util_instance.fs.exists(atoms_folder)) {
        util_instance.fs.create_directory(atoms_folder);
    }
}
function _create_src_dirs() {
    const src_folder = `${init_params.root}/src`;
    if (!util_instance.fs.exists(src_folder)) {
        util_instance.fs.create_directory(src_folder);
    }
    _create_src_atoms_dir();
    _create_src_server_dir();
    if ((0, types_1.valid_admin_repos)().includes(init_params.repo)) {
        _create_src_admin_dir();
    }
}
function _init_pacman() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Initializing pacman...`);
        const yarn_lock = `${init_params.root}/yarn.lock`;
        if (init_params.pacman === 'yarn' && !util_instance.fs.exists(yarn_lock)) {
            yield util_instance.cmd.yarn_install();
        }
        output_instance.done_verbose_log(`Pacman initialized.`, 'pacman');
    });
}
function _remove_tmp() {
    output_instance.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util_instance.fs.remove_directory(`${init_params.root}/${defaults_1.defaults.tmp_folder}`, 'tmp');
    output_instance.done_verbose_log(`Removed tmp folder [${defaults_1.defaults.tmp_folder}].`, 'tmp');
}
function _create_init_file() {
    output_instance.start_loading('Creating rc file...');
    let content = ``;
    content += `{\n`;
    content += `\t"repo": "${init_params.repo}",\n`;
    content += `\t"pacman": "${init_params.pacman}",\n`;
    // if(valid_deploy_repos().includes(init_params.repo)){
    //   content += `\t"deploy": "${init_params.deploy}",\n`;
    // }
    if (init_params.docker === true) {
        content += `\t"docker": ${init_params.docker},\n`;
    }
    if (init_params.docker_db === true) {
        content += `\t"docker_db": ${init_params.docker_db},\n`;
        content += `\t"db": "${init_params.db}",\n`;
    }
    content += `}`;
    util_instance.fs.write_file(init_filepath, content);
    util_instance.pretty(init_filepath, 'json');
    output_instance.done_log(`Created file [${init_filepath}].`, 'rcfl');
}
function _create_dot_env() {
    const dot_env_path = `${init_params.root}/.env`;
    if (util_instance.fs.exists(dot_env_path)) {
        return;
    }
    util_instance.fs.copy_file(`${init_params.root}/sample.env`, dot_env_path);
}
function _install_dev_dep() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, types_1.valid_admin_repos)().includes(init_params.repo)) {
            yield _install_dev_package(defaults_1.defaults.adm_dep_dev_repo);
        }
        // if(valid_admin_repos().includes(init_params.repo)){
        //   await _install_real_dev_package(`patch-package`);
        //   await _install_real_dev_package(`postinstall-postinstall`);
        // }
    });
}
function _install_packages() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Intalling [${init_params.repo}]...`);
        // await _install_package(defaults.lib_repo);
        // if(valid_admin_repos().includes(init_params.repo)){
        //   await _install_dev_package(defaults.adm_dep_dev_repo);
        // }
        yield _install_repo_package(init_params.repo);
        output_instance.done_log(`Installed package [${init_params.repo}].`, 'repo');
    });
}
// async function _install_package(package_url:string){
//   return await util_instance.cmd.install_package(`${package_url}#${init_params.branch}`);
//   // return await util_instance.cmd.install_package(package_url);
// }
// async function _install_real_dev_package(package_url:string){
//   return await util_instance.cmd.install_package_dev(`${package_url}`);
// }
function _install_dev_package(package_url) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield util_instance.cmd.install_package_dev(`${package_url}#${init_params.branch}`);
    });
}
function _install_repo_package(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const package_url = defaults_1.defaults[`${repo}_repo`];
        return yield util_instance.cmd.install_package(`uranio@${package_url}#${init_params.branch}`);
    });
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
    // if(content.indexOf(defaults.init_filepath) === -1){
    //   content += `\n${defaults.init_filepath}`;
    // }
    if (content.indexOf(`.env`) === -1) {
        content += `\n.env`;
    }
    util_instance.fs.write_file(gitignore, content);
    const log_msg = `Added entries to .gitignore.`;
    output_instance.done_log(log_msg, '.git');
}
function _update_resolutions() {
    output_instance.start_loading('Updating resolutions...');
    const package_json_path = `${init_params.root}/package.json`;
    const package_data = util_instance.cmd.get_package_data(package_json_path);
    const old_scripts = package_data['resolutions'] || {};
    package_data['resolutions'] = Object.assign(Object.assign({}, old_scripts), { "@oclif/plugin-help": "3.2.14", "colors": "1.4.0" });
    try {
        util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
        output_instance.done_log(`Updated package.json resolutions.`, 'packdata');
    }
    catch (ex) {
        output_instance.error_log(`Cannot update ${package_json_path}.`, 'packdata');
    }
}
function _update_package_scripts() {
    output_instance.start_loading('Updating scripts...');
    const package_json_path = `${init_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        const old_scripts = package_data['scripts'] || {};
        package_data['scripts'] = Object.assign(Object.assign({}, old_scripts), common_1.package_scripts);
        if ((0, types_1.valid_admin_repos)().includes(init_params.repo)) {
            package_data['scripts'] = Object.assign(Object.assign({}, package_data['scripts']), common_1.adm_package_scripts);
        }
        try {
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json scripts.`, 'scripts');
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`, 'scripts');
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`, 'scripts');
    }
}
function _create_dot_dir() {
    output_instance.start_loading(`Creating ${defaults_1.defaults.folder} folder...`);
    util_instance.fs.remove_directory(`${init_params.root}/${defaults_1.defaults.folder}`, 'init');
    util_instance.fs.create_directory(`${init_params.root}/${defaults_1.defaults.folder}`, 'init');
    output_instance.done_log(`Created folder ${defaults_1.defaults.folder}.`, 'init');
}
//# sourceMappingURL=init.js.map