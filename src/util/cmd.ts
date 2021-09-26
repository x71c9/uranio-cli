/**
 * Util
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {urn_util} from 'urn-lib';

import * as output from '../output/';

import * as common from '../cmd/common';

import {
	abstract_repos,
	valid_repos,
	Repo,
	abstract_pacman,
	valid_pacman,
	PacMan,
	abstract_deploy,
	valid_deploy,
	Deploy,
	Options} from '../types';

import {conf, jsonfile_path} from '../conf/defaults';

export function merge_options(options:Partial<Options>):void{
	let k:keyof Options;
	for(k in conf){
		if(typeof k !== typeof undefined && urn_util.object.has_key(options,k)){
			(conf as any)[k] = options[k]; // TODO FIX THIS
		}
	}
}

export function read_rc_file()
		:void{
	if(!is_initialized()){
		let err =  `URANIO was not initialized yet.`;
		err += ` Please run "uranio init" in order to initialize the repo.`;
		output.error_log(err, 'init');
		process.exit(1);
	}else{
		const rcfile_path = `${conf.root}/${jsonfile_path}`;
		try{
			const rc_content = fs.readFileSync(rcfile_path, 'utf8');
			const rc_obj = urn_util.json.clean_parse(rc_content);
			set_repo(rc_obj.repo);
			conf.repo = rc_obj.repo;
			conf.pacman = rc_obj.pacman;
			conf.deploy = rc_obj.deploy;
		}catch(ex){
			output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
			process.exit(1);
		}
	}
}

export function is_initialized()
		:boolean{
	return (fs.existsSync(`${conf.root}/${jsonfile_path}`));
}

function _check_folder(folder_path:string)
		:boolean{
	const data = fs.readdirSync(folder_path);
	for(const file of data){
		if(file === 'package.json'){
			const package_json_path = `${folder_path}/${file}`;
			try{
				const content = fs.readFileSync(package_json_path,'utf8');
				const pack = urn_util.json.clean_parse(content);
				if(pack.name === 'urn-cli'){
					return false;
				}else if(pack.name === 'uranio'){
					const bld_path = `${folder_path}/urn-bld`;
					if(!fs.existsSync(bld_path)){
						return false;
					}
					conf.root = bld_path;
					return true;
				}
				conf.root = folder_path;
				return true;
			}catch(ex){
				output.error_log(`Invalid ${package_json_path}. ${ex.message}`, 'root');
				return false;
			}
		}
	}
	return false;
}

export function auto_set_project_root()
		:void{
	// output.start_loading('Getting project root...');
	let folder_path = process.cwd();
	while(!_check_folder(folder_path)){
		const arr_folder = folder_path.split('/');
		arr_folder.pop();
		folder_path = arr_folder.join('/');
		if(folder_path === '/' || arr_folder.length === 2){
			conf.filelog = false;
			let err_msg = `Cannot find project root.`;
			err_msg += ' Be sure to run `uranio` inside an NPM project.';
			output.wrong_end_log(err_msg);
			process.exit(1);
		}
	}
	common.init_log();
	output.done_verbose_log(`$URNROOT$Project root found [${conf.root}]`, 'root');
}

export function set_repo(repo:string)
		:void{
	if(check_repo(repo)){
		conf.repo = repo as Repo;
	}else{
		const valid_repos_str = valid_repos().join(', ');
		let end_log = '';
		end_log += `Wrong repo. `;
		end_log += `Repo must be one of the following [${valid_repos_str}]`;
		output.wrong_end_log(end_log);
		process.exit(1);
	}
}

export function set_pacman(pacman:string)
		:void{
	if(check_pacman(pacman)){
		conf.pacman = pacman as PacMan;
	}else{
		const valid_pacman_str = valid_pacman().join(', ');
		let end_log = '';
		end_log += `Wrong package manager. `;
		end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
		output.wrong_end_log(end_log);
		process.exit(1);
	}
}

export function set_deploy(deploy:string)
		:void{
	if(check_deploy(deploy)){
		conf.deploy = deploy as Deploy;
	}else{
		const valid_deploy_str = valid_deploy().join(', ');
		let end_log = '';
		end_log += `Wrong deploy value. `;
		end_log += `Deploy value must be one of the following [${valid_deploy_str}]`;
		output.wrong_end_log(end_log);
		process.exit(1);
	}
}

export function check_repo(repo:string)
		:boolean{
	return urn_util.object.has_key(abstract_repos, repo);
}

export function check_pacman(pacman:string)
		:boolean{
	return urn_util.object.has_key(abstract_pacman, pacman);
}

export function check_deploy(deploy:string)
		:boolean{
	return urn_util.object.has_key(abstract_deploy, deploy);
}

export async function install_dep(repo:string, context:string)
		:Promise<any>{
	const action = `installing dependencies [${repo}]`;
	output.verbose_log(`Started ${action}`, context);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.install[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function install_dep_dev(repo:string, context:string)
		:Promise<any>{
	const action = `installing dev dependencies [${repo}]`;
	output.verbose_log(`Started ${action}`, context);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.install_dev[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function uninstall_dep(repo:string, context:string)
		:Promise<any>{
	const action = `uninstalling dependencies [${repo}]`;
	output.verbose_log(`Started ${action}`, context);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.uninstall[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function clone_repo(context: string, address:string, dest_folder:string, branch='master')
		:Promise<any>{
	return await _clone_repo(context, address, dest_folder, branch);
}

export async function clone_repo_recursive(context: string, address:string, dest_folder:string, branch='master')
		:Promise<any>{
	return await _clone_repo(context, address, dest_folder, branch, true);
}

async function _clone_repo(context: string, address:string, dest_folder:string, branch='master', recursive=false)
		:Promise<any>{
	const action = `cloning repo [${address}]`;
	output.verbose_log(`Started ${action}`, context);
	return new Promise((resolve, reject) => {
		const branch_str = (branch !== 'master' && typeof branch === 'string') ?
			`-b ${branch} ` : '';
		let cmd = `git clone ${branch_str}${address} ${dest_folder} --progress`;
		cmd += (recursive === true) ? ` --recurse-submodules` : '';
		spawn_cmd(cmd, context, action, resolve, reject);
	});
}

export function dependency_exists(repo:string)
		:boolean{
	const package_json_path = `${conf.root}/package.json`;
	try{
		const data = fs.readFileSync(package_json_path, 'utf8');
		const package_data = urn_util.json.clean_parse(data);
		return (
			(package_data['dependencies'] && typeof package_data['dependencies'][repo] === 'string') ||
			(package_data['devDependencies'] && typeof package_data['devDependencies'][repo] === 'string')
		);
	}catch(ex){
		output.wrong_end_log(`Invalid ${package_json_path}. ${ex.message}`);
		process.exit(1);
	}
}

const _pacman_commands = {
	install: {
		npm(repo:string){
			return `npm i ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add ${repo} --verbose`;
		}
	},
	install_dev: {
		npm(repo:string){
			return `npm i --save-dev ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add --dev ${repo} --verbose`;
		}
	},
	uninstall: {
		npm(repo:string){
			return `npm uninstall ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn remove ${repo} --verbose`;
		}
	}
};


