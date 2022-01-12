/**
 * Docker command module
 *
 * @packageDocumentation
 */

import {urn_util} from 'urn-lib';

import * as output from '../output/';

import * as util from '../util/';

import {default_params, defaults} from '../conf/defaults';

import {
	Params,
	Arguments,
} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {
	merge_params,
} from './common';

let docker_params = default_params as Params;

export async function docker(params:Partial<Params>, args:Arguments)
		:Promise<void>{
	
	_init_params(params);
	
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
			}
			break;
		}
		case 'prune':{
			await prune(docker_params);
			break;
		}
		default:{
			output_instance.error_log(`Invalid docker command.`);
			process.exit(1);
		}
	}
}

export async function build(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	await _download_dockerfiles();
	
	const image_name = _get_image_name();
	let cmd = '';
	cmd += `docker build --ssh default`;
	cmd += ` -t ${image_name}`;
	cmd += ` -f ${docker_params.root}/${defaults.folder}/${defaults.docker_folder}/Dockerfile`;
	cmd += ` --build-arg repo=${docker_params.repo}`;
	cmd += ` --build-arg deploy=${docker_params.deploy}`;
	cmd += ` .`;
	await _execute_spin_verbose(cmd, 'docker', 'building');
	output_instance.done_log(
		`Docker image built ${image_name}`
	);
	
	await network_create(docker_params);
	await _copy_compiled();
	await create(docker_params);
	
}

export async function create(params:Partial<Params>, entrypoint?:string)
		:Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	const image_name = _get_image_name();
	
	const port_server = 7777;
	const port_client = 4444;
	
	const network_name = _get_network_name();
	
	let cmd = '';
	cmd += `docker create`;
	cmd += ` --network ${network_name}`;
	cmd += ` -p ${port_server}:${port_server} -p ${port_client}:${port_client}`;
	cmd += ` -v $(pwd)/src/:/app/src/`;
	cmd += ` -v $(pwd)/.env:/app/.env`;
	cmd += ` -v $(pwd)/package.json:/app/package.json`;
	cmd += ` -v $(pwd)/node_modules/:/app/node_modules/`;
	cmd += ` -v $(pwd)/.uranio/:/app/.uranio/`;
	cmd += ` --name ${container_name}`;
	cmd += ` ${image_name}`;
	if(typeof entrypoint === 'string'){
		cmd += ` --entrypoint="${entrypoint}"`;
	}
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
	let cmd_prune = '';
	cmd_prune += `docker builder prune -af`;
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
	let cmd_cp_uranio = '';
	cmd_cp_uranio += `docker cp tmp_${container_name}:/app/.uranio/. .uranio/`;
	await _execute_spin_verbose(cmd_cp_uranio, 'docker', `copying .uranio from tmp container tmp_${container_name}`);
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
	
	const def_folder = `${docker_params.root}/${defaults.folder}`;
	const dest_folder = `${def_folder}/${defaults.docker_folder}`;
	if(!util_instance.fs.exists(dest_folder)){
		util_instance.fs.create_directory(dest_folder, 'docker');
	}
	
	const docker_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/Dockerfile`;
	const dest = `${dest_folder}/Dockerfile`;
	util_instance.fs.copy_file(docker_file, dest, 'docker');
	
	const dockerignore_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.dockerignore`;
	const ignore_dest = `${dest_folder}/.dockerignore`;
	util_instance.fs.copy_file(dockerignore_file, ignore_dest, 'docker');
	
	const docker_bash =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-assets/docker/.bash_docker`;
	const bash_dest = `${dest_folder}/.bash_docker`;
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

export function update_env():void{
	const dot_env = util_instance.cmd.read_dotenv();
	const new_dot_env:DotEnv = {};
	let comments = ``;
	for(const [key, value] of Object.entries(dot_env)){
		if(
			key === 'URN_MONGO_MAIN_CONNECTION'
			|| key === 'URN_MONGO_LOG_CONNECTION'
			|| key === 'URN_MONGO_TRASH_CONNECTION'
		){
			comments += `#${key}=${value}\n`;
		}else if(typeof key === 'string' && key !== ''){
			new_dot_env[key] = value;
		}
	}
	new_dot_env['URN_MONGO_MAIN_CONNECTION'] = `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_TRASH_CONNECTION'] = `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	new_dot_env['URN_MONGO_LOG_CONNECTION'] = `mongodb://${_get_db_container_name()}.${_get_network_name()}:27017`;
	util_instance.cmd.write_dotenv(new_dot_env);
	const env_filepath = `${docker_params.root}/.env`;
	let env_content = util_instance.fs.read_file(env_filepath);
	env_content += comments;
	util_instance.fs.write_file(env_filepath, env_content);
}
