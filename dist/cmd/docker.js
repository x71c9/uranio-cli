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
exports.update_env = exports.network_exists = exports.image_exists = exports.container_exists = exports.prune = exports.network_remove = exports.network_create = exports.remove_tmp = exports.db_remove = exports.db_stop = exports.db_start = exports.db_create = exports.unbuild = exports.remove_dev = exports.remove_start = exports.stop_dev = exports.stop_start = exports.start_panel = exports.start_server = exports.dev = exports.start = exports.push = exports.build = exports.docker = void 0;
const cp = __importStar(require("child_process"));
const uranio_lib_1 = require("uranio-lib");
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
            // await create(docker_params);
            switch (args._[2]) {
                case 'start': {
                    await create_start(docker_params);
                    break;
                }
                case 'dev': {
                    await create_dev(docker_params);
                    break;
                }
                default: {
                    let warn_msg = ``;
                    warn_msg += `Invalid parameter. Run uranio docker create`;
                    warn_msg += ` with either \`start\` or \`dev\`.`;
                    output_instance.warn_log(warn_msg);
                    process.exit(1);
                }
            }
            break;
        }
        case 'start': {
            await start(docker_params);
            break;
        }
        case 'dev': {
            await dev(docker_params);
            break;
        }
        case 'stop': {
            // await stop(docker_params);
            switch (args._[2]) {
                case 'start': {
                    await stop_start(docker_params);
                    break;
                }
                case 'dev': {
                    await stop_dev(docker_params);
                    break;
                }
                default: {
                    let warn_msg = ``;
                    warn_msg += `Invalid parameter. Run uranio docker stop`;
                    warn_msg += ` with either \`start\` or \`dev\`.`;
                    output_instance.warn_log(warn_msg);
                    process.exit(1);
                }
            }
            break;
        }
        case 'remove': {
            // await remove(docker_params);
            switch (args._[2]) {
                case 'start': {
                    await remove_start(docker_params);
                    break;
                }
                case 'dev': {
                    await remove_dev(docker_params);
                    break;
                }
                default: {
                    let warn_msg = ``;
                    warn_msg += `Invalid parameter. Run uranio docker remove`;
                    warn_msg += ` with either \`start\` or \`dev\`.`;
                    output_instance.warn_log(warn_msg);
                    process.exit(1);
                }
            }
            break;
        }
        case 'unbuild': {
            await unbuild(docker_params);
            break;
        }
        case 'push': {
            await push(docker_params);
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
        case 'exists': {
            if (typeof args._[2] !== 'string' || args._[2] === '') {
                output_instance.error_log(`Invalid container name.`);
                process.exit(1);
            }
            if (container_exists(args._[2])) {
                console.log(true);
                process.exit(0);
            }
            console.log(false);
            process.exit(0);
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
    // cmd += ` --build-arg production=${docker_params.prod}`;
    if (docker_params.docker_load === true) {
        cmd += ` --load`; // important for Github Action so that the image is kept locally
    }
    cmd += ` .`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'building', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image built ${image_name}`);
    // if(docker_params.prod === false){
    // await _copy_compiled();
    // }
}
exports.build = build;
async function push(params) {
    _init_params(params);
    const image_name = _get_image_name();
    let cmd_tag = '';
    cmd_tag += `docker image tag ${image_name} ${params.docker_tag}`;
    await util_instance.spawn.spin_and_native_promise(cmd_tag, 'tagging', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image tagged ${params.docker_tag}`);
    let cmd = '';
    cmd += `docker push ${params.docker_tag}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'pushing', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker image pushed to Docker Registry`);
}
exports.push = push;
// export async function create(params:Partial<Params>, entrypoint?:string)
// 		:Promise<void>{
// 	_init_params(params);
// 	const container_name = `${_get_container_name_start()}`;
// 	const image_name = _get_image_name();
// 	// const dotenv = util_instance.cmd.read_dotenv();
// 	// const port_server = dotenv.URN_SERVICE_PORT;
// 	// const port_client = dotenv.URN_CLIENT_PORT;
// 	const toml = util_instance.cmd.read_toml();
// 	let port_server = 7777;
// 	let port_panel = 5454;
// 	if(typeof toml.service_port !== 'undefined'){
// 		port_server = Number(toml.service_port);
// 	}
// 	if(typeof toml.client_panel_port !== 'undefined'){
// 		port_panel = Number(toml.client_panel_port);
// 	}
// 	if(docker_params.prod === false){
// 		if(typeof toml.dev_service_port !== 'undefined'){
// 			port_server = Number(toml.dev_service_port);
// 		}
// 		if(typeof toml.client_dev_panel_port !== 'undefined'){
// 			port_panel = Number(toml.client_dev_panel_port);
// 		}
// 	}
// 	// const port_server = toml.service_port || port_server;
// 	// const port_panel = toml.client_panel_port || port_panel;
// 	const network_name = _get_network_name();
// 	const toml_path = (docker_params.config[0] === '/') ?
// 		docker_params.config : `$(pwd)/${docker_params.config}`;
// 	let cmd = '';
// 	cmd += `docker create`;
// 	cmd += ` --network ${network_name}`;
// 	cmd += ` -p ${port_server}:${port_server}`;
// 	cmd += ` -p ${port_panel}:${port_panel}`;
// 	if(docker_params.prod === false){
// 		cmd += ` -v $(pwd)/src/:/app/src/`;
// 		cmd += ` -v $(pwd)/.env:/app/.env`;
// 		cmd += ` -v ${toml_path}:/app/uranio.toml`;
// 		cmd += ` -v $(pwd)/package.json:/app/package.json`;
// 		cmd += ` -v $(pwd)/node_modules/:/app/node_modules/`;
// 		cmd += ` -v $(pwd)/.uranio/uranio-schema:/app/.uranio/uranio-schema`;
// 		cmd += ` -v $(pwd)/cert/:/app/cert/`;
// 	}
// 	cmd += ` --name ${container_name}`;
// 	if(typeof entrypoint === 'string'){
// 		cmd += ` --entrypoint="${entrypoint}"`;
// 	}
// 	cmd += ` ${image_name}`;
// 	await util_instance.spawn.spin_and_native_promise(cmd, 'creating', 'trace', defaults.prefix_docker);
// 	output_instance.done_log(
// 		`Docker container created ${container_name}`
// 	);
// }
async function create_dev(params) {
    _init_params(params);
    const container_name = _get_container_name_dev();
    const image_name = _get_image_name();
    const toml = util_instance.cmd.read_toml();
    let port_server = 7777;
    let port_panel = 5454;
    if (typeof toml.service_port !== 'undefined') {
        port_server = Number(toml.service_port);
    }
    if (typeof toml.client_panel_port !== 'undefined') {
        port_panel = Number(toml.client_panel_port);
    }
    if (docker_params.prod === false) {
        if (typeof toml.dev_service_port !== 'undefined') {
            port_server = Number(toml.dev_service_port);
        }
        if (typeof toml.client_dev_panel_port !== 'undefined') {
            port_panel = Number(toml.client_dev_panel_port);
        }
    }
    // const network_name = _get_network_name();
    const toml_path = (docker_params.config[0] === '/') ?
        docker_params.config : `$(pwd)/${docker_params.config}`;
    let uranio_cmd = `uranio dev -u --prefix_loglevel`;
    if (docker_params.prod === true) {
        uranio_cmd += ` --prod`;
    }
    let cmd = '';
    cmd += `docker create`;
    // cmd += ` --network ${network_name}`;
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
    cmd += ` ${image_name}`;
    cmd += ` ${uranio_cmd}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'creating', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker DEV container created ${container_name}`);
}
async function create_start(params) {
    _init_params(params);
    const container_name = _get_container_name_start();
    const image_name = _get_image_name();
    const toml = util_instance.cmd.read_toml();
    let port_server = 7777;
    let port_panel = 5454;
    if (typeof toml.service_port !== 'undefined') {
        port_server = Number(toml.service_port);
    }
    if (typeof toml.client_panel_port !== 'undefined') {
        port_panel = Number(toml.client_panel_port);
    }
    if (docker_params.prod === false) {
        if (typeof toml.dev_service_port !== 'undefined') {
            port_server = Number(toml.dev_service_port);
        }
        if (typeof toml.client_dev_panel_port !== 'undefined') {
            port_panel = Number(toml.client_dev_panel_port);
        }
    }
    // const network_name = _get_network_name();
    // const toml_path = (docker_params.config[0] === '/') ?
    // 	docker_params.config : `$(pwd)/${docker_params.config}`;
    let uranio_cmd = `uranio start -u --prefix_loglevel`;
    if (docker_params.prod === true) {
        uranio_cmd += ` --prod`;
    }
    let cmd = '';
    cmd += `docker create`;
    // cmd += ` --network ${network_name}`;
    cmd += ` -p ${port_server}:${port_server}`;
    cmd += ` -p ${port_panel}:${port_panel}`;
    cmd += ` --name ${container_name}`;
    cmd += ` ${image_name}`;
    cmd += ` ${uranio_cmd}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'creating', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container created ${container_name}`);
}
async function start(params) {
    _init_params(params);
    if (_start_container_exists() === false) {
        await create_start(docker_params);
    }
    const container_name = _get_container_name_start();
    let cmd = '';
    cmd += `docker start -i ${container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'starting container', '', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container started ${container_name}`);
}
exports.start = start;
async function dev(params) {
    await _copy_compiled();
    if (_dev_container_exists() === false) {
        await create_dev(docker_params);
    }
    _init_params(params);
    const container_name = _get_container_name_dev();
    let cmd = '';
    cmd += `docker start -i ${container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, 'starting dev container', '', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker DEV container started ${container_name}`);
}
exports.dev = dev;
async function start_server(params) {
    console.log(`Start server`, params);
    // _init_params(params);
    // const container_name = _get_container_name_start();
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
    // const container_name = _get_container_name_start();
    // let cmd = '';
    // cmd += `docker start -i ${container_name}`;
    // await _execute_log(cmd, 'docker', 'starting');
    // output_instance.done_log(
    //   `Docker image started ${container_name}`
    // );
}
exports.start_panel = start_panel;
async function stop_start(params, continue_on_fail = false) {
    _init_params(params);
    if (_start_container_exists() === false) {
        return;
    }
    const container_name = _get_container_name_start();
    let cmd = '';
    cmd += `docker stop ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'stopping', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container stopped ${container_name}`);
}
exports.stop_start = stop_start;
async function stop_dev(params, continue_on_fail = false) {
    _init_params(params);
    if (_dev_container_exists() === false) {
        return;
    }
    const container_name = _get_container_name_dev();
    let cmd = '';
    cmd += `docker stop ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'stopping', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container stopped ${container_name}`);
}
exports.stop_dev = stop_dev;
async function remove_start(params, continue_on_fail = false) {
    _init_params(params);
    if (_start_container_exists() === false) {
        return;
    }
    const container_name = _get_container_name_start();
    let cmd = '';
    cmd += `docker rm ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'removing', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container removed ${container_name}`);
}
exports.remove_start = remove_start;
async function remove_dev(params, continue_on_fail = false) {
    _init_params(params);
    if (_dev_container_exists() === false) {
        return;
    }
    const container_name = _get_container_name_dev();
    let cmd = '';
    cmd += `docker rm ${container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, 'removing', 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker container removed ${container_name}`);
}
exports.remove_dev = remove_dev;
async function unbuild(params, continue_on_fail = false) {
    _init_params(params);
    if (_uranio_image_exists() === false) {
        return;
    }
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
    const db_container_name = _get_container_name_db();
    const port = 27017;
    const network_name = _get_network_name();
    let cmd = '';
    cmd += `docker create --name ${db_container_name}`;
    cmd += ` --network ${network_name}`;
    cmd += ` -v ~/mongo/data-${project_name}:/data/db`;
    cmd += ` -p ${port}:${port}`;
    cmd += ` mongo:5`;
    await util_instance.spawn.spin_and_native_promise(cmd, `creating db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container created ${db_container_name}`);
}
exports.db_create = db_create;
async function db_start(params) {
    _init_params(params);
    const db_container_name = _get_container_name_db();
    let cmd = '';
    cmd += `docker start ${db_container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd, `starting db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container started ${db_container_name}`);
}
exports.db_start = db_start;
async function db_stop(params, continue_on_fail = false) {
    _init_params(params);
    if (_db_container_exists() === false) {
        return;
    }
    const db_container_name = _get_container_name_db();
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
    if (_db_container_exists() === false) {
        return;
    }
    const db_container_name = _get_container_name_db();
    let cmd = '';
    cmd += `docker rm ${db_container_name}`;
    if (continue_on_fail) {
        cmd += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd, `removing db ${docker_params.db}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker db container removed ${db_container_name}`);
}
exports.db_remove = db_remove;
async function remove_tmp(params, continue_on_fail = false) {
    _init_params(params);
    if (_tmp_container_exists() === false) {
        return;
    }
    const container_name = _get_container_name_tmp();
    let cmd_rm = '';
    cmd_rm += `docker rm tmp_${container_name}`;
    if (continue_on_fail) {
        cmd_rm += ` || true`;
    }
    await util_instance.spawn.spin_and_native_promise(cmd_rm, `removing tmp container ${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker removed tmp container ${container_name}`);
}
exports.remove_tmp = remove_tmp;
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
    if (_uranio_network_exists() === false) {
        return;
    }
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
    const container_name = _get_container_name_tmp();
    let cmd_create = '';
    cmd_create += `docker create --name ${container_name} ${image_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd_create, `creating tmp container ${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    let cmd_cp_node = '';
    cmd_cp_node += `docker cp tmp_${container_name}:/app/node_modules node_modules`;
    await util_instance.spawn.spin_and_native_promise(cmd_cp_node, `copying node_modules from tmp container ${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    // let cmd_cp_uranio = '';
    // cmd_cp_uranio += `docker cp tmp_${container_name}:/app/.uranio/. .uranio/`;
    // await util_instance.spawn.spin_and_native_promise(cmd_cp_uranio, 'docker', `copying .uranio from tmp container tmp_${container_name}`);
    let cmd_remove = '';
    cmd_remove += `docker rm ${container_name}`;
    await util_instance.spawn.spin_and_native_promise(cmd_remove, `removing tmp container ${container_name}`, 'trace', defaults_1.defaults.prefix_docker);
    output_instance.done_log(`Docker copied files from tmp container ${container_name}`);
}
function _start_container_exists() {
    return container_exists(_get_container_name_start());
}
function _dev_container_exists() {
    return container_exists(_get_container_name_dev());
}
function _tmp_container_exists() {
    return container_exists(_get_container_name_tmp());
}
function _db_container_exists() {
    return container_exists(_get_container_name_db());
}
function _uranio_image_exists() {
    return image_exists(_get_image_name());
}
function _uranio_network_exists() {
    return network_exists(_get_network_name());
}
function container_exists(container_name) {
    try {
        const cmd = `docker ps -a | grep ${container_name}`;
        output_instance.trace_log(cmd);
        cp.execSync(cmd);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.container_exists = container_exists;
function image_exists(image_name) {
    try {
        cp.execSync(`docker image ls -a | grep ${image_name}`);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.image_exists = image_exists;
function network_exists(network_name) {
    try {
        cp.execSync(`docker image ls -a | grep ${network_name}`);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.network_exists = network_exists;
function _get_project_name() {
    const package_json_path = `${docker_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    const package_data = uranio_lib_1.urn_util.json.clean_parse(data);
    return package_data['name'] || 'uranio-project';
}
function _get_image_name() {
    const project_name = _get_project_name();
    const image_name = `${project_name}_uranio_img`;
    return image_name;
}
function _get_container_name_start() {
    const project_name = _get_project_name();
    const container_name = `${project_name}_uranio_con_start`;
    return container_name;
}
function _get_container_name_dev() {
    const project_name = _get_project_name();
    const container_name = `${project_name}_uranio_con_dev`;
    return container_name;
}
function _get_container_name_tmp() {
    const project_name = _get_project_name();
    const container_name = `${project_name}_uranio_con_tmp`;
    return container_name;
}
function _get_network_name() {
    const project_name = _get_project_name();
    const network_name = `${project_name}_uranio_net`;
    return network_name;
}
function _get_container_name_db() {
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
    // const dockerignore_file =
    // 	`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.dockerignore`;
    const dockerignore_file = `${docker_params.root}/${defaults_1.defaults.tmp_folder}/uranio-assets/docker/Dockerfile.dockerignore`;
    // const ignore_dest = `${docker_folder}/.dockerignore`;
    const ignore_dest = `${docker_folder}/Dockerfile.dockerignore`;
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
        `mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
    new_dot_env['URN_MONGO_TRASH_CONNECTION'] =
        `mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
    new_dot_env['URN_MONGO_LOG_CONNECTION'] =
        `mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
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