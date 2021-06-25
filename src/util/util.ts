/**
 * Util
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as cp from 'child_process';

import prettier from 'prettier';

import {urn_util} from 'urn-lib';

import * as output from '../log/';

import {
	abstract_repos,
	valid_repos,
	Repo,
	abstract_pacman,
	valid_pacman,
	PacMan,
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
		output.error_log('init', err);
		process.exit(1);
	}else{
		const rc_content = fs.readFileSync(`${conf.root}/${jsonfile_path}`, 'utf8');
		const rc_obj = JSON.parse(rc_content);
		set_repo(rc_obj.repo);
		conf.repo = rc_obj.repo;
	}
}

export function is_initialized()
		:boolean{
	return (fs.existsSync(`${conf.root}/${jsonfile_path}`));
}

export function check_folder(folder_path:string)
		:boolean{
	const data = fs.readdirSync(folder_path);
	for(const file of data){
		if(file === 'package.json'){
			const content = fs.readFileSync(`${folder_path}/${file}`,'utf8');
			const pack = JSON.parse(content);
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
		}
	}
	return false;
}

export function auto_set_project_root()
		:void{
	output.start_loading('Getting project root...');
	let folder_path = process.cwd();
	while(!check_folder(folder_path)){
		const arr_folder = folder_path.split('/');
		arr_folder.pop();
		folder_path = arr_folder.join('/');
		if(folder_path === '/'){
			throw new Error('Cannot find project root.');
		}
	}
	output.done_verbose_log('root', `$URNROOT$Project root found [${conf.root}]`);
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

export function check_repo(repo:string)
		:boolean{
	return urn_util.object.has_key(abstract_repos, repo);
}

export function check_pacman(pacman:string)
		:boolean{
	return urn_util.object.has_key(abstract_pacman, pacman);
}

export function pretty(path:string, parser='typescript')
	:void{
	output.start_loading(`Prettier [${path}]...`);
	const content = fs.readFileSync(path, 'utf8');
	const pretty_string = prettier.format(
		content,
		{ useTabs: true, tabWidth: 2, parser: parser }
	);
	fs.writeFileSync(path, pretty_string);
	// cp.execSync(`npx prettier --write ${path} --use-tabs --tab-width 2`);
	output.done_verbose_log('prtt', `Prettier [${path}] done.`);
}

export function remove_folder_if_exists(context:string, folder_path:string)
		:void{
	if(fs.existsSync(folder_path)){
		output.start_loading(`Removing folder [${folder_path}]`);
		sync_exec(`rm -rf ${folder_path}`);
		output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
	}
}

export function create_folder_if_doesnt_exists(context:string, folder_path:string)
		:void{
	if(!fs.existsSync(folder_path)){
		output.start_loading(`Creating folder [${folder_path}]`);
		sync_exec(`mkdir ${folder_path}`);
		output.done_verbose_log(context, `Folder [${folder_path}] created.`);
	}
}

export function copy_files(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying files [${source}] to [${destination}]...`);
	sync_exec(`cp -rf -t ${destination} ${source}`,);
	output.done_verbose_log(context, `Copied files [${source}] to [${destination}]`);
}

export function copy_file(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying file [${source}] to [${destination}]...`);
	sync_exec(`cp ${source} ${destination}`);
	output.done_verbose_log(context, `Copied file [${source}] to [${destination}]`);
}

export function copy_folder(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying folder [${source}] to [${destination}]...`);
	sync_exec(`cp -rf ${source} ${destination}`);
	output.done_verbose_log(context, `Copied folder [${source}] to [${destination}]`);
}

export function relative_to_absolute_path(path:string)
		:string{
	if(path[path.length-1] === '/'){
		path = path.substr(0,path.length-1);
	}
	if(path[0] !== '/'){
		if(path.substr(0,2) === './'){
			path = path.substr(2);
		}
		path = `${conf.root}/${path}`;
	}
	return path;
}

export function sync_exec(command:string)
		:void{
	cp.execSync(command);
}

type PF = (v?:unknown) => void;

export function spawn_cmd(command:string, context:string, action:string, resolve:PF, reject:PF)
		:void{
	
	output.start_loading(`${action}...`);
	
	const splitted_command = command.split(' ');
	const first_command = splitted_command[0];
	splitted_command.shift();
	
	const child = cp.spawn(first_command, splitted_command);
	
	output.verbose_log(context, command);
	
	if(child.stdout){
		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk) => {
			const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
			output.spinner_text(plain_text);
		});
	}
	
	if(child.stderr){
		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk) => {
			const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
			output.spinner_text(plain_text);
		});
	}
	
	child.on('close', (code) => {
		switch(code){
			case 0:{
				output.done_verbose_log(context, `Done ${action}`);
				return resolve(true);
			}
			default:{
				output.error_log(context, `Child process exited with code ${code}`);
				return reject(false);
			}
		}
	});
	
	child.on('error', (err) => {
		output.error_log(context, `${err}`);
		return reject(false);
	});
	
}

export async function install_dep(repo:string, context:string)
		:Promise<any>{
	const action = `installing dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.install[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function install_dep_dev(repo:string, context:string)
		:Promise<any>{
	const action = `installing dev dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.install_dev[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function uninstall_dep(repo:string, context:string)
		:Promise<any>{
	const action = `uninstalling dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		spawn_cmd(_pacman_commands.uninstall[conf.pacman](repo), context, action, resolve, reject);
	});
}

export async function clone_repo(context: string, address:string, dest_folder:string)
		:Promise<any>{
	return await _clone_repo(context, address, dest_folder);
}

export async function clone_repo_recursive(context: string, address:string, dest_folder:string)
		:Promise<any>{
	return await _clone_repo(context, address, dest_folder, true);
}

async function _clone_repo(context: string, address:string, dest_folder:string, recursive=false)
		:Promise<any>{
	const action = `cloning repo [${address}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		let cmd = `git clone ${address} ${dest_folder} --progress`;
		cmd += (recursive === true) ? ` --recurse-submodules` : '';
		spawn_cmd(cmd, context, action, resolve, reject);
	});
}

export function dependency_exists(repo:string)
		:boolean{
	const data = fs.readFileSync(`${conf.root}/package.json`, 'utf8');
	const package_data = JSON.parse(data);
	return (
		typeof package_data['dependencies'][repo] === 'string' ||
		typeof package_data['devDependencies'][repo] === 'string'
	);
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


