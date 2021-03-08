/**
 * Util
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as cp from 'child_process';

import * as output from '../log/';

import {valid_repos} from '../types';

import {defaults} from '../conf/defaults';

export function check_if_initialized()
		:void{
	const rc_file_path = `${global.uranio.root}/${defaults.rcfile_path}`;
	if(!fs.existsSync(rc_file_path)){
		let err =  `URANIO was not initialized yet.`;
		err += ` Please run "uranio init" in order to initialize the repo.`;
		output.error_log('init', err);
		process.exit(1);
	}else{
		const rc_content = fs.readFileSync(rc_file_path, 'utf8');
		const rc_obj = JSON.parse(rc_content);
		check_repo(rc_obj.repo);
		global.uranio.repo = rc_obj.repo;
	}
}

export function check_repo(repo:unknown)
		:void{
	switch(repo){
		case 'core':
		case 'web':{
			global.uranio.repo = repo;
			break;
		}
		default:{
			const valid_repos_str = valid_repos().join(', ');
			let end_log = '';
			end_log += `Wrong repo. `;
			end_log += `Repo must be one of the following [${valid_repos_str}]`;
			output.end_log(end_log);
			process.exit(1);
		}
	}
}

export function prettier(path:string)
	:void{
	output.start_loading(`Prettier [${path}]...`);
	cp.execSync(`npx prettier --write ${path} --use-tabs --tab-width 2`);
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
		spawn_cmd(`npm i ${repo} --verbose`, context, action, resolve, reject);
	});
}

export async function install_dep_dev(repo:string, context:string)
		:Promise<any>{
	const action = `installing dev dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		spawn_cmd(`npm i ${repo} --save-dev --verbose`, context, action, resolve, reject);
	});
}

export async function uninstall_dep(repo:string, context:string)
		:Promise<any>{
	const action = `uninstalling dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		spawn_cmd(`npm uninstall ${repo} --verbose`, context, action, resolve, reject);
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
		let cmd = `git clone ${address} ${global.uranio.root}/${dest_folder} --progress`;
		cmd += (recursive === true) ? ` --recurse-submodules` : '';
		spawn_cmd(cmd, context, action, resolve, reject);
	});
}
