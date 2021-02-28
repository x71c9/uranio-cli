/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

// import util from 'util';

import * as cp from 'child_process';

// const execute = util.promisify(cp.exec);
// const access = util.promisify(fs.access);

// import chalk from 'chalk';

import {Arguments, Repo} from '../types';

import {conf, defaults} from '../conf/defaults';

import * as output from '../log/';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		title();
		
		let repo:Repo = defaults.default_repo;
		
		const args_repo = args.r || args.repo;
		
		if(args.verbose === true){
			conf.verbose = true;
		}
		
		if(args_repo){
			switch(args_repo){
				case 'web':{
					repo = 'web';
					break;
				}
				case 'core':{
					repo = 'core';
					break;
				}
			}
		}
		
		_update_aliases(repo);
		
		_create_folder_if_doesnt_exists('init', 'src');
		_create_folder_if_doesnt_exists('init', 'dist');
		
		_remove_folder_if_exists('init', defaults.folder);
		_create_folder_if_doesnt_exists('init', defaults.folder);
		
		_copy_book_file();
		_copy_types_file();
		
		// TODO only in production _copy_tsconfig_file();
		
		_copy_eslint_files();
		
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
		
		output.end_log(`Initialization completed.`);
		// process.exit(1);
		
	}
	
};

function _copy_book_file(){
	_copy_file('./src/files/book.ts', `./${defaults.folder}/book.ts`);
}

function _copy_types_file(){
	_copy_file('./src/files/types.ts', `./${defaults.folder}/types.ts`);
}

function _update_aliases(repo:Repo){
	const data = fs.readFileSync('./package.json', 'utf8');
	const package_data = JSON.parse(data);
	package_data['_moduleAliases'] = {
		urn_book: './dist/book.js',
		urn_core: './dist/urn-core/',
	};
	if(repo === 'web'){
		package_data['_moduleAliases']['urn_web'] = './dist/urn-web/';
	}
	fs.writeFileSync('./package.json', JSON.stringify(package_data, null, '\t'));
}

// function _copy_tsconfig_file(){
//   _copy_file('./src/files/tsconfig.json', './tsconfig.json');
// }

function _copy_eslint_files(){
	_copy_files('./src/files/.eslintrc.js ./src/files/.eslintignore', '.');
}

function _copy_files(source:string, destination:string){
	_sync_exec(
		`cp -t ${destination} ${source}`,
		'init',
		`copying files ${source} to ${destination}`,
	);
}

function _copy_file(source:string, destination:string){
	_sync_exec(
		`cp ${source} ${destination}`,
		'init',
		`copying file ${source} to ${destination}`,
	);
}

// function _sync_exec(cause: string, context:string, action:string, done:string, command:string){
function _sync_exec(command:string, context:string, action:string){
	output.start_loading(context, action);
	cp.execSync(command);
	output.stop_loading();
	output.log(context, `${defaults.check_char} Done ${action}`);
}

async function _install_core_dep(){
	await _install_dep(defaults.core_dep_repo, 'core');
	await _install_dep_dev(defaults.core_dep_dev_repo, 'core');
	return true;
}

async function _install_web_dep(){
	await _install_dep(defaults.web_dep_repo, 'web');
	await _install_dep_dev(defaults.web_dep_dev_repo, 'web');
	return true;
}

async function _uninstall_core_dep(){
	const dep_folder = `./node_modules/${defaults.core_dep_repo}`;
	_remove_folder_if_exists('core', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.core_dep_dev_repo}`;
	_remove_folder_if_exists('core', dep_dev_folder);
	await _uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	return true;
}

async function _uninstall_web_dep(){
	const dep_folder = `./node_modules/${defaults.web_dep_repo}`;
	_remove_folder_if_exists('web', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.web_dep_dev_repo}`;
	_remove_folder_if_exists('web', dep_dev_folder);
	await _uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web');
	return true;
}

async function _install_dep(repo:string, context:string){
	const action = `installing dependencies [${repo}]`;
	output.verbose_log(context, `Start ${action}`);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd('npm', ['i', repo, '--verbose'], context, action, resolve, reject);
	});
}

async function _install_dep_dev(repo:string, context:string){
	const action = `installing dev dependencies [${repo}]`;
	output.verbose_log(context, `Start ${action}`);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd('npm', ['i', repo, '--save-dev', '--verbose'], context, action, resolve, reject);
	});
}

async function _uninstall_dep(repo:string, context:string){
	const action = `uninstalling dependencies [${repo}]`;
	output.verbose_log(context, `Start ${action}`);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd('npm', ['uninstall', repo, '--verbose'], context, action, resolve, reject);
	});
}
async function _clone_core(){
	return await _clone_repo('core', defaults.core_repo, 'urn-core');
}

async function _clone_web(){
	return await _clone_repo('web', defaults.web_repo, 'urn-web');
}

async function _clone_repo(context: string, address:string, dest_folder:string){
	const action = `cloning repos ${address}`;
	output.verbose_log(context, action);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd(
			'git',
			['clone', address, `${defaults.folder}/${dest_folder}`, `--progress`],
			context,
			action,
			resolve,
			reject
		);
	});
}

function _spawn_cmd(
	command:string,
	args:string[],
	context:string,
	action:string,
	resolve:(v?:unknown) => void,
	reject:(v?:unknown) => void,
){
	
	// const child = cp.spawn(command, args, {stdio: (conf.verbose) ? 'inherit' : 'pipe'});
	const child = cp.spawn(command, args);
	
	args.unshift(command);
	output.stop_loading();
	output.log(context, args.join(' '));
	output.start_loading();
	
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
		output.stop_loading();
		switch(code){
			case 0:{
				output.log(context, `${defaults.check_char} Done ${action}`);
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

function _remove_folder_if_exists(context:string, folder_path:string){
	if(fs.existsSync(folder_path)){
		_sync_exec(
			`rm -rf ${folder_path}`,
			context,
			`deleting folder ${folder_path}`
		);
	}
}

function _create_folder_if_doesnt_exists(context:string, folder_path:string){
	if(!fs.existsSync(folder_path)){
		_sync_exec(
			`mkdir ${folder_path}`,
			context,
			`creating folder ${folder_path}`,
		);
	}
}

