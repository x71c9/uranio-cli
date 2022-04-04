/**
 * Docker command module
 *
 * @packageDocumentation
 */

import {urn_util} from 'urn-lib';

import * as output from '../output/index';

import * as util from '../util/index';

import {default_params, defaults} from '../conf/defaults';

import {Params, Arguments} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {merge_params} from './common';

let docker_params = default_params as Params;

let dot_folder = `./${defaults.folder}`;
// let init_filepath = `${dot_folder}/${defaults.init_filepath}`;
let docker_folder = `${dot_folder}/${defaults.docker_folder}`;

export async function docker(params:Partial<Params>, args:Arguments)
		:Promise<void>{
	
	_init_params(params);
	
	dot_folder = `${docker_params.root}/${defaults.folder}`;
	// init_filepath = `${dot_folder}/${defaults.init_filepath}`;
	docker_folder = `${dot_folder}/${defaults.docker_folder}`;
	
	switch(args._[1]){
		case 'build':{
			await build(docker_params);
			break;
		}
		case 'create':{
			await create(docker_params);
			break;
		}
		case 'start':{
			await start(docker_params);
			break;
		}
		case 'stop':{
			await stop(docker_params);
			break;
		}
		case 'remove':{
			await remove(docker_params);
			break;
		}
		case 'unbuild':{
			await unbuild(docker_params);
			break;
		}
		
		case 'db':{
			// const db = args._[3] as DB;
			// check_db(db);
			switch(args._[2]){
				case 'create':{
					await db_create(docker_params);
					break;
				}
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
						`Invalid uranio docker db command. Try [create, start, stop, remove]`
					);
					process.exit(1);
				}
			}
			break;
		}
		
		case 'network':{
			switch(args._[2]){
				case 'create':{
					await network_create(docker_params);
					break;
				}
				case 'remove':{
					await network_remove(docker_params);
					break;
				}
				default:{
					output_instance.error_log(
						`Invalid uranio docker network command. Try [create, remove]`
					);
					process.exit(1);
				}
			}
			break;
		}
		
		case 'prune':{
			await prune(docker_params);
			break;
		}
		
		case 'env':{
			switch(args._[2]){
				case 'update':{
					// await update_env(docker_params);
					break;
				}
				default:{
					output_instance.error_log(
						`Invalid uranio docker env command. Try [update]`
					);
					process.exit(1);
				}
			}
			break;
		}
		
		default:{
			output_instance.error_log(`Invalid uranio docker command.`);
			process.exit(1);
		}
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
	// cmd += ` --build-arg deploy=${docker_params.deploy}`;
	cmd += ` .`;
	await _execute_spin_verbose(cmd, 'docker', 'building');
	output_instance.done_log(
		`Docker image built ${image_name}`
	);
	
	await _copy_compiled();
	
}

export async function create(params:Partial<Params>, entrypoint?:string)
		:Promise<void>{
	
	_init_params(params);
	
	const container_name = `${_get_container_name()}`;
	const image_name = _get_image_name();
	
	// const dotenv = util_instance.cmd.read_dotenv();
	// const port_server = dotenv.URN_SERVICE_PORT;
	// const port_client = dotenv.URN_CLIENT_PORT;
	
	const toml = util_instance.cmd.read_toml();
	const port_server = toml.service_port || 777;
	const port_panel = toml.client_panel_port || 5454;
	const dev_port_server = toml.dev_service_port || port_server;
	const dev_port_panel = toml.client_dev_panel_port || port_panel;
	
	const network_name = _get_network_name();
	
	const toml_path = (docker_params.config[0] === '/') ?
		docker_params.config : `$(pwd)/${docker_params.config}`;
	
	let cmd = '';
	cmd += `docker create`;
	cmd += ` --network ${network_name}`;
	// cmd += ` -p ${port_server}:${port_server}`;
	// cmd += ` -p ${port_panel}:${port_panel}`;
	cmd += ` -p ${dev_port_server}:${dev_port_server}`;
	cmd += ` -p ${dev_port_panel}:${dev_port_panel}`;
	cmd += ` -v $(pwd)/src/:/app/src/`;
	cmd += ` -v $(pwd)/.env:/app/.env`;
	cmd += ` -v ${toml_path}:/app/uranio.toml`;
	cmd += ` -v $(pwd)/package.json:/app/package.json`;
	cmd += ` -v $(pwd)/node_modules/:/app/node_modules/`;
	// cmd += ` -v $(pwd)/.uranio/:/app/.uranio/`;
	cmd += ` --name ${container_name}`;
	if(typeof entrypoint === 'string'){
		cmd += ` --entrypoint="${entrypoint}"`;
	}
	cmd += ` ${image_name}`;
	await _execute_spin_verbose(cmd, 'docker', 'creating');
	
	output_instance.done_log(
		`Docker container created ${container_name}`
	);
}

export async function start(params:Partial<Params>):Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	let cmd = '';
	cmd += `docker start -i ${container_name}`;
	await _execute_log(cmd, 'docker', 'starting');
	output_instance.done_log(
		`Docker image started ${container_name}`
	);
}

export async function start_server(params:Partial<Params>):Promise<void>{
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

export async function start_panel(params:Partial<Params>):Promise<void>{
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

export async function stop(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const container_name = _get_container_name();
	let cmd = '';
	cmd += `docker stop ${container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await _execute_spin_verbose(cmd, 'docker', 'stopping');
	output_instance.done_log(
		`Docker container stopped ${container_name}`
	);
}

export async function remove(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const container_name = _get_container_name();
	let cmd = '';
	cmd += `docker rm ${container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await _execute_spin_verbose(cmd, 'docker', 'creating');
	output_instance.done_log(
		`Docker container removed ${container_name}`
	);
}

export async function unbuild(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const image_name = _get_image_name();
	let cmd = '';
	cmd += `docker image rm`;
	cmd += ` ${image_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await _execute_spin_verbose(cmd, 'docker', `removing image ${image_name}`);
	output_instance.done_log(
		`Docker image removed ${image_name}`
	);
}

export async function db_create(params:Partial<Params>)
		:Promise<void>{
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
	await _execute_spin_verbose(cmd, `docker`, `creating db ${docker_params.db}`);
	output_instance.done_log(
		`Docker db container created ${db_container_name}`
	);
}

export async function db_start(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	const db_container_name = _get_db_container_name();
	let cmd = '';
	cmd += `docker start ${db_container_name}`;
	await _execute_spin_verbose(cmd, `docker`, `starting db ${docker_params.db}`);
	output_instance.done_log(
		`Docker db container started ${db_container_name}`
	);
}

export async function db_stop(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const db_container_name = _get_db_container_name();
	let cmd = '';
	cmd += `docker stop ${db_container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await _execute_spin_verbose(cmd, `docker`, `stopping db ${docker_params.db}`);
	output_instance.done_log(
		`Docker db container stopped ${db_container_name}`
	);
}

export async function db_remove(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const db_container_name = _get_db_container_name();
	let cmd = '';
	cmd += `docker rm ${db_container_name}`;
	if(continue_on_fail){
		cmd += ` || true`;
	}
	await _execute_spin_verbose(cmd, `docker`, `removing db ${docker_params.db}`);
	output_instance.done_log(
		`Docker db container removed ${db_container_name}`
	);
}

export async function tmp_remove(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	
	let cmd_rm = '';
	cmd_rm += `docker rm tmp_${container_name}`;
	if(continue_on_fail){
		cmd_rm += ` || true`;
	}
	await _execute_spin_verbose(cmd_rm, 'docker', `removing tmp container tmp_${container_name}`);
	output_instance.done_log(
		`Docker removed tmp container tmp_${container_name}`
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
	await _execute_spin_verbose(cmd_rm, 'docker', `creating network ${network_name}`);
	output_instance.done_log(
		`Docker created network ${network_name}`
	);
}

export async function network_remove(params:Partial<Params>, continue_on_fail=false):Promise<void>{
	_init_params(params);
	const network_name = _get_network_name();
	let cmd_rm = '';
	cmd_rm += `docker network remove ${network_name}`;
	if(continue_on_fail){
		cmd_rm += ` || true`;
	}
	await _execute_spin_verbose(cmd_rm, 'docker', `creating network ${network_name}`);
	output_instance.done_log(
		`Docker removed network ${network_name}`
	);
}

export async function prune(params:Partial<Params>, continue_on_fail=false)
		:Promise<void>{
	_init_params(params);
	const project_name = _get_project_name();
	let cmd_prune = '';
	cmd_prune += `docker builder prune -af --filter "label=project=${project_name}"`;
	if(continue_on_fail){
		cmd_prune += ` || true`;
	}
	await _execute_spin_verbose(cmd_prune, 'docker', `deleteing builder cache`);
	output_instance.done_log(
		`Docker builder cache deleted.`
	);
}

async function _copy_compiled(){
	const image_name = _get_image_name();
	const container_name = _get_container_name();
	let cmd_create = '';
	cmd_create += `docker create --name tmp_${container_name} ${image_name}`;
	await _execute_spin_verbose(cmd_create, 'docker', `creating tmp container tmp_${container_name}`);
	let cmd_cp_node = '';
	cmd_cp_node += `docker cp tmp_${container_name}:/app/node_modules node_modules`;
	await _execute_spin_verbose(cmd_cp_node, 'docker', `copying node_modules from tmp container tmp_${container_name}`);
	// let cmd_cp_uranio = '';
	// cmd_cp_uranio += `docker cp tmp_${container_name}:/app/.uranio/. .uranio/`;
	// await _execute_spin_verbose(cmd_cp_uranio, 'docker', `copying .uranio from tmp container tmp_${container_name}`);
	let cmd_remove = '';
	cmd_remove += `docker rm tmp_${container_name}`;
	await _execute_spin_verbose(cmd_remove, 'docker', `removing tmp container tmp_${container_name}`);
	output_instance.done_log(
		`Docker copied files from tmp container tmp_${container_name}`
	);
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
function _get_container_name(){
	const project_name = _get_project_name();
	const container_name = `${project_name}_uranio_con`;
	return container_name;
}
function _get_network_name(){
	const project_name = _get_project_name();
	const network_name = `${project_name}_uranio_net`;
	return network_name;
}
function _get_db_container_name(){
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
	util_instance.fs.remove_directory(defaults.tmp_folder, 'assets');
	util_instance.fs.create_directory(defaults.tmp_folder, 'assets');
	await util_instance.cmd.clone_repo(
		defaults.assets_repo,
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets`,
		'assets',
		docker_params.branch
	);
	output_instance.done_log(`Cloned assets repo.`, 'assets');
}

async function _download_dockerfiles(){
	
	await _clone_assets();
	
	// const def_folder = `${docker_params.root}/${defaults.folder}`;
	// const dest_folder = `${def_folder}/${defaults.docker_folder}`;
	
	if(!util_instance.fs.exists(docker_folder)){
		util_instance.fs.create_directory(docker_folder, 'docker');
	}
	
	const docker_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/Dockerfile`;
	const dest = `${docker_folder}/Dockerfile`;
	util_instance.fs.copy_file(docker_file, dest, 'docker');
	
	const dockerignore_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.dockerignore`;
	const ignore_dest = `${docker_folder}/.dockerignore`;
	util_instance.fs.copy_file(dockerignore_file, ignore_dest, 'docker');
	
	const docker_bash =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.bash_docker`;
	const bash_dest = `${docker_folder}/.bash_docker`;
	util_instance.fs.copy_file(docker_bash, bash_dest, 'docker');
	
	_remove_tmp();
	
}

function _remove_tmp(){
	output_instance.start_loading(
		`Removing tmp folder [${defaults.tmp_folder}]...`
	);
	util_instance.fs.remove_directory(
		`${docker_params.root}/${defaults.tmp_folder}`,
		'tmp'
	);
	output_instance.done_verbose_log(
		`Removed tmp folder [${defaults.tmp_folder}].`,
		'tmp'
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

async function _execute_spin_verbose(cmd:string, context:string, action:string){
	return new Promise((resolve, reject) => {
		util_instance.spawn.spin_and_verbose_log(
			cmd,
			context,
			action,
			undefined,
			resolve,
			reject
		);
	});
}

async function _execute_log(cmd:string, context:string, action:string){
	return new Promise((resolve, reject) => {
		util_instance.spawn.log(
			cmd,
			context,
			action,
			undefined,
			resolve,
			reject
		);
	});
}

type DotEnv = {
	[k:string]: string
}

export function update_env(params?:Partial<Params>):void{
	
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
		`mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_TRASH_CONNECTION'] =
		`mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_LOG_CONNECTION'] =
		`mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	
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
