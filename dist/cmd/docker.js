"use strict";
/**
 * Docker command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_env = exports.prune = exports.network_remove = exports.network_create = exports.tmp_remove = exports.db_remove = exports.db_stop = exports.db_start = exports.db_create = exports.unbuild = exports.remove = exports.stop = exports.start_panel = exports.start_server = exports.start = exports.create = exports.build = exports.docker = void 0;
const urn_lib_1 = require("urn-lib");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const defaults_1 = require("../conf/defaults");
let output_instance;
let util_instance;
const common_1 = require("./common");
let docker_params = defaults_1.default_params;
let dot_folder = `./${defaults_1.defaults.folder}`;
let docker_folder = `${dot_folder}/${defaults_1.defaults.docker_folder}`;
async function docker(params, args) {
    _init_params(params);
    dot_folder = `${docker_params.root}/${defaults_1.defaults.folder}`;
    docker_folder = `${dot_folder}/${defaults_1.defaults.docker_folder}`;
    switch (args._[1]) {
        case 'build': {
            await build(docker_params);
            break;
        }
        case 'create': {
            await create(docker_params);
            break;
        }
        case 'start': {
            await start(docker_params);
            break;
        }
        case 'stop': {
            await stop(docker_params);
            break;
        }
        case 'remove': {
            await remove(docker_params);
            break;
        }
        case 'unbuild': {
            await unbuild(docker_params);
            break;
        }
        case 'db': {
            // const db = args._[3] as DB;
            // check_db(db);
            switch (args._[2]) {
                case 'create': {
                    await db_create(docker_params);
                    break;
                }
                case 'start': {
                    await db_start(docker_params);
                    break;
                }
                case 'stop': {
                    await db_stop(docker_params);
                    break;
                }
                case 'remove': {
                    await db_remove(docker_params);
                    break;
                }
                default: {
                    output_instance.error_log(`Invalid uranio docker db command. Try [create, start, stop, remove]`);
                    process.exit(1);
                }
            }
            break;
        }
        case 'network': {
            switch (args._[2]) {
                case 'create': {
                    await network_create(docker_params);
                    break;
                }
                case 'remove': {
                    await network_remove(docker_params);
                    break;
                }
                default: {
                    output_instance.error_log(`Invalid uranio docker network command. Try [create, remove]`);
                    process.exit(1);
                }
            }
            break;
        }
        case 'prune': {
            await prune(docker_params);
            break;
        }
        case 'env': {
            switch (args._[2]) {
                case 'update': {
                    update_env(docker_params);
                    break;
                }
                default: {
                    output_instance.error_log(`Invalid uranio docker env command. Try [update]`);
                    process.exit(1);
                }
            }
            break;
        }
        default: {
            output_instance.error_log(`Invalid uranio docker command.`);
            process.exit(1);
        }
    }
}
exports.docker = docker;
async function build(params) {
    _init_params(params);
    await _download_dockerfiles();
    const image_name = _get_image_name();
    const project_name = _get_project_name();
    let cmd = '';
    cmd += `docker build --ssh default`;
    cmd += ` -t ${image_name}`;
    cmd += ` -f ${docker_folder}/Dockerfile`;
    cmd += ` --build-arg repo=${docker_params.repo}`;
    cmd += ` --build-arg project=${project_name}`;
    // cmd += ` --build-arg deploy=${docker_params.deploy}`;
    cmd += ` .`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'building', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image built ${image_name}`);
    await _copy_compiled();
}
exports.build = build;
async function create(params, entrypoint) {
    _init_params(params);
    const container_name = `${_get_container_name()}`;
    const image_name = _get_image_name();
    // const dotenv = util_instance.cmd.read_dotenv();
    // const port_server = dotenv.URN_SERVICE_PORT;
    // const port_client = dotenv.URN_CLIENT_PORT;
    const toml = util_instance.cmd.read_toml();
    const port_server = toml.service_port || 7777;
    const port_panel = toml.client_panel_port || 5454;
    // const port_server = toml.service_port || port_server;
    // const port_panel = toml.client_panel_port || port_panel;
    const network_name = _get_network_name();
    const toml_path = (docker_params.config[0] === '/') ?
        docker_params.config : `$(pwd)/${docker_params.config}`;
    let cmd = '';
    cmd += `docker create`;
    cmd += ` --network ${network_name}`;
    // cmd += ` -p ${port_server}:${port_server}`;
    // cmd += ` -p ${port_panel}:${port_panel}`;
    cmd += ` -p ${port_server}:${port_server}`;
    cmd += ` -p ${port_panel}:${port_panel}`;
    cmd += ` -v $(pwd)/src/:/app/src/`;
    cmd += ` -v $(pwd)/.env:/app/.env`;
    cmd += ` -v ${toml_path}:/app/uranio.toml`;
    cmd += ` -v $(pwd)/package.json:/app/package.json`;
    cmd += ` -v $(pwd)/node_modules/:/app/node_modules/`;
    cmd += ` -v $(pwd)/.uranio/uranio-schema:/app/.uranio/uranio-schema`;
    cmd += ` -v $(pwd)/cert/:/app/cert/`;
    cmd += ` --name ${container_name}`;
    if (typeof entrypoint === 'string') {
        cmd += ` --entrypoint="${entrypoint}"`;
    }
    cmd += ` ${image_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'creating', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container created ${container_name}`);
}
exports.create = create;
async function start(params) {
    _init_params(params);
    const container_name = _get_container_name();
    let cmd = '';
    cmd += `docker start -i ${container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'starting', '', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image started ${container_name}`);
}
exports.start = start;
async function start_server(params) {
    console.log(`Start server`, params);
    // _init_params(params);
    // const container_name = _get_container_name();
    // let cmd = '';
    // cmd += `docker start -i ${container_name}`;
    // await _execute_log(cmd, 'docker', 'starting');
    // output_instance.done_log(
    //   `Docker image started ${container_name}`
    // );
}
exports.start_server = start_server;
async function start_panel(params) {
    console.log(`Start panel`, params);
    // _init_params(params);
    // const container_name = _get_container_name();
    // let cmd = '';
    // cmd += `docker start -i ${container_name}`;
    // await _execute_log(cmd, 'docker', 'starting');
    // output_instance.done_log(
    //   `Docker image started ${container_name}`
    // );
}
exports.start_panel = start_panel;
async function stop(params, continue_on_fail = false) {
    _init_params(params);
    const container_name = _get_container_name();
    let cmd = '';
    cmd += `docker stop ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'stopping', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container stopped ${container_name}`);
}
exports.stop = stop;
async function remove(params, continue_on_fail = false) {
    _init_params(params);
    const container_name = _get_container_name();
    let cmd = '';
    cmd += `docker rm ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'creating', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container removed ${container_name}`);
}
exports.remove = remove;
async function unbuild(params, continue_on_fail = false) {
    _init_params(params);
    const image_name = _get_image_name();
    let cmd = '';
    cmd += `docker image rm`;
    cmd += ` ${image_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, `removing image ${image_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image removed ${image_name}`);
}
exports.unbuild = unbuild;
async function db_create(params) {
    _init_params(params);
    const project_name = _get_project_name();
    const db_container_name = _get_db_container_name();
    const port = 27017;
    const network_name = _get_network_name();
    let cmd = '';
    cmd += `docker create --name ${db_container_name}`;
    cmd += ` --network ${network_name}`;
    cmd += ` -v ~/mongo/data-${project_name}:/data/db -p ${port}:${port}`;
    cmd += ` mongo:5`;
    await util_instance.spawn.spin_and_native_promise(cmd, `creating db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container created ${db_container_name}`);
}
exports.db_create = db_create;
async function db_start(params) {
    _init_params(params);
    const db_container_name = _get_db_container_name();
    let cmd = '';
    cmd += `docker start ${db_container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, `starting db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container started ${db_container_name}`);
}
exports.db_start = db_start;
async function db_stop(params, continue_on_fail = false) {
    _init_params(params);
    const db_container_name = _get_db_container_name();
    let cmd = '';
    cmd += `docker stop ${db_container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, `stopping db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container stopped ${db_container_name}`);
}
exports.db_stop = db_stop;
async function db_remove(params, continue_on_fail = false) {
    _init_params(params);
    const db_container_name = _get_db_container_name();
    let cmd = '';
    cmd += `docker rm ${db_container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, `removing db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container removed ${db_container_name}`);
}
exports.db_remove = db_remove;
async function tmp_remove(params, continue_on_fail = false) {
    _init_params(params);
    const container_name = _get_container_name();
    let cmd_rm = '';
    cmd_rm += `docker rm tmp_${container_name}`;
    if (continue_on_fail) {
        cmd_rm += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd_rm, `removing tmp container tmp_${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker removed tmp container tmp_${container_name}`);
}
exports.tmp_remove = tmp_remove;
async function network_create(params, continue_on_fail = false) {
    _init_params(params);
    const network_name = _get_network_name();
    let cmd_rm = '';
    cmd_rm += `docker network create ${network_name}`;
    if (continue_on_fail) {
        cmd_rm += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd_rm, `creating network ${network_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker created network ${network_name}`);
}
exports.network_create = network_create;
async function network_remove(params, continue_on_fail = false) {
    _init_params(params);
    const network_name = _get_network_name();
    let cmd_rm = '';
    cmd_rm += `docker network remove ${network_name}`;
    if (continue_on_fail) {
        cmd_rm += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd_rm, `creating network ${network_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker removed network ${network_name}`);
}
exports.network_remove = network_remove;
async function prune(params, continue_on_fail = false) {
    _init_params(params);
    const project_name = _get_project_name();
    let cmd_prune = '';
    cmd_prune += `docker builder prune -af --filter "label=project=${project_name}"`;
    if (continue_on_fail) {
        cmd_prune += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd_prune, `deleteing builder cache`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker builder cache deleted.`);
}
exports.prune = prune;
async function _copy_compiled() {
    const image_name = _get_image_name();
    const container_name = _get_container_name();
    let cmd_create = '';
    cmd_create += `docker create --name tmp_${container_name} ${image_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd_create, `creating tmp container tmp_${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    let cmd_cp_node = '';
    cmd_cp_node += `docker cp tmp_${container_name}:/app/node_modules node_modules`;
    await util_instance.spawn.spin_and_native_promise(cmd_cp_node, `copying node_modules from tmp container tmp_${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    // let cmd_cp_uranio = '';
    // cmd_cp_uranio += `docker cp tmp_${container_name}:/app/.uranio/. .uranio/`;
    // await util_instance.spawn.spin_and_native_promise(cmd_cp_uranio, 'docker', `copying .uranio from tmp container tmp_${container_name}`);
    let cmd_remove = '';
    cmd_remove += `docker rm tmp_${container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd_remove, `removing tmp container tmp_${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker copied files from tmp container tmp_${container_name}`);
}
function _get_project_name() {
    const package_json_path = `${docker_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    const package_data = urn_lib_1.urn_util.json.clean_parse(data);
    return package_data['name'] || 'uranio-project';
}
function _get_image_name() {
    const project_name = _get_project_name();
    const image_name = `${project_name}_uranio_img`;
    return image_name;
}
function _get_container_name() {
    const project_name = _get_project_name();
    const container_name = `${project_name}_uranio_con`;
    return container_name;
}
function _get_network_name() {
    const project_name = _get_project_name();
    const network_name = `${project_name}_uranio_net`;
    return network_name;
}
function _get_db_container_name() {
    const project_name = _get_project_name();
    const db_container_name = `${project_name}_uranio_db`;
    return db_container_name;
}
function _init_params(params) {
    docker_params = (0, common_1.merge_params)(params);
    output_instance = output.create(docker_params);
    util_instance = util.create(docker_params, output_instance);
    util_instance.must_be_initialized();
}
async function _clone_assets() {
    output_instance.start_loading(`Cloning assets...`);
    util_instance.fs.remove_directory(defaults_1.defaults.tmp_folder);
    util_instance.fs.create_directory(defaults_1.defaults.tmp_folder);
    await util_instance.cmd.clone_repo(defaults_1.defaults.assets_repo, `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets`, docker_params.branch);
    output_instance.done_log(`Cloned assets repo.`);
}
async function _download_dockerfiles() {
    await _clone_assets();
    // const def_folder = `${docker_params.root}/${defaults.folder}`;
    // const dest_folder = `${def_folder}/${defaults.docker_folder}`;
    if (!util_instance.fs.exists(docker_folder)) {
        util_instance.fs.create_directory(docker_folder);
    }
    const docker_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/docker/Dockerfile`;
    const dest = `${docker_folder}/Dockerfile`;
    util_instance.fs.copy_file(docker_file, dest);
    const dockerignore_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/docker/.dockerignore`;
    const ignore_dest = `${docker_folder}/.dockerignore`;
    util_instance.fs.copy_file(dockerignore_file, ignore_dest);
    const docker_bash = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/docker/.bash_docker`;
    const bash_dest = `${docker_folder}/.bash_docker`;
    util_instance.fs.copy_file(docker_bash, bash_dest);
    _remove_tmp();
}
function _remove_tmp() {
    output_instance.start_loading(`Removing tmp folder [${defaults_1.defaults.tmp_folder}]...`);
    util_instance.fs.remove_directory(`${docker_params.root}/${defaults_1.defaults.tmp_folder}`);
    output_instance.done_trace_log(`Removed tmp folder [${defaults_1.defaults.tmp_folder}].`);
}
function update_env(params) {
    if (params) {
        _init_params(params);
    }
    const dotenv_path = `${docker_params.root}/.env`;
    if (!util_instance.fs.exists(dotenv_path)) {
        output_instance.error_log(`Missing .env file.`);
        process.exit(1);
    }
    const new_dot_env = {};
    new_dot_env['URN_MONGO_MAIN_CONNECTION'] =
        `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
    new_dot_env['URN_MONGO_TRASH_CONNECTION'] =
        `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
    new_dot_env['URN_MONGO_LOG_CONNECTION'] =
        `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
    const content = util_instance.fs.read_file(dotenv_path);
    const lines = content.split('\n');
    const new_lines = [];
    for (const line of lines) {
        const splitted = line.split('=');
        if (splitted.length === 2
            && typeof new_dot_env[splitted[0]] !== 'undefined'
            && splitted[1] !== new_dot_env[splitted[0]]) {
            new_lines.push(`#${line}`);
            new_lines.push(`${splitted[0]}=${new_dot_env[splitted[0]]}`);
        }
        else {
            new_lines.push(line);
        }
    }
    util_instance.fs.write_file(dotenv_path, new_lines.join('\n'));
}
exports.update_env = update_env;
//# sourceMappingURL=docker.js.map