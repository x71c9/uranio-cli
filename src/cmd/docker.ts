/**
 * Docker command module
 *
 * There might be some confusion since both Uranio and Docker have the
 * same method names.
 *
 * Uranio commands are:
 * - uranio docker start
 * - uranio docker dev
 *
 * These commands can be run with or without the flag --prod
 *
 * Uranio build only one docker image, but creates different containers
 * according with the command and the --prod flag.
 *
 * When running both `uranio docker start` and `uranio docker dev` the
 * following happens:
 *
 * - if the Uranio image does not exist it builds it;
 * - if the Uranio container does not exist it creates it;
 * - it start the container.
 *
 * There are 4 possible containers Uranio creates.
 *
 * For the command `uranio docker start` the container name ends with:
 * - _uranio_con_start
 * - _uranio_con_start_prod
 *
 * For the command `uranio docker dev` the container name ends with:
 * - _uranio_con_dev
 * - _uranio_con_dev_prod
 *
 * 
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import {urn_util} from 'uranio-lib';

import * as output from '../output/index';

import * as util from '../util/index';

import {default_params, defaults} from '../conf/defaults';

import {Params, Arguments} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {merge_params} from './common';

let docker_params = default_params as Params;

let dot_folder = `./${defaults.folder}`;
let docker_folder = `${dot_folder}/${defaults.docker_folder}`;

type Command = 'start' | 'dev';

export async function docker(params:Partial<Params>, args:Arguments)
		:Promise<void>{
	
	_init_params(params);
	
	dot_folder = `${docker_params.root}/${defaults.folder}`;
	docker_folder = `${dot_folder}/${defaults.docker_folder}`;
	
	switch(args._[1]){
		case 'build':{
			await build(docker_params);
			break;
		}
		case 'start':{
			await start(docker_params);
			break;
		}
		case 'dev':{
			await dev(docker_params);
			break;
		}
		case 'push':{
			await push(docker_params);
			break;
		}
		case 'prune':{
			await prune(docker_params);
			break;
		}
		case 'unbuild':{
			await unbuild(docker_params);
			break;
		}
		// case 'create':{
		// 	switch(args._[2]){
		// 		case 'start':{
		// 			await _create_start(docker_params);
		// 			break;
		// 		}
		// 		case 'dev':{
		// 			await _create_dev(docker_params);
		// 			break;
		// 		}
		// 		default:{
		// 			let warn_msg = ``;
		// 			warn_msg += `Invalid parameter. Run uranio docker create`;
		// 			warn_msg += ` with either \`start\` or \`dev\`.`;
		// 			output_instance.warn_log(warn_msg)
		// 			process.exit(1);
		// 		}
		// 	}
		// 	break;
		// }
		// case 'stop':{
		// 	switch(args._[2]){
		// 		case 'start':{
		// 			await _stop_start(docker_params);
		// 			break;
		// 		}
		// 		case 'dev':{
		// 			await _stop_dev(docker_params);
		// 			break;
		// 		}
		// 		default:{
		// 			let warn_msg = ``;
		// 			warn_msg += `Invalid parameter. Run uranio docker stop`;
		// 			warn_msg += ` with either \`start\` or \`dev\`.`;
		// 			output_instance.warn_log(warn_msg)
		// 			process.exit(1);
		// 		}
		// 	}
		// 	break;
		// }
		// case 'remove':{
		// 	switch(args._[2]){
		// 		case 'start':{
		// 			await remove_start(docker_params);
		// 			break;
		// 		}
		// 		case 'dev':{
		// 			await remove_dev(docker_params);
		// 			break;
		// 		}
		// 		default:{
		// 			let warn_msg = ``;
		// 			warn_msg += `Invalid parameter. Run uranio docker remove`;
		// 			warn_msg += ` with either \`start\` or \`dev\`.`;
		// 			output_instance.warn_log(warn_msg)
		// 			process.exit(1);
		// 		}
		// 	}
		// 	break;
		// }
		case 'db':{
			// const db = args._[3] as DB;
			// check_db(db);
			switch(args._[2]){
				// case 'create':{
				// 	await db_create(docker_params);
				// 	break;
				// }
				case 'start':{
					await db_start(docker_params);
					break;
				}
				case 'stop':{
					await db_stop(docker_params);
					break;
				}
				case 'remove':{
					await db_remove(docker_params);
					break;
				}
				default:{
					output_instance.error_log(
						// `Invalid uranio docker db command. Try [create, start, stop, remove]`
						`Invalid uranio docker db command. Try [start, stop, remove]`
					);
					process.exit(1);
				}
			}
			break;
		}
		// case 'network':{
		// 	switch(args._[2]){
		// 		case 'create':{
		// 			await network_create(docker_params);
		// 			break;
		// 		}
		// 		case 'remove':{
		// 			await network_remove(docker_params);
		// 			break;
		// 		}
		// 		default:{
		// 			output_instance.error_log(
		// 				`Invalid uranio docker network command. Try [create, remove]`
		// 			);
		// 			process.exit(1);
		// 		}
		// 	}
		// 	break;
		// }
		// case 'env':{
		// 	switch(args._[2]){
		// 		case 'update':{
		// 			_update_env(docker_params);
		// 			break;
		// 		}
		// 		default:{
		// 			output_instance.error_log(
		// 				`Invalid uranio docker env command. Try [update]`
		// 			);
		// 			process.exit(1);
		// 		}
		// 	}
		// 	break;
		// }
		// case 'exists':{
		// 	if(typeof args._[2] !== 'string' || args._[2] === ''){
		// 		output_instance.error_log(`Invalid container name.`);
		// 		process.exit(1);
		// 	}
		// 	if(_container_exists(args._[2])){
		// 		console.log(true);
		// 		process.exit(0);
		// 	}
		// 	console.log(false);
		// 	process.exit(0);
		// }
		// default:{
		// 	output_instance.error_log(`Invalid uranio docker command.`);
		// 	process.exit(1);
		// }
	}
}

export async function build(params:Partial<Params>)
		:Promise<void>{
	
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
	if(docker_params.docker_load === true){
		cmd += ` --load`; // important for Github Action so that the image is kept locally
	}
	cmd += ` .`;
	await util_instance.spawn.spin_and_native_promise(cmd, 'building', 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker image built ${image_name}`
	);
	
	// if(docker_params.prod === false){
	// await _copy_compiled();
	// }
}

export async function push(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	const image_name = _get_image_name();
	
	let cmd_tag = '';
	cmd_tag += `docker image tag ${image_name} ${params.docker_tag}`;
	await util_instance.spawn.spin_and_native_promise(cmd_tag, 'tagging', 'trace', defaults.prefix_docker);
	output_instance.done_log(`Docker image tagged ${params.docker_tag}`);
	
	let cmd = '';
	cmd += `docker push ${params.docker_tag}`;
	await util_instance.spawn.spin_and_native_promise(cmd, 'pushing', 'trace', defaults.prefix_docker);
	output_instance.done_log(`Docker image pushed to Docker Registry`);
}

export async function start(params:Partial<Params>):Promise<void>{
	_init_params(params);
	if(_uranio_image_exists() === false){
		output_instance.info_log(`First time running. Building uranio image...`, `[START]`);
		await build(docker_params);
	}
	if(docker_params.prod === true){
		await _start_prod();
	}else{
		await _start();
	}
}

async function _start(){
	if(_container_exists(_get_container_name_start()) === false){
		output_instance.info_log(`First time running. Building container [uranio start DEV]...`, `[START]`);
		await _create_start();
	}
	const container_name = _get_container_name_start();
	await _start_container(container_name);
}

async function _start_prod(){
	if(_container_exists(_get_container_name_start_prod()) === false){
		output_instance.info_log(`First time running. Building container [uranio start PROD]...`, `[START]`);
		await _create_start_prod();
	}
	const container_name = _get_container_name_start_prod();
	await _start_container(container_name);
}

export async function dev(params:Partial<Params>):Promise<void>{
	_init_params(params);
	if(_uranio_image_exists() === false){
		output_instance.info_log(`First time running. Building uranio image...`, `[DEV]`);
		await build(docker_params);
	}
	if(_compile_file_exists() === false){
		await _copy_compiled();
	}
	if(docker_params.prod === true){
		await _dev_prod();
	}else{
		await _dev();
	}
}

async function _dev(){
	if(_container_exists(_get_container_name_dev()) === false){
		output_instance.info_log(`First time running. Building container [uranio dev DEV]...`, `[START]`);
		await _create_dev();
	}
	const container_name = _get_container_name_dev();
	await _start_container(container_name);
}

async function _dev_prod(){
	if(_container_exists(_get_container_name_dev_prod()) === false){
		output_instance.info_log(`First time running. Building container [uranio dev PROD]...`, `[START]`);
		await _create_dev_prod();
	}
	const container_name = _get_container_name_dev_prod();
	await _start_container(container_name);
}

async function _start_container(container_name:string){
	let cmd = '';
	cmd += `docker start -i ${container_name}`;
	await util_instance.spawn.native_promise(cmd, 'starting container', '', defaults.prefix_docker);
	output_instance.done_log(
		`Docker container started ${container_name}`
	);
}

// async function _create_start(params:Partial<Params>):Promise<void>{
// 	if(docker_params.prod === true){
// 		await _create_start_prod(params);
// 	}else{
// 		await _create_start(params);
// 	}
// }

// async function _create_dev(params:Partial<Params>):Promise<void>{
// 	if(docker_params.prod === true){
// 		await _create_dev_prod(params);
// 	}else{
// 		await _create_dev(params);
// 	}
// }

async function _create_container(container_name:string, production:boolean, command:Command)
		:Promise<void>{
	
	const image_name = _get_image_name();
	
	const toml = util_instance.cmd.read_toml();
	let port_server = 7777;
	let port_panel = 5454;
	if(typeof toml.service_port !== 'undefined'){
		port_server = Number(toml.service_port);
	}
	if(typeof toml.client_panel_port !== 'undefined'){
		port_panel = Number(toml.client_panel_port);
	}
	
	if(production === false){
		if(typeof toml.dev_service_port !== 'undefined'){
			port_server = Number(toml.dev_service_port);
		}
		if(typeof toml.client_dev_panel_port !== 'undefined'){
			port_panel = Number(toml.client_dev_panel_port);
		}
	}
	
	const network_name = _get_network_name();
	if(_network_exists(network_name) === false){
		await network_create(docker_params);
	}
	
	const toml_path = (docker_params.config[0] === '/') ?
		docker_params.config : `$(pwd)/${docker_params.config}`;
	
	let uranio_cmd = `uranio ${command} -u --prefix_loglevel`;
	if(production === true){
		uranio_cmd += ` --prod`;
	}
	
	let cmd = '';
	cmd += `docker create`;
	cmd += ` --network ${network_name}`;
	cmd += ` -p ${port_server}:${port_server}`;
	cmd += ` -p ${port_panel}:${port_panel}`;
	if(command === 'dev'){
		cmd += ` -v $(pwd)/src/:/app/src/`;
		cmd += ` -v $(pwd)/.env:/app/.env`;
		cmd += ` -v ${toml_path}:/app/uranio.toml`;
		cmd += ` -v $(pwd)/package.json:/app/package.json`;
		cmd += ` -v $(pwd)/node_modules/:/app/node_modules/`;
		cmd += ` -v $(pwd)/.uranio/uranio-schema:/app/.uranio/uranio-schema`;
		cmd += ` -v $(pwd)/cert/:/app/cert/`;
	}
	cmd += ` --name ${container_name}`;
	cmd += ` ${image_name}`;
	cmd += ` ${uranio_cmd}`;
	
	await util_instance.spawn.spin_and_native_promise(
		cmd,
		'creating container',
		'trace',
		defaults.prefix_docker
	);
}

async function _create_dev()
		:Promise<void>{
	output_instance.debug_log(`Creating Docker container [uranio dev DEV]`, `[DEV] `);
	
	const container_name = _get_container_name_dev();
	await _create_container(container_name, false, 'dev');
	
	output_instance.done_log(
		`Docker container [uranio dev DEV] created ${container_name}`
	);
}

async function _create_dev_prod()
		:Promise<void>{
	output_instance.debug_log(`Creating Docker container [uranio dev PROD]`, `[DEV] `);
	
	const container_name = _get_container_name_dev_prod();
	await _create_container(container_name, true, 'dev');
	
	output_instance.done_log(
		`Docker container [uranio dev PROD] created ${container_name}`
	);
}

async function _create_start()
		:Promise<void>{
	output_instance.debug_log(`Creating Docker container [uranio start DEV]`, `[START] `);
	
	const container_name = _get_container_name_start();
	await _create_container(container_name, false, 'start');
	
	output_instance.done_log(
		`Docker container [uranio start DEV] created ${container_name}`
	);
}

async function _create_start_prod()
		:Promise<void>{
	output_instance.debug_log(`Creating Docker container [uranio start PROD]`, `[START] `);
	
	const container_name = _get_container_name_start_prod();
	await _create_container(container_name, true, 'start');
	
	output_instance.done_log(
		`Docker container [uranio start PROD] created ${container_name}`
	);
}


async function _stop_start(continue_on_fail=false)
		:Promise<void>{
	await _stop_start_dev(continue_on_fail);
	await _stop_start_prod(continue_on_fail);
}

async function _stop_start_dev(continue_on_fail=false){
	const container_name = _get_container_name_start();
	await _stop_container(container_name, continue_on_fail);
}

async function _stop_start_prod(continue_on_fail=false){
	const container_name = _get_container_name_start_prod();
	await _stop_container(container_name, continue_on_fail);
}

async function _stop_dev(continue_on_fail=false)
		:Promise<void>{
	await _stop_dev_dev(continue_on_fail);
	await _stop_dev_prod(continue_on_fail);
}

async function _stop_dev_dev(continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_dev();
	await _stop_container(container_name, continue_on_fail);
}

async function _stop_dev_prod(continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_dev_prod();
	await _stop_container(container_name, continue_on_fail);
}

async function _stop_container(container_name:string, continue_on_fail=false){
	if(_container_exists(container_name) === false){
		return;
	}
	let cmd = '';
	cmd += `docker stop ${container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd, 'stopping', 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker container stopped ${container_name}`
	);
}

export async function remove_start(params:Partial<Params>, continue_on_fail=false){
	await _remove_start_dev(params, continue_on_fail);
	await _remove_start_prod(params, continue_on_fail);
}

async function _remove_start_dev(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_start();
	await _remove_container(params, container_name, continue_on_fail);
}

async function _remove_start_prod(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_start_prod();
	await _remove_container(params, container_name, continue_on_fail);
}

export async function remove_dev(params:Partial<Params>, continue_on_fail=false){
	await _remove_dev_dev(params, continue_on_fail);
	await _remove_dev_prod(params, continue_on_fail);
}

async function _remove_dev_dev(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_dev();
	await _remove_container(params, container_name, continue_on_fail);
}

async function _remove_dev_prod(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	const container_name = _get_container_name_dev_prod();
	await _remove_container(params, container_name, continue_on_fail);
}

async function _remove_container(params:Partial<Params>, container_name:string, continue_on_fail=false){
	_init_params(params);
	if(_container_exists(container_name) === false){
		return;
	}
	let cmd = '';
	cmd += `docker rm ${container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd, 'removing', 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker container removed ${container_name}`
	);
}

// export async function start_server(params:Partial<Params>):Promise<void>{
// 	console.log(`Start server`, params);
// 	// _init_params(params);
	
// 	// const container_name = _get_container_name_start();
// 	// let cmd = '';
// 	// cmd += `docker start -i ${container_name}`;
// 	// await _execute_log(cmd, 'docker', 'starting');
// 	// output_instance.done_log(
// 	//   `Docker image started ${container_name}`
// 	// );
// }

// export async function start_panel(params:Partial<Params>):Promise<void>{
// 	console.log(`Start panel`, params);
// 	// _init_params(params);
	
// 	// const container_name = _get_container_name_start();
// 	// let cmd = '';
// 	// cmd += `docker start -i ${container_name}`;
// 	// await _execute_log(cmd, 'docker', 'starting');
// 	// output_instance.done_log(
// 	//   `Docker image started ${container_name}`
// 	// );
// }

export async function unbuild(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	if(_uranio_image_exists() === false){
		return;
	}
	const image_name = _get_image_name();
	let cmd = '';
	cmd += `docker image rm`;
	cmd += ` ${image_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd, `removing image ${image_name}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker image removed ${image_name}`
	);
}

export async function db_create(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	const project_name = _get_project_name();
	const db_container_name = _get_container_name_db();
	const port = 27017;
	const network_name = _get_network_name();
	if(_network_exists(network_name) === false){
		await network_create(docker_params);
	}
	let cmd = '';
	cmd += `docker create --name ${db_container_name}`;
	cmd += ` --network ${network_name}`;
	cmd += ` -v ~/mongo/data-${project_name}:/data/db`;
	cmd += ` -p ${port}:${port}`;
	cmd += ` mongo:5`;
	await util_instance.spawn.spin_and_native_promise(cmd, `creating db ${docker_params.db}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker db container created ${db_container_name}`
	);
}

export async function db_start(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	if(_container_exists(_get_container_name_db()) === false){
		output_instance.info_log(`First time running. Building container DB...`, `[DB]`);
		await db_create(docker_params);
	}
	
	_update_env();
	
	const db_container_name = _get_container_name_db();
	let cmd = '';
	cmd += `docker start ${db_container_name}`;
	await util_instance.spawn.spin_and_native_promise(cmd, `starting db ${docker_params.db}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker db container started ${db_container_name}`
	);
}

export async function db_stop(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	if(_db_container_exists() === false){
		return;
	}
	const db_container_name = _get_container_name_db();
	let cmd = '';
	cmd += `docker stop ${db_container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd, `stopping db ${docker_params.db}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker db container stopped ${db_container_name}`
	);
}

export async function db_remove(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	if(_db_container_exists() === false){
		return;
	}
	const db_container_name = _get_container_name_db();
	let cmd = '';
	cmd += `docker rm ${db_container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd, `removing db ${docker_params.db}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker db container removed ${db_container_name}`
	);
}

async function _remove_tmp(continue_on_fail=false)
		:Promise<void>{
	if(_tmp_container_exists() === false){
		return;
	}
	const container_name = _get_container_name_tmp();
	let cmd_rm = '';
	cmd_rm += `docker rm ${container_name}`;
	if(continue_on_fail){
		cmd_rm += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd_rm, `removing tmp container ${container_name}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker removed tmp container ${container_name}`
	);
}

export async function network_create(params:Partial<Params>, continue_on_fail=false):Promise<void>{
	_init_params(params);
	const network_name = _get_network_name();
	let cmd_rm = '';
	cmd_rm += `docker network create ${network_name}`;
	if(continue_on_fail){
		cmd_rm += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd_rm, `creating network ${network_name}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker created network ${network_name}`
	);
}

export async function network_remove(params:Partial<Params>, continue_on_fail=false):Promise<void>{
	_init_params(params);
	if(_uranio_network_exists() === false){
		return;
	}
	const network_name = _get_network_name();
	let cmd_rm = '';
	cmd_rm += `docker network remove ${network_name}`;
	if(continue_on_fail){
		cmd_rm += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd_rm, `creating network ${network_name}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker removed network ${network_name}`
	);
}

export async function prune(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	
	_init_params(params);
	
	await _remove_tmp(true);
	await db_stop(docker_params, true);
	await db_remove(docker_params, true);
	await network_remove(docker_params, true);
	await _stop_start(true);
	await _stop_dev(true);
	await remove_start(docker_params, true);
	await remove_dev(docker_params, true);
	await unbuild(docker_params, true);
	await _remove_compiled_file();
	
	const project_name = _get_project_name();
	let cmd_prune = '';
	cmd_prune += `docker builder prune -af --filter "label=project=${project_name}"`;
	if(continue_on_fail){
		cmd_prune += ` || true`;
	}
	await util_instance.spawn.spin_and_native_promise(cmd_prune, `deleteing builder cache`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker builder cache deleted.`
	);
}

async function _copy_compiled(){
	const image_name = _get_image_name();
	const container_name = _get_container_name_tmp();
	
	let cmd_create = '';
	cmd_create += `docker create --name ${container_name} ${image_name}`;
	await util_instance.spawn.spin_and_native_promise(cmd_create, `creating tmp container ${container_name}`, 'trace', defaults.prefix_docker);
	
	util_instance.fs.remove_directory(`${docker_params.root}/node_modules`);
	
	let cmd_cp_node = '';
	cmd_cp_node += `docker cp ${container_name}:/app/node_modules node_modules`;
	await util_instance.spawn.spin_and_native_promise(cmd_cp_node, `copying node_modules from tmp container ${container_name}`, 'trace', defaults.prefix_docker);
	
	// let cmd_cp_uranio = '';
	// cmd_cp_uranio += `docker cp ${container_name}:/app/.uranio/. .uranio/`;
	// await util_instance.spawn.spin_and_native_promise(cmd_cp_uranio, 'docker', `copying .uranio from tmp container ${container_name}`);
	let cmd_remove = '';
	cmd_remove += `docker rm ${container_name}`;
	await util_instance.spawn.spin_and_native_promise(cmd_remove, `removing tmp container ${container_name}`, 'trace', defaults.prefix_docker);
	output_instance.done_log(
		`Docker copied files from tmp container ${container_name}`
	);
	_add_copy_compiled_file();
}

function _add_copy_compiled_file(){
	const compiled_file_path = `${docker_folder}/compiled`;
	util_instance.fs.create_file(compiled_file_path);
}

function _compile_file_exists(){
	const compiled_file_path = `${docker_folder}/compiled`;
	return util_instance.fs.exists(compiled_file_path);
}

function _remove_compiled_file(){
	const compiled_file_path = `${docker_folder}/compiled`;
	util_instance.fs.remove_file(compiled_file_path);
}

export function fail_if_compiled(params:Partial<Params>){
	_init_params(params);
	if(_compile_file_exists() === true){
		let err_msg = '[FATAL]';
		err_msg += `Uranio was compiled inside a Docker container.`;
		err_msg += ` In order to work outside the container it must be recompiled.`;
		err_msg += ` Run \`uranio reinit\` to recompiled.`;
		err_msg += ` Otherwise to run inside the docker container run`;
		err_msg += ` \`uranio docker dev\` or \`uranio docker start\``;
		output_instance.error_log(err_msg);
		throw new Error(err_msg);
	}
}

// function _start_container_exists():boolean{
// 	return (docker_params.prod === true) ?
// 		_container_exists(_get_container_name_start_prod()) :
// 		_container_exists(_get_container_name_start());
// }

// function _dev_container_exists():boolean{
// 	return (docker_params.prod === true) ?
// 		_container_exists(_get_container_name_dev_prod()) :
// 		_container_exists(_get_container_name_dev());
// }

function _uranio_image_exists():boolean{
	return _image_exists(_get_image_name());
}

function _uranio_network_exists():boolean{
	return _network_exists(_get_network_name());
}

function _db_container_exists():boolean{
	return _container_exists(_get_container_name_db());
}

function _tmp_container_exists():boolean{
	return _container_exists(_get_container_name_tmp());
}

function _container_exists(container_name:string):boolean{
	try{
		const cmd = `docker ps -a | grep ${container_name}`;
		output_instance.trace_log(cmd)
		cp.execSync(cmd);
		return true;
	}catch(err){
		return false;
	}
}

function _image_exists(image_name:string):boolean{
	try{
		cp.execSync(`docker image ls -a | grep ${image_name}`);
		return true;
	}catch(err){
		return false;
	}
}

function _network_exists(network_name:string):boolean{
	try{
		cp.execSync(`docker network ls | grep ${network_name}`);
		return true;
	}catch(err){
		return false;
	}
}

function _get_project_name(){
	const package_json_path = `${docker_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	const package_data = urn_util.json.clean_parse(data);
	return package_data['name'] || 'uranio-project';
}
function _get_image_name(){
	const project_name = _get_project_name();
	const image_name = `${project_name}_uranio_img`;
	return image_name;
}
function _get_container_name_start(){
	const project_name = _get_project_name();
	const container_name = `${project_name}_uranio_con_start`;
	return container_name;
}
// function _get_container_name_start(){
// 	return `${_get_container_name_start()}_dev`;
// }
function _get_container_name_start_prod(){
	return `${_get_container_name_start()}_prod`;
}
function _get_container_name_dev(){
	const project_name = _get_project_name();
	const container_name = `${project_name}_uranio_con_dev`;
	return container_name;
}
// function _get_container_name_dev(){
// 	return `${_get_container_name_dev()}_dev`;
// }
function _get_container_name_dev_prod(){
	return `${_get_container_name_dev()}_prod`;
}
function _get_container_name_tmp(){
	const project_name = _get_project_name();
	const container_name = `${project_name}_uranio_con_tmp`;
	return container_name;
}
function _get_network_name(){
	const project_name = _get_project_name();
	const network_name = `${project_name}_uranio_net`;
	return network_name;
}
function _get_container_name_db(){
	const project_name = _get_project_name();
	const db_container_name = `${project_name}_uranio_db`;
	return db_container_name;
}

function _init_params(params:Partial<Params>)
		:void{
	docker_params = merge_params(params);
	output_instance = output.create(docker_params);
	util_instance = util.create(docker_params, output_instance);
	util_instance.must_be_initialized();
}

async function _clone_assets(){
	output_instance.start_loading(`Cloning assets...`);
	util_instance.fs.remove_directory(defaults.tmp_folder);
	util_instance.fs.create_directory(defaults.tmp_folder);
	await util_instance.cmd.clone_repo(
		defaults.assets_repo,
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets`,
		docker_params.branch
	);
	output_instance.done_log(`Cloned assets repo.`);
}

async function _download_dockerfiles(){
	await _clone_assets();
	
	// const def_folder = `${docker_params.root}/${defaults.folder}`;
	// const dest_folder = `${def_folder}/${defaults.docker_folder}`;
	
	if(!util_instance.fs.exists(docker_folder)){
		util_instance.fs.create_directory(docker_folder);
	}
	
	const docker_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/Dockerfile`;
	const dest = `${docker_folder}/Dockerfile`;
	util_instance.fs.copy_file(docker_file, dest);
	
	// const dockerignore_file =
	// 	`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.dockerignore`;
	const dockerignore_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/Dockerfile.dockerignore`;
	// const ignore_dest = `${docker_folder}/.dockerignore`;
	const ignore_dest = `${docker_folder}/Dockerfile.dockerignore`;
	util_instance.fs.copy_file(dockerignore_file, ignore_dest);
	
	const docker_bash =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.bash_docker`;
	const bash_dest = `${docker_folder}/.bash_docker`;
	util_instance.fs.copy_file(docker_bash, bash_dest);
	
	_remove_tmp_dir();
}

function _remove_tmp_dir(){
	output_instance.start_loading(
		`Removing tmp folder [${defaults.tmp_folder}]...`
	);
	util_instance.fs.remove_directory(
		`${docker_params.root}/${defaults.tmp_folder}`,
	);
	output_instance.done_trace_log(
		`Removed tmp folder [${defaults.tmp_folder}].`,
	);
}

// async function _execute_spin_log(cmd:string, context:string, action:string){
//   return new Promise((resolve, reject) => {
//     util_instance.spawn.spin_and_log(
//       cmd,
//       context,
//       action,
//       undefined,
//       resolve,
//       reject
//     );
//   });
// }

// async function _execute_spin_verbose(cmd:string, action:string){
// 	return new Promise((resolve, reject) => {
// 		util_instance.spawn.spin_and_verbose_log(
// 			cmd,
// 			action,
// 			resolve,
// 			reject
// 		);
// 	});
// }

// async function _execute_log(cmd:string, action:string){
// 	return new Promise((resolve, reject) => {
// 		util_instance.spawn.log(
// 			cmd,
// 			action,
// 			resolve,
// 			reject
// 		);
// 	});
// }

type DotEnv = {
	[k:string]: string
}

function _update_env(params?:Partial<Params>):void{
	
	if(params){
		_init_params(params);
	}
	
	const dotenv_path = `${docker_params.root}/.env`;
	if(!util_instance.fs.exists(dotenv_path)){
		output_instance.error_log(`Missing .env file.`);
		process.exit(1);
	}
	
	const new_dot_env:DotEnv = {};
	new_dot_env['URN_MONGO_MAIN_CONNECTION'] =
		`mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_TRASH_CONNECTION'] =
		`mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_LOG_CONNECTION'] =
		`mongodb://${_get_container_name_db()}.${_get_network_name()}:27017`;
	
	const content = util_instance.fs.read_file(dotenv_path);
	const lines = content.split('\n');
	const new_lines = [];
	
	for(const line of lines){
		const splitted = line.split('=');
		if(
			splitted.length === 2
			&& typeof new_dot_env[splitted[0]] !== 'undefined'
			&& splitted[1] !== new_dot_env[splitted[0]]
		){
			new_lines.push(`#${line}`);
			new_lines.push(`${splitted[0]}=${new_dot_env[splitted[0]]}`);
		}else{
			new_lines.push(line);
		}
	}
	
	util_instance.fs.write_file(dotenv_path, new_lines.join('\n'));
	
}
