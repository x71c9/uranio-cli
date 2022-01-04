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
exports.docker_run = exports.docker_db_remove = exports.docker_db_stop = exports.docker_db_start = exports.docker_db_create = exports.docker_db_run = exports.docker_stop = exports.docker_start = exports.docker_remove = exports.docker_create = exports.docker_unbuild = exports.docker_build = exports.docker = void 0;
const urn_lib_1 = require("urn-lib");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
const types_1 = require("../types");
let output_instance;
let util_instance;
const common_1 = require("./common");
let docker_params = defaults_1.default_params;
function _get_and_set_main_args(args) {
    const { repo, deploy, pacman } = _get_main_args(args);
    docker_params.repo = repo;
    docker_params.deploy = deploy;
    docker_params.pacman = pacman;
}
function docker(params, args) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        switch (args._[1]) {
            case 'build': {
                _get_and_set_main_args(args);
                yield docker_build(docker_params);
                break;
            }
            case 'create': {
                _get_and_set_main_args(args);
                yield docker_create(docker_params);
                break;
            }
            case 'start': {
                _get_and_set_main_args(args);
                yield docker_start(docker_params);
                break;
            }
            case 'stop': {
                _get_and_set_main_args(args);
                yield docker_stop(docker_params);
                break;
            }
            case 'run': {
                _get_and_set_main_args(args);
                yield docker_run(docker_params);
                break;
            }
            case 'remove': {
                _get_and_set_main_args(args);
                yield docker_remove(docker_params);
                break;
            }
            case 'db': {
                const db = args._[3];
                (0, common_1.check_db)(db);
                switch (args._[2]) {
                    case 'run': {
                        yield docker_db_run(docker_params, db);
                        break;
                    }
                    case 'create': {
                        yield docker_db_create(docker_params, db);
                        break;
                    }
                    case 'start': {
                        yield docker_db_start(docker_params, db);
                        break;
                    }
                    case 'stop': {
                        yield docker_db_stop(docker_params, db);
                        break;
                    }
                }
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
function docker_build(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        yield _download_dockerfiles();
        const image_name = _get_image_name();
        let cmd = '';
        cmd += `docker build --ssh default`;
        cmd += ` -t ${image_name}`;
        // cmd += ` -f ${docker_params.root}/${defaults.folder}/.docker/Dockerfile`;
        cmd += ` -f ${docker_params.root}/Dockerfile`;
        cmd += ` --build-arg repo=${docker_params.repo}`;
        cmd += ` --build-arg deploy=${docker_params.deploy}`;
        cmd += ` --build-arg pacman=${docker_params.pacman}`;
        cmd += ` .`;
        yield _execute_spin_verbose(cmd, 'docker', 'building');
        output_instance.done_log(`Docker image built ${docker_params.repo} ${docker_params.deploy}`);
        yield docker_create(docker_params);
    });
}
exports.docker_build = docker_build;
function docker_unbuild(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const image_name = _get_image_name();
        let cmd = '';
        cmd += `docker image rm`;
        cmd += ` ${image_name}`;
        cmd += ` || true`;
        yield _execute_spin_verbose(cmd, 'docker', `removing image ${image_name}`);
        output_instance.done_log(`Docker image removed ${image_name}`);
    });
}
exports.docker_unbuild = docker_unbuild;
function docker_create(params, entrypoint) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const container_name = _get_container_name();
        const image_name = _get_image_name();
        let cmd = '';
        // cmd += `docker create -v $(pwd):/app -v /app/node_modules --network="host"`;
        cmd += `docker create -v $(pwd):/app --network="host"`;
        cmd += ` --name ${container_name}`;
        cmd += ` ${image_name}`;
        if (typeof entrypoint === 'string') {
            cmd += ` --entrypoint ${entrypoint}`;
        }
        yield _execute_log(cmd, 'docker', 'creating');
        output_instance.done_log(`Docker container created ${container_name}`);
    });
}
exports.docker_create = docker_create;
function docker_remove(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const container_name = _get_container_name();
        let cmd = '';
        cmd += `docker container rm ${container_name}`;
        cmd += ` || true`;
        yield _execute_spin_verbose(cmd, 'docker', 'creating');
        output_instance.done_log(`Docker container removed ${container_name}`);
    });
}
exports.docker_remove = docker_remove;
function docker_start(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const container_name = _get_container_name();
        let cmd = '';
        cmd += `docker start -i ${container_name}`;
        yield _execute_log(cmd, 'docker', 'starting');
        output_instance.done_log(`Docker image started ${docker_params.repo} ${docker_params.deploy}`);
    });
}
exports.docker_start = docker_start;
function docker_stop(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const container_name = _get_container_name();
        let cmd = '';
        cmd += `docker stop ${container_name}`;
        cmd += ` || true`;
        yield _execute_log(cmd, 'docker', 'stopping');
        output_instance.done_log(`Docker image stopped ${docker_params.repo} ${docker_params.deploy}`);
    });
}
exports.docker_stop = docker_stop;
function docker_db_run(params, db) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const db_container_name = _get_db_container_name(db);
        let cmd = '';
        cmd += `docker run --rm -i --name ${db_container_name}`;
        cmd += ` -v ~/mongo/data:/data/db --network="host"`;
        cmd += ` mongo:5`;
        yield _execute_log(cmd, 'docker db', 'running db');
        output_instance.done_log(`Docker db container running ${db_container_name}`);
    });
}
exports.docker_db_run = docker_db_run;
function docker_db_create(params, db) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const db_container_name = _get_db_container_name(db);
        let cmd = '';
        cmd += `docker create --name ${db_container_name}`;
        cmd += ` -v ~/mongo/data:/data/db --network="host"`;
        cmd += ` mongo:5`;
        yield _execute_spin_verbose(cmd, `docker`, `creating db ${db}`);
        output_instance.done_log(`Docker db container created ${db_container_name}`);
    });
}
exports.docker_db_create = docker_db_create;
function docker_db_start(params, db) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const db_container_name = _get_db_container_name(db);
        let cmd = '';
        cmd += `docker start ${db_container_name}`;
        yield _execute_spin_verbose(cmd, `docker`, `starting db ${db}`);
        output_instance.done_log(`Docker db container started ${db_container_name}`);
    });
}
exports.docker_db_start = docker_db_start;
function docker_db_stop(params, db) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const db_container_name = _get_db_container_name(db);
        let cmd = '';
        cmd += `docker stop ${db_container_name}`;
        cmd += ` || true`;
        yield _execute_spin_verbose(cmd, `docker`, `stopping db ${db}`);
        output_instance.done_log(`Docker db container stopped ${db_container_name}`);
    });
}
exports.docker_db_stop = docker_db_stop;
function docker_db_remove(params, db) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        const db_container_name = _get_db_container_name(db);
        let cmd = '';
        cmd += `docker container rm ${db_container_name}`;
        cmd += ` || true`;
        yield _execute_spin_verbose(cmd, `docker`, `removing db ${db}`);
        output_instance.done_log(`Docker db container removed ${db_container_name}`);
    });
}
exports.docker_db_remove = docker_db_remove;
function docker_run(params, entrypoint) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_params(params);
        let cmd = '';
        cmd += `docker run --rm -i -v $(pwd)/src:/app/src --network="host"`;
        cmd += ` --name uranio_${docker_params.repo}_${docker_params.deploy}_container`;
        cmd += ` uranio-${docker_params.repo}-${docker_params.deploy}`;
        if (typeof entrypoint === 'string') {
            cmd += ` --entrypoint ${entrypoint}`;
        }
        yield _execute_log(cmd, 'docker', 'running');
        output_instance.done_log(`Docker image runned ${docker_params.repo} ${docker_params.deploy}`);
    });
}
exports.docker_run = docker_run;
function _get_image_name() {
    const project_name = _get_project_name();
    const image_name = `${project_name}-uranio-${docker_params.repo}-${docker_params.deploy}-image`;
    return image_name;
}
function _get_db_container_name(db) {
    const db_container_name = `${db}_${_get_container_name()}`;
    return db_container_name;
}
function _get_container_name() {
    const project_name = _get_project_name();
    const container_name = `${project_name}_uranio_${docker_params.repo}_${docker_params.deploy}_container`;
    return container_name;
}
function _get_project_name() {
    const package_json_path = `${docker_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    const package_data = urn_lib_1.urn_util.json.clean_parse(data);
    return package_data['name'] || 'uranio-project-001';
}
function _init_params(params) {
    docker_params = (0, common_1.merge_params)(params);
    output_instance = output.create(docker_params);
    util_instance = util.create(docker_params, output_instance);
    util_instance.must_be_initialized();
}
// async function _run(args:Arguments):Promise<void>{
//   const {repo, deploy} = _get_main_args(args);
//   let cmd = '';
//   cmd += `docker run --rm -i -v $(pwd)/src:/app/src --network="host" uranio-${repo}-${deploy}`;
//   await _execute_log(cmd, 'docker', 'running');
//   output_instance.done_log(`Docker image runned ${repo} ${deploy}`);
// }
// async function _build(args:Arguments):Promise<void>{
//   const {repo, deploy, pacman} = _get_main_args(args);
//   await _download_dockerfiles();
//   // _ignore_docker_folder();
//   let cmd = '';
//   cmd += `docker build --ssh default -t uranio-${repo}-${deploy}`;
//   cmd += ` -f ${docker_params.root}/${defaults.folder}/.docker/Dockerfile`;
//   cmd += ` --build-arg repo=${repo}`;
//   cmd += ` --build-arg deploy=${deploy}`;
//   cmd += ` --build-arg pacman=${pacman}`;
//   cmd += ` .`;
//   await _execute_spin_verbose(cmd, 'docker', 'building');
//   output_instance.done_log(`Docker image built ${repo} ${deploy}`);
// }
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
        const def_folder = `${docker_params.root}`;
        const dest_folder = `${def_folder}`;
        if (!util_instance.fs.exists(dest_folder)) {
            util_instance.fs.create_directory(dest_folder, 'docker');
        }
        const docker_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-dot/docker/Dockerfile`;
        const dest = `${dest_folder}/Dockerfile`;
        util_instance.fs.copy_file(docker_file, dest, 'docker');
        const dockerignore_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-dot/docker/.dockerignore`;
        const ignore_dest = `${dest_folder}/.dockerignore`;
        util_instance.fs.copy_file(dockerignore_file, ignore_dest, 'docker');
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
        // output_instance.debug_log(cmd, 'docker');
        return new Promise((resolve, reject) => {
            util_instance.spawn.spin_and_verbose_log(cmd, context, action, undefined, resolve, reject);
        });
    });
}
function _execute_log(cmd, context, action) {
    return __awaiter(this, void 0, void 0, function* () {
        // output_instance.debug_log(cmd, 'docker');
        return new Promise((resolve, reject) => {
            util_instance.spawn.log(cmd, context, action, undefined, resolve, reject);
        });
    });
}
//# sourceMappingURL=docker.js.map