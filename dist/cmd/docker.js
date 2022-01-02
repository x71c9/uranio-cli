"use strict";
/**
 * Docker command module
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
exports.docker = void 0;
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
let output_instance;
let util_instance;
const common_1 = require("./common");
let docker_params = defaults_1.default_params;
function docker(params, args) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        switch (args._[1]) {
            case 'build': {
                yield _build(args);
                break;
            }
            case 'run': {
                yield _run(args);
                break;
            }
            default: {
                output_instance.error_log(`Invalid docker command.`);
                process.exit(1);
            }
        }
    });
}
exports.docker = docker;
function _init_params(params) {
    docker_params = (0, common_1.merge_params)(params);
    output_instance = output.create(docker_params);
    util_instance = util.create(docker_params, output_instance);
    // util_instance.must_be_initialized();
}
function _run(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, deploy } = _get_main_args(args);
        let cmd = '';
        cmd += `docker run --rm -i -v $(pwd)/src:/app/src --network="host" uranio-${repo}-${deploy}`;
        yield _execute_verbose(cmd, 'docker', 'running');
        output_instance.done_log(`Docker image runned ${repo} ${deploy}`);
    });
}
function _build(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, deploy, pacman } = _get_main_args(args);
        yield _download_dockerfiles();
        // _ignore_docker_folder();
        let cmd = '';
        cmd += `docker build --ssh default -t uranio-${repo}-${deploy}`;
        cmd += ` -f ${docker_params.root}/${defaults_1.defaults.folder}/.docker/Dockerfile`;
        cmd += ` --build-arg repo=${repo}`;
        cmd += ` --build-arg deploy=${deploy}`;
        cmd += ` --build-arg pacman=${pacman}`;
        cmd += ` .`;
        yield _execute_spin_verbose(cmd, 'docker', 'building');
        output_instance.done_log(`Docker image built ${repo} ${deploy}`);
    });
}
function _get_main_args(args) {
    let repo = (args._[2]);
    if (typeof repo === 'undefined' && typeof args.repo === 'string') {
        repo = args.repo;
    }
    let deploy = (args._[3] || 'express');
    if (typeof deploy === 'undefined' && typeof args.deploy === 'string') {
        deploy = args.deploy;
    }
    let pacman = (args._[4] || 'yarn');
    if (typeof pacman === 'undefined' && typeof args.pacman === 'string') {
        pacman = args.pacman;
    }
    // const branch = (args._[5] || 'master');
    output_instance.log(`Selected repo: ${repo}`, `args`);
    output_instance.log(`Selected pacman: ${pacman}`, `args`);
    if ((0, types_1.valid_deploy_repos)().includes(repo)) {
        output_instance.log(`Selected deploy: ${deploy}`, `args`);
    }
    (0, common_1.check_repo)(repo);
    (0, common_1.check_pacman)(pacman);
    (0, common_1.check_deploy)(deploy);
    return {
        repo,
        pacman,
        deploy
    };
}
function _clone_dot() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.start_loading(`Cloning dot...`);
        util_instance.fs.remove_directory(defaults_1.defaults.tmp_folder, 'dot');
        util_instance.fs.create_directory(defaults_1.defaults.tmp_folder, 'dot');
        yield util_instance.cmd.clone_repo(defaults_1.defaults.dot_repo, `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-dot`, 'dot', docker_params.branch);
        output_instance.done_log(`Cloned dot repo.`, 'dot');
    });
}
function _download_dockerfiles() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _clone_dot();
        const def_folder = `${docker_params.root}/${defaults_1.defaults.folder}`;
        if (!util_instance.fs.exists(def_folder)) {
            util_instance.fs.create_directory(def_folder, 'docker');
        }
        const dest_folder = `${def_folder}/.docker`;
        if (!util_instance.fs.exists(dest_folder)) {
            util_instance.fs.create_directory(dest_folder, 'docker');
        }
        const docker_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-dot/docker/Dockerfile`;
        const dest = `${dest_folder}/Dockerfile`;
        util_instance.fs.copy_file(docker_file, dest, 'docker');
        const docker_bash = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-dot/docker/.bash_docker`;
        const bash_dest = `${dest_folder}/.bash_docker`;
        util_instance.fs.copy_file(docker_bash, bash_dest, 'docker');
        _remove_tmp();
    });
}
// function _ignore_docker_folder(){
//   output_instance.start_loading(`Adding .docker to .gitignore...`);
//   const gitignore = `${docker_params.root}/.gitignore`;
//   if(!util_instance.fs.exists(gitignore)){
//     util_instance.fs.create_file(gitignore, 'giti');
//   }
//   let content = util_instance.fs.read_file(gitignore, 'utf8');
//   if(content.indexOf('.docker/') === -1 || content.indexOf('.docker')){
//     content += `\n.docker/`;
//   }
//   util_instance.fs.write_file(gitignore, content);
//   const log_msg =
//     `Added .docker/ to .gitignore.`;
//   output_instance.done_log(log_msg, '.git');
// }
function _remove_tmp() {
    output_instance.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util_instance.fs.remove_directory(`${docker_params.root}/${defaults_1.defaults.tmp_folder}`, 'tmp');
    output_instance.done_verbose_log(`Removed tmp folder [${defaults_1.defaults.tmp_folder}].`, 'tmp');
}
function _execute_spin_verbose(cmd, context, action) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            util_instance.spawn.spin_and_verbose_log(cmd, context, action, undefined, resolve, reject);
        });
    });
}
function _execute_verbose(cmd, context, action) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            util_instance.spawn.verbose_log(cmd, context, action, undefined, resolve, reject);
        });
    });
}
//# sourceMappingURL=docker.js.map