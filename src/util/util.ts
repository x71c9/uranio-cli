/**
 * Util
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import * as cp from 'child_process';

import chokidar from 'chokidar';

import prettier from 'prettier';

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
	Options} from '../types';

import {conf, jsonfile_path} from '../conf/defaults';

let user_exit =  false;

type WatchProcessObject = {
	child: chokidar.FSWatcher
	text: string,
	context: string
}

export const child_list:cp.ChildProcessWithoutNullStreams[] = [];

export const watch_child_list:WatchProcessObject[] = [];
	util.child_list.push(ntl_child);

process.on('SIGINT', function() {
	
	user_exit = true;
	
	process.stdout.write("\r--- Caught interrupt signal ---\n");
	
	for(let i = 0; i < watch_child_list.length; i++){
		const watch_child_object = watch_child_list[i];
		watch_child_object.child.close().then(() => {
			output.log(watch_child_object.context, `Stop ${watch_child_object.text}`);
		});
	}
	
	for(let i = 0; i < child_list.length; i++){
		const child = child_list[i];
		if(child.pid){
			process.kill(child.pid);
		}
	}
	
});

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
		const rcfile_path = `${conf.root}/${jsonfile_path}`;
		try{
			const rc_content = fs.readFileSync(rcfile_path, 'utf8');
			const rc_obj = urn_util.json.clean_parse(rc_content);
			set_repo(rc_obj.repo);
			conf.repo = rc_obj.repo;
			conf.pacman = rc_obj.pacman;
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

export function check_folder(folder_path:string)
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
				output.error_log(`root`, `Invalid ${package_json_path}. ${ex.message}`);
				return false;
			}
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
	common.init_log();
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

export function pretty(filepath:string, parser='typescript')
	:void{
	output.start_loading(`Prettier [${filepath}]...`);
	const content = fs.readFileSync(filepath, 'utf8');
	const pretty_string = prettier.format(
		content,
		{ useTabs: true, tabWidth: 2, parser: parser }
	);
	fs.writeFileSync(filepath, pretty_string);
	// cp.execSync(`npx prettier --write ${filepath} --use-tabs --tab-width 2`);
	output.done_verbose_log('prtt', `Prettier [${filepath}] done.`);
}

export function remove_folder_if_exists(context:string, folder_path:string)
		:void{
	if(fs.existsSync(folder_path)){
		output.start_loading(`Removing folder [${folder_path}]`);
		fs.rmdirSync(folder_path, {recursive: true});
		// sync_exec(`rm -rf ${folder_path}`);
		output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
	}
}

export function create_folder_if_doesnt_exists(context:string, folder_path:string)
		:void{
	if(!fs.existsSync(folder_path)){
		try{
			output.start_loading(`Creating folder [${folder_path}]`);
			fs.mkdirSync(folder_path);
			// sync_exec(`mkdir ${folder_path}`);
			output.done_verbose_log(context, `Folder [${folder_path}] created.`);
		}catch(ex){
			output.error_log(context, `Failed creating folder [${folder_path}]. ${ex.message}.`);
		}
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
	output.log(`exec`, `Executing ${command}`);
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
	const package_json_path = `${conf.root}/package.json`;
	try{
		const data = fs.readFileSync(package_json_path, 'utf8');
		const package_data = urn_util.json.clean_parse(data);
		return (
			typeof package_data['dependencies'][repo] === 'string' ||
			typeof package_data['devDependencies'][repo] === 'string'
		);
	}catch(ex){
		output.wrong_end_log(`Invalid ${package_json_path}. ${ex.message}`);
		process.exit(1);
	}
}

export function copy_file_sync(source:string, target:string):void {
	let target_file = target;
	if(fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
		target_file = path.join(target, path.basename(source));
	}
	fs.writeFileSync(target_file, fs.readFileSync(source));
	output.verbose_log('cp', `Copied file ${target_file}.`);
}

export function copy_folder_recursive_sync(source:string, target:string):void {
	let files = [];
	const target_folder = path.join(target, path.basename( source ));
	if(!fs.existsSync(target_folder)){
		fs.mkdirSync( target_folder );
	}
	if(fs.lstatSync(source).isDirectory()) {
		files = fs.readdirSync(source);
		files.forEach(function (file) {
			const cur_source = path.join(source, file);
			if(fs.lstatSync(cur_source).isDirectory()) {
				copy_folder_recursive_sync(cur_source, target_folder);
			}else if(!cur_source.endsWith('.swp')){
				copy_file_sync(cur_source, target_folder);
			}
		});
	}
}

export function delete_file_sync(file_path:string)
		:void{
	fs.unlinkSync(file_path);
	output.verbose_log('dl', `Deleted file ${file_path}.`);
}

function _clean_chunk(chunk:string){
	const plain_text = chunk
		.toString()
		.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
		.replace(/\r?\n|\r/g, ' ');
	return plain_text;
}

export function spawn_log_command(command:string, context:string, color:string)
		:cp.ChildProcessWithoutNullStreams{
	const splitted_command = command.split(' ');
	
	const spawned = cp.spawn(
		splitted_command[0],
		splitted_command.slice(1),
		// {stdio: [null, 'inherit', 'inherit']}
	);
	
	if(spawned.stdout){
		spawned.stdout.setEncoding('utf8');
		spawned.stdout.on('data', (chunk:string) => {
			const splitted_chunk = chunk.split('\n');
			for(const split of splitted_chunk){
				const plain_text = _clean_chunk(split);
				if(plain_text.includes('<error>')){
					output.error_log(context, plain_text);
					// process.stdout.write(chunk);
				}else if(plain_text != ''){
					output.verbose_log(context, plain_text, color);
				}
			}
		});
	}
	
	if(spawned.stderr){
		spawned.stderr.setEncoding('utf8');
		spawned.stderr.on('data', (chunk) => {
			const splitted_chunk = chunk.split('\n');
			for(const split of splitted_chunk){
				const plain_text = _clean_chunk(split);
				if(plain_text !== ''){
					output.error_log(context, plain_text);
				}
				// process.stdout.write(chunk);
				// process.stderr.write(`[${context}] ${chunk}`);
			}
		});
	}
	
	spawned.on('close', (code) => {
		switch(code){
			case 0:{
				output.verbose_log(context, `Closed.`, color);
				break;
			}
			default:{
				if(user_exit === false){
					output.error_log(context, `Child process exited with code ${code}`);
				}
			}
		}
	});
	
	spawned.on('error', (err) => {
		if(user_exit === false){
			output.error_log(context, `${err}`);
		}
	});
	
	child_list.push(spawned);
	
	return spawned;
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


