/**
 * Docker command module
 *
 * @packageDocumentation
 */

import * as output from '../output/';

import * as util from '../util/';

import {default_params, defaults} from '../conf/defaults';

import {
	Params,
	Arguments,
	Repo,
	PacMan,
	Deploy,
	valid_deploy_repos
} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {
	merge_params,
	check_repo,
	check_pacman,
	check_deploy
} from './common';

let docker_params = default_params as Params;

type MainArgs = {
	repo: Repo,
	deploy: Deploy,
	pacman: PacMan
}

export async function docker(params:Partial<Params>, args:Arguments):Promise<void>{
	
	_init_params(params);
	
	switch(args._[1]){
		case 'build':{
			await _build(args);
			break;
		}
		case 'run':{
			await _run(args);
			break;
		}
		default:{
			output_instance.error_log(`Invalid docker command.`);
			process.exit(1);
		}
	}
}

function _init_params(params:Partial<Params>)
		:void{
	
	docker_params = merge_params(params);
	
	output_instance = output.create(docker_params);
	
	util_instance = util.create(docker_params, output_instance);
	
	// util_instance.must_be_initialized();
	
}

async function _run(args:Arguments):Promise<void>{
	
	const {repo, deploy} = _get_main_args(args);
	
	let cmd = '';
	cmd += `docker run --rm -i -v $(pwd)/src:/app/src --network="host" uranio-${repo}-${deploy}`;
	await _execute_verbose(cmd, 'docker', 'running');
	
	output_instance.done_log(`Docker image runned ${repo} ${deploy}`);
	
}

async function _build(args:Arguments):Promise<void>{
	
	const {repo, deploy, pacman} = _get_main_args(args);
	
	await _download_dockerfiles();
	
	// _ignore_docker_folder();
	
	let cmd = '';
	cmd += `docker build --ssh default -t uranio-${repo}-${deploy}`;
	cmd += ` -f ${docker_params.root}/${defaults.folder}/.docker/Dockerfile`;
	cmd += ` --build-arg repo=${repo}`;
	cmd += ` --build-arg deploy=${deploy}`;
	cmd += ` --build-arg pacman=${pacman}`;
	cmd += ` .`;
	await _execute_spin_verbose(cmd, 'docker', 'building');
	
	output_instance.done_log(`Docker image built ${repo} ${deploy}`);
	
}

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
	}
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
	
	const def_folder = `${docker_params.root}/${defaults.folder}`;
	if(!util_instance.fs.exists(def_folder)){
		util_instance.fs.create_directory(def_folder, 'docker');
	}
	
	const dest_folder = `${def_folder}/.docker`;
	if(!util_instance.fs.exists(dest_folder)){
		util_instance.fs.create_directory(dest_folder, 'docker');
	}
	
	const docker_file =
		`${docker_params.root}/${defaults.tmp_folder}/uranio-dot/docker/Dockerfile`;
	const dest = `${dest_folder}/Dockerfile`;
	util_instance.fs.copy_file(docker_file, dest, 'docker');
	
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

async function _execute_verbose(cmd:string, context:string, action:string){
	return new Promise((resolve, reject) => {
		util_instance.spawn.verbose_log(
			cmd,
			context,
			action,
			undefined,
			resolve,
			reject
		);
	});
}
