/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as cp from 'child_process';

import {Arguments, Repo, valid_repos} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		title();
		
		output.start_loading('Initialization...');
		
		const repo = args.r || args.repo || defaults.default_repo;
		
		_check_repo(repo);
		
		// TODO only in production _copy_tsconfig_file();
		
		_update_aliases(repo);
		
		_create_src_dist_folders();
		
		_create_urn_folder();
		
		// _copy_book_file();
		
		// _copy_types_file();
		
		_copy_eslint_files();
		
		await _clone_and_install_repo(repo);
		
		output.end_log(`Initialization completed.`);
		
		// process.exit(1);
		
	}
	
};

function _check_repo(repo:Repo){
	switch(repo){
		case 'core':
		case 'web':{
			break;
		}
		default:{
			output.end_log(`Wrong repo. Repo must be one of the following [${valid_repos().join(', ')}]`);
			process.exit(1);
		}
	}
}

async function _clone_and_install_repo(repo:Repo){
	output.start_loading(`Cloning and intalling [${repo}]...`);
	switch(repo){
		case 'core':{
			await _clone_core();
			await _uninstall_core_dep();
			await _install_core_dep();
			break;
		}
		case 'web':{
			await _clone_core();
			await _clone_web();
			await _uninstall_web_dep();
			await _install_web_dep();
			break;
		}
		default:{
			output.log('init', `Selected repo is not valid. [${repo}]`);
			process.exit(1);
		}
	}
	output.done_log('repo', `Cloned and installed repo [${repo}].`);
}

function _create_urn_folder(){
	output.start_loading(`Creating ${defaults.folder} folder...`);
	_remove_folder_if_exists('init', defaults.folder);
	_create_folder_if_doesnt_exists('init', defaults.folder);
	output.done_log('init', `Created folder ${defaults.folder}.`);
}

function _create_src_dist_folders(){
	output.start_loading(`Creating src and dist folders...`);
	_create_folder_if_doesnt_exists('init', 'src');
	_create_folder_if_doesnt_exists('init', 'dist');
	output.done_log('init', `Created folders src and dist.`);
}

// function _copy_book_file(){
//   output.start_loading(`Copying book file...`);
//   _copy_file('init', './src/files/book.ts', `./${defaults.folder}/book.ts`);
//   output.done_log('init', `Copied book file.`);
// }

// function _copy_types_file(){
//   output.start_loading(`Copying types file...`);
//   _copy_file('init', './src/files/types.ts', `./${defaults.folder}/types.ts`);
//   output.done_log('init', `Copied types file.`);
// }

function _update_aliases(repo:Repo){
	output.start_loading('Updating aliases...');
	const data = fs.readFileSync('./package.json', 'utf8');
	const package_data = JSON.parse(data);
	package_data['_moduleAliases'] = {
		urn_book: `./dist/${defaults.folder}/book.js`,
		urn_core: `./dist/${defaults.folder}/urn-core/`,
		uranio: `./dist/${defaults.folder}/urn-core/`
	};
	if(repo === 'web'){
		package_data['_moduleAliases']['urn_web'] = `./dist/${defaults.folder}/urn-web/`;
		package_data['_moduleAliases']['uranio'] = `./dist/${defaults.folder}/urn-web/`;
	}
	fs.writeFileSync('./package.json', JSON.stringify(package_data, null, '\t'));
	output.done_log('alas', `Aliases updated.`);
}

// function _copy_tsconfig_file(){
//   _copy_file('./src/files/tsconfig.json', './tsconfig.json');
//   output.done_log('tsco', `Copied tsconfig file.`);
// }

function _copy_eslint_files(){
	output.start_loading(`Copying eslint files...`);
	_copy_files('init', './src/files/.eslintrc.js ./src/files/.eslintignore', '.');
	output.done_log('esln', `Copied eslint files.`);
}

async function _install_core_dep(){
	output.start_loading(`Installing core dep...`);
	await _install_dep(defaults.core_dep_repo, 'core');
	await _install_dep_dev(defaults.core_dep_dev_repo, 'core');
	output.done_log('core', `Installed core dependencies.`);
	return true;
}

async function _install_web_dep(){
	output.start_loading(`Installing web dep...`);
	await _install_dep(defaults.web_dep_repo, 'web_');
	await _install_dep_dev(defaults.web_dep_dev_repo, 'web_');
	output.done_log('web', `Installed web dependencies.`);
	return true;
}

async function _uninstall_core_dep(){
	output.start_loading(`Uninstalling core dep...`);
	const dep_folder = `./node_modules/${defaults.core_dep_repo}`;
	_remove_folder_if_exists('core', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.core_dep_dev_repo}`;
	_remove_folder_if_exists('core', dep_dev_folder);
	await _uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	output.done_log('core', `Uninstalled core dependencies.`);
	return true;
}

async function _uninstall_web_dep(){
	output.start_loading(`Uninstalling web dep...`);
	const dep_folder = `./node_modules/${defaults.web_dep_repo}`;
	_remove_folder_if_exists('web_', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.web_dep_dev_repo}`;
	_remove_folder_if_exists('web_', dep_dev_folder);
	await _uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
	output.done_log('web', `Uninstalled web dependencies.`);
	return true;
}

async function _clone_core(){
	output.start_loading(`Cloning core...`);
	await _clone_repo('core', defaults.core_repo, 'urn-core');
	output.done_log('core', `Cloned core repo.`);
}

async function _clone_web(){
	output.start_loading(`Cloning web...`);
	await _clone_repo('web_', defaults.web_repo, 'urn-web');
	output.done_log('web', `Cloned web repo.`);
}



async function _install_dep(repo:string, context:string){
	const action = `installing dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		_spawn_cmd(`npm i ${repo} --verbose`, context, action, resolve, reject);
	});
}

async function _install_dep_dev(repo:string, context:string){
	const action = `installing dev dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		_spawn_cmd(`npm i ${repo} --save-dev --verbose`, context, action, resolve, reject);
	});
}

async function _uninstall_dep(repo:string, context:string){
	const action = `uninstalling dependencies [${repo}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		_spawn_cmd(`npm uninstall ${repo} --verbose`, context, action, resolve, reject);
	});
}

async function _clone_repo(context: string, address:string, dest_folder:string){
	const action = `cloning repo [${address}]`;
	output.verbose_log(context, `Started ${action}`);
	return new Promise((resolve, reject) => {
		_spawn_cmd(`git clone ${address} ${defaults.folder}/${dest_folder} --progress`, context, action, resolve, reject);
	});
}

type PF = (v?:unknown) => void;

function _spawn_cmd(command:string, context:string, action:string, resolve:PF, reject:PF){
	
	output.start_loading(`${action}...`);
	
	const splitted_command = command.split(' ');
	const first_command = splitted_command[0];
	splitted_command.shift();
	
	const child = cp.spawn(first_command, splitted_command);
	
	output.log(context, command);
	
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
				output.done_log(context, `Done ${action}`);
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

function _sync_exec(command:string){
	cp.execSync(command);
}

function _remove_folder_if_exists(context:string, folder_path:string){
	if(fs.existsSync(folder_path)){
		output.start_loading(`Removing folder [${folder_path}]`);
		_sync_exec(`rm -rf ${folder_path}`);
		output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
	}
}

function _create_folder_if_doesnt_exists(context:string, folder_path:string){
	if(!fs.existsSync(folder_path)){
		output.start_loading(`Creating folder [${folder_path}]`);
		_sync_exec(`mkdir ${folder_path}`);
		output.done_verbose_log(context, `Folder [${folder_path}] created.`);
	}
}

function _copy_files(context:string, source:string, destination:string){
	output.start_loading(`Copying files [${source}] to [${destination}]...`);
	_sync_exec(`cp -t ${destination} ${source}`,);
	output.done_verbose_log(context, `Copied files [${source}] to [${destination}]`);
}

// function _copy_file(context:string, source:string, destination:string){
//   output.start_loading(`Copying file [${source}] to [${destination}]...`);
//   _sync_exec(`cp ${source} ${destination}`);
//   output.done_verbose_log(context, `Copied file [${source}] to [${destination}]`);
// }

