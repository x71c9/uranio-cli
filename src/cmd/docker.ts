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
	Repo,
	PacMan,
	Deploy,
	DB,
	valid_deploy_repos
} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {
	merge_params,
	check_repo,
	check_pacman,
	check_deploy,
	check_db
} from './common';

let docker_params = default_params as Params;

type MainArgs = {
	repo: Repo,
	deploy: Deploy,
	pacman: PacMan
}

function _get_and_set_main_args(args:Arguments){
	const {repo, deploy, pacman} = _get_main_args(args);
	docker_params.repo = repo;
	docker_params.deploy = deploy;
	docker_params.pacman = pacman;
	
}
export async function docker(params:Partial<Params>, args:Arguments):Promise<void>{
	
	_init_params(params);
	
	switch(args._[1]){
		case 'build':{
			_get_and_set_main_args(args);
			await docker_build(docker_params);
			break;
		}
		case 'create':{
			_get_and_set_main_args(args);
			await docker_create(docker_params);
			break;
		}
		case 'start':{
			_get_and_set_main_args(args);
			await docker_start(docker_params);
			break;
		}
		case 'stop':{
			_get_and_set_main_args(args);
			await docker_stop(docker_params);
			break;
		}
		case 'run':{
			_get_and_set_main_args(args);
			await docker_run(docker_params);
			break;
		}
		case 'remove':{
			_get_and_set_main_args(args);
			await docker_remove(docker_params);
			break;
		}
		case 'db':{
			
			const db = args._[3] as DB;
			check_db(db);
			
			switch(args._[2]){
				case 'run':{
					await docker_db_run(docker_params, db);
					break;
				}
				case 'create':{
					await docker_db_create(docker_params, db);
					break;
				}
				case 'start':{
					await docker_db_start(docker_params, db);
					break;
				}
				case 'stop':{
					await docker_db_stop(docker_params, db);
					break;
				}
			}
			break;
		}
		default:{
			output_instance.error_log(`Invalid docker command.`);
			process.exit(1);
		}
	}
}

export async function docker_build(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	await _download_dockerfiles();
	
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
	await _execute_spin_verbose(cmd, 'docker', 'building');
	
	output_instance.done_log(
		`Docker image built ${docker_params.repo} ${docker_params.deploy}`
	);
	
	await docker_create(docker_params);
	
}

export async function docker_unbuild(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	const image_name = _get_image_name();
	
	let cmd = '';
	cmd += `docker image rm`;
	cmd += ` ${image_name}`;
	cmd += ` || true`;
	await _execute_spin_verbose(cmd, 'docker', `removing image ${image_name}`);
	
	output_instance.done_log(
		`Docker image removed ${image_name}`
	);
	
}

export async function docker_create(params:Partial<Params>, entrypoint?:string)
		:Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	const image_name = _get_image_name();
	
	let cmd = '';
	// cmd += `docker create -v $(pwd):/app -v /app/node_modules --network="host"`;
	cmd += `docker create -v $(pwd):/app --network="host"`;
	cmd += ` --name ${container_name}`;
	cmd += ` ${image_name}`;
	if(typeof entrypoint === 'string'){
		cmd += ` --entrypoint ${entrypoint}`;
	}
	await _execute_log(cmd, 'docker', 'creating');
	
	output_instance.done_log(
		`Docker container created ${container_name}`
	);
	
}

export async function docker_remove(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	
	let cmd = '';
	cmd += `docker container rm ${container_name}`;
	cmd += ` || true`;
	await _execute_spin_verbose(cmd, 'docker', 'creating');
	
	output_instance.done_log(
		`Docker container removed ${container_name}`
	);
	
}

export async function docker_start(params:Partial<Params>):Promise<void>{
	
	_init_params(params);

	const container_name = _get_container_name();
	
	let cmd = '';
	cmd += `docker start -i ${container_name}`;
	await _execute_log(cmd, 'docker', 'starting');
	
	output_instance.done_log(
		`Docker image started ${docker_params.repo} ${docker_params.deploy}`
	);
	
}

export async function docker_stop(params:Partial<Params>):Promise<void>{
	
	_init_params(params);
	
	const container_name = _get_container_name();
	
	let cmd = '';
	cmd += `docker stop ${container_name}`;
	cmd += ` || true`;
	await _execute_log(cmd, 'docker', 'stopping');
	
	output_instance.done_log(
		`Docker image stopped ${docker_params.repo} ${docker_params.deploy}`
	);
	
}

export async function docker_db_run(params:Partial<Params>, db:DB)
		:Promise<void>{
	
	_init_params(params);
	
	const db_container_name = _get_db_container_name(db);
	
	let cmd = '';
	cmd += `docker run --rm -i --name ${db_container_name}`;
	cmd += ` -v ~/mongo/data:/data/db --network="host"`;
	cmd += ` mongo:5`;
	await _execute_log(cmd, 'docker db', 'running db');
	
	output_instance.done_log(
		`Docker db container running ${db_container_name}`
	);
	
}

export async function docker_db_create(params:Partial<Params>, db:DB)
		:Promise<void>{
	
	_init_params(params);
	
	const db_container_name = _get_db_container_name(db);
	
	let cmd = '';
	cmd += `docker create --name ${db_container_name}`;
	cmd += ` -v ~/mongo/data:/data/db --network="host"`;
	cmd += ` mongo:5`;
	await _execute_spin_verbose(cmd, `docker`, `creating db ${db}`);
	
	output_instance.done_log(
		`Docker db container created ${db_container_name}`
	);
	
}

export async function docker_db_start(params:Partial<Params>, db:DB)
		:Promise<void>{
	
	_init_params(params);
	
	const db_container_name = _get_db_container_name(db);
	
	let cmd = '';
	cmd += `docker start ${db_container_name}`;
	await _execute_spin_verbose(cmd, `docker`, `starting db ${db}`);
	
	output_instance.done_log(
		`Docker db container started ${db_container_name}`
	);
	
}

export async function docker_db_stop(params:Partial<Params>, db:DB)
		:Promise<void>{
	
	_init_params(params);
	
	const db_container_name = _get_db_container_name(db);
	
	let cmd = '';
	cmd += `docker stop ${db_container_name}`;
	cmd += ` || true`;
	await _execute_spin_verbose(cmd, `docker`, `stopping db ${db}`);
	
	output_instance.done_log(
		`Docker db container stopped ${db_container_name}`
	);
	
}

export async function docker_db_remove(params:Partial<Params>, db:DB)
		:Promise<void>{
	
	_init_params(params);
	
	const db_container_name = _get_db_container_name(db);
	
	let cmd = '';
	cmd += `docker container rm ${db_container_name}`;
	cmd += ` || true`;
	await _execute_spin_verbose(cmd, `docker`, `removing db ${db}`);
	
	output_instance.done_log(
		`Docker db container removed ${db_container_name}`
	);
	
}

export async function docker_run(params:Partial<Params>, entrypoint?:string)
		:Promise<void>{
	
	_init_params(params);
	
	let cmd = '';
	cmd += `docker run --rm -i -v $(pwd)/src:/app/src --network="host"`;
	cmd += ` --name uranio_${docker_params.repo}_${docker_params.deploy}_container`;
	cmd += ` uranio-${docker_params.repo}-${docker_params.deploy}`;
	if(typeof entrypoint === 'string'){
		cmd += ` --entrypoint ${entrypoint}`;
	}
	await _execute_log(cmd, 'docker', 'running');
	
	output_instance.done_log(
		`Docker image runned ${docker_params.repo} ${docker_params.deploy}`
	);
	
}

function _get_image_name(){
	const project_name = _get_project_name();
	const image_name = `${project_name}-uranio-${docker_params.repo}-${docker_params.deploy}-image`;
	return image_name;
}

function _get_db_container_name(db:DB){
	const db_container_name = `${db}_${_get_container_name()}`;
	return db_container_name;
}

function _get_container_name(){
	const project_name = _get_project_name();
	const container_name = `${project_name}_uranio_${docker_params.repo}_${docker_params.deploy}_container`;
	return container_name;
}

function _get_project_name(){
	const package_json_path = `${docker_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	const package_data = urn_util.json.clean_parse(data);
	return package_data['name'] || 'uranio-project-001';
}

function _init_params(params:Partial<Params>)
		:void{
	
	docker_params = merge_params(params);
	
	output_instance = output.create(docker_params);
	
	util_instance = util.create(docker_params, output_instance);
	
	util_instance.must_be_docker_initialized();
	
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

function _get_main_args(args:Arguments):MainArgs{
	let repo = (args._[2]) as Repo;
	if(typeof repo === 'undefined' && typeof args.repo === 'string'){
		repo = args.repo as Repo;
	}
	let deploy = (args._[3] || 'express') as Deploy;
	if(typeof deploy === 'undefined' && typeof args.deploy === 'string'){
		deploy = args.deploy as Deploy;
	}
	let pacman = (args._[4] || 'yarn') as PacMan;
	if(typeof pacman === 'undefined' && typeof args.pacman === 'string'){
		pacman = args.pacman as PacMan;
	}
	
	// const branch = (args._[5] || 'master');
	
	output_instance.log(`Selected repo: ${repo}`, `args`);
	output_instance.log(`Selected pacman: ${pacman}`, `args`);
	if(valid_deploy_repos().includes(repo)){
		output_instance.log(`Selected deploy: ${deploy}`, `args`);
	}
	
	check_repo(repo);
	check_pacman(pacman);
	check_deploy(deploy);
	
	return {
		repo,
		pacman,
		deploy
	};
}

async function _clone_dot(){
	output_instance.start_loading(`Cloning dot...`);
	util_instance.fs.remove_directory(defaults.tmp_folder, 'dot');
	util_instance.fs.create_directory(defaults.tmp_folder, 'dot');
	await util_instance.cmd.clone_repo(
		defaults.dot_repo,
		`${docker_params.root}/${defaults.tmp_folder}/uranio-dot`,
		'dot',
		docker_params.branch
	);
	output_instance.done_log(`Cloned dot repo.`, 'dot');
}

async function _download_dockerfiles(){
	
	await _clone_dot();
	
	const def_folder = `${docker_params.root}`;
	const dest_folder = `${def_folder}`;
	if(!util_instance.fs.exists(dest_folder)){
		util_instance.fs.create_directory(dest_folder, 'docker');
	}
	
	const docker_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-dot/docker/Dockerfile`;
	const dest = `${dest_folder}/Dockerfile`;
	util_instance.fs.copy_file(docker_file, dest, 'docker');
	
	const dockerignore_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-dot/docker/.dockerignore`;
	const ignore_dest = `${dest_folder}/.dockerignore`;
	util_instance.fs.copy_file(dockerignore_file, ignore_dest, 'docker');
	
	const docker_bash =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-dot/docker/.bash_docker`;
	const bash_dest = `${dest_folder}/.bash_docker`;
	util_instance.fs.copy_file(docker_bash, bash_dest, 'docker');
	
	_remove_tmp();
	
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

async function _execute_spin_verbose(cmd:string, context:string, action:string){
	// output_instance.debug_log(cmd, 'docker');
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
	// output_instance.debug_log(cmd, 'docker');
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
