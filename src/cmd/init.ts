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

import {Arguments} from '../types';

import {conf, defaults} from '../conf/defaults';

import * as output from '../log/';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		title();
		
		let repo = defaults.default_repo;
		
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
		
		_remove_folder_if_exists('init', defaults.folder);
		_create_folder_if_doesnt_exists('init', defaults.folder);
		
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
		
		// process.exit(1);
		
	}
	
};

function sync_exec(cause: string, context:string, action:string, done:string, command:string){
	output.verbose_log(context, `* ${cause}`);
	output.start_loading(context, action);
	cp.execSync(command);
	output.stop_loading();
	output.log(context, `${defaults.check_char} ${done}`);
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
	const action = `installing dependencies for repo [${repo}]`;
	output.verbose_log(context, `Start ${action}`);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd('npm', ['i', repo, '--verbose'], context, action, resolve, reject);
	});
}

async function _install_dep_dev(repo:string, context:string){
	const action = `installing dev dependencies for repo [${repo}]`;
	output.verbose_log(context, `Start ${action}`);
	output.start_loading(context, action);
	return new Promise((resolve, reject) => {
		_spawn_cmd('npm', ['i', repo, '--save-dev', '--verbose'], context, action, resolve, reject);
	});
}

async function _uninstall_dep(repo:string, context:string){
	const action = `uninstalling dependencies for repo [${repo}]`;
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
			// output.stop_loading();
			// output.verbose_log(chunk);
			// output.start_loading(`${action[0].toUpperCase()}${action.slice(1)}...`);
			// output.start_loading(chunk.replace('/\n/g','').replace('/\r/g',''));
			// output.spinner_text(chunk.replace('/\n/g','').replace('/\r/g',''));
			// output.spinner_text(chunk.replace('/\r/g',''));
			// output.spinner_text(chunk);
			const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
			// output.spinner_text(JSON.stringify(chunk).replace('\\n','').slice(1,-1).trim());
			output.spinner_text(plain_text);
		});
	}
	
	if(child.stderr){
		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk) => {
			// output.stop_loading();
			// output.verbose_log(chunk);
			// output.start_loading(`${action[0].toUpperCase()}${action.slice(1)}...`);
			// output.start_loading(chunk.replace('/\n/g','').replace('/\r/g',''));
			// output.spinner_text(chunk.replace('/\n/g','').replace('/\r/g',''));
			// output.spinner_text(chunk.replace('/\r/g',''));
			const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
			// output.spinner_text(JSON.stringify(chunk).replace('\\n','').slice(1,-1).trim());
			output.spinner_text(plain_text);
		});
	}
	
	child.on('close', (code) => {
		output.stop_loading();
		switch(code){
			case 0:{
				output.log(context, `${defaults.check_char} Done ${action}.`);
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
		sync_exec(
			`Folder ${folder_path} exists`,
			context,
			`Deleting folder ${folder_path}`,
			`Folder ${folder_path} deleted`,
			`rm -rf ${folder_path}`
		);
	}
}

function _create_folder_if_doesnt_exists(context:string, folder_path:string){
	if(!fs.existsSync(folder_path)){
		sync_exec(
			`Folder ${folder_path} doesn't exists`,
			context,
			`Deleting folder ${folder_path}`,
			`Folder ${folder_path} deleted`,
			`rm -rf ${folder_path}`
		);
	}
}

