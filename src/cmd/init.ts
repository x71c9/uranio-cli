/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import inquirer from 'inquirer';

import {Arguments, Repo, Options, abstract_repos} from '../types';

import {conf, defaults, jsonfile_path} from '../conf/defaults';

import * as output from '../log/';

import * as util from '../util/';

import {title} from './title';

export const init = {
	
	run: async (root:string, repo:Repo, options:Partial<Options>):Promise<void> => {
		
		conf.hide = true;
		conf.spinner = false;
		
		if(options){
			util.merge_options(options);
		}
		
		await _initialize(root, repo, options);
		
	},
	
	command: async (args:Arguments):Promise<void> => {
		
		console.clear();
		
		title();
		
		if(_is_already_initialized()){
			
			output.stop_loading();
			
			let confirm_msg = '';
			confirm_msg += `It appears the repo is already initialized.\n`;
			confirm_msg += `? Are you sure you want to proceed?\n`;
			
			const suffix = `? All data will be lost and replaced.`;
			
			inquirer.
				prompt([
					{
						type: 'confirm',
						name: 'proceed',
						message: confirm_msg,
						suffix: suffix
					}
				]).then(async (answer) => {
					if(answer.proceed && answer.proceed === true){
						
						await _select_repo(args);
					
					}else{
						process.exit(0);
					}
				});
		}else{
			
			await _select_repo(args);
			
		}
		
	}
	
};

async function _initialize(root:string, repo:Repo, options?:Partial<Options>)
		:Promise<void>{
	
	if(!util.check_folder(root)){
		throw new Error(`Invalid root path [${root}].`);
	}
	
	if(!util.check_repo(repo)){
		throw new Error(`Invalid repo [${repo}].`);
	}
	
	conf.root = root;
	conf.repo = repo;
	
	if(options){
		util.merge_options(options);
	}
	
	output.verbose_log('root', `$URNROOT$Project root: [${conf.root}]`);
	output.verbose_log('repo', `Selected repo: [${repo}]`);
	output.start_loading('Initialization...');
	
	_update_aliases();
	_create_urn_folder();
	_ignore_urn_folder();
	_create_json_file();
	await _clone_dot();
	_copy_dot_files();
	await _clone_and_install_repo();
	_remove_tmp();
		
	output.end_log(`Initialization completed.`);
	
}


function _is_already_initialized(){
	return (fs.existsSync(`${conf.root}/${jsonfile_path}`));
}

async function _select_repo(args:Arguments){
	
	const repo = args.r || args.repo;
	
	if(!repo){
			
		output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'repo',
					message: 'Select URANIO repo you want to use:',
					choices: Object.keys(abstract_repos)
				}
			]).then(async (answers) => {
				
				await _proceed_with_repo(answers.repo);
				
			});
		
	}else{
		
		await _proceed_with_repo(repo);
		
	}
}

async function _proceed_with_repo(repo:Repo){
	
	util.set_repo(repo);
	
	console.clear();
	
	title();
	
	await _initialize(conf.root, conf.repo);
	
}

function _ignore_urn_folder(){
	output.start_loading(`Adding ${defaults.folder} to .gitignore...`);
	const gitignore = `${conf.root}/.gitignore`;
	if(!fs.existsSync(gitignore)){
		util.sync_exec(`touch ${gitignore}`);
	}
	let content = fs.readFileSync(gitignore, 'utf8');
	if(content.indexOf(defaults.folder+'/') === -1){
		content += `\n${defaults.folder}/`;
	}
	if(content.indexOf(defaults.log_filepath+'/') === -1){
		content += `\n${defaults.log_filepath}/`;
	}
	fs.writeFileSync(gitignore, content);
	const log_msg = `Added ${defaults.folder} and ${defaults.log_filepath} to .gitignore.`;
	output.done_log('.git', log_msg);
}

function _remove_tmp(){
	output.start_loading(`Removing tmp folder [${defaults.tmp_folder}]...`);
	util.remove_folder_if_exists('dot', defaults.tmp_folder);
	output.done_verbose_log('tmp', `Removed tmp folder [${defaults.tmp_folder}].`);
}

async function _install_dep(repo:Repo)
		:Promise<true>{
	await _uninstall_core_dep();
	await _uninstall_web_dep();
	await _uninstall_ntl_dep();
	switch(repo){
		case 'core':{
			await _install_core_dep();
			return true;
		}
		case 'web':{
			await _install_web_dep();
			return true;
		}
		case 'ntl':{
			await _install_ntl_dep();
			return true;
		}
		// default:{
		//   output.log('init', `Selected repo is not valid. [${repo}]`);
		//   process.exit(1);
		// }
	}
}

function _copy_dot_src_folder(){
	const dot_src_folder = `${conf.root}/${defaults.tmp_folder}/urn-dot/src`;
	const dest = `${conf.root}/`;
	util.copy_folder('dot', dot_src_folder, dest);
}

function _copy_dot_tsconfig(){
	const dot_tsc_file = `${conf.root}/${defaults.tmp_folder}/urn-dot/tsconfig.json`;
	const dest = `${conf.root}/`;
	util.copy_file('dot', dot_tsc_file, dest);
}

function _copy_dot_eslint_files(){
	const dot_eslint_files = `${conf.root}/${defaults.tmp_folder}/urn-dot/.eslint*`;
	const dest = `${conf.root}/`;
	util.copy_files('dot', dot_eslint_files, dest);
}

function _copy_dot_files(){
	_copy_dot_src_folder();
	_copy_dot_tsconfig();
	_copy_dot_eslint_files();
}

function _create_json_file(){
	output.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `"repo": "${conf.repo}"\n`;
	content += `}`;
	fs.writeFileSync(`${conf.root}/${jsonfile_path}`, content);
	util.pretty(`${conf.root}/${jsonfile_path}`, 'json');
	output.done_log('rcfl', `Created file ${jsonfile_path}.`);
}

async function _clone_and_install_repo(){
	output.start_loading(`Cloning and intalling [${conf.repo}]...`);
	switch(conf.repo){
		case 'core':{
			await _clone_core();
			break;
		}
		case 'web':{
			await _clone_web();
			break;
		}
		case 'ntl':{
			await _clone_ntl();
			break;
		}
		default:{
			output.log('init', `Selected repo is not valid. [${conf.repo}]`);
			process.exit(1);
		}
	}
	await _install_dep(conf.repo);
	output.done_log('repo', `Cloned and installed repo [${conf.repo}].`);
}

function _create_urn_folder(){
	output.start_loading(`Creating ${defaults.folder} folder...`);
	util.remove_folder_if_exists('init', `${conf.root}/${defaults.folder}`);
	util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}`);
	output.done_log('init', `Created folder ${defaults.folder}.`);
}

function _update_aliases(){
	output.start_loading('Updating aliases...');
	const data = fs.readFileSync(`${conf.root}/package.json`, 'utf8');
	const package_data = JSON.parse(data);
	package_data['_moduleAliases'] = {
		urn_books: `./dist/${defaults.folder}/books.js`,
		uranio: `./dist/${defaults.folder}/${defaults.repo_folder}/`
	};
	if(conf.repo !== 'core'){
		package_data['_moduleAliases']['urn_core'] = `./dist/${defaults.folder}/${defaults.repo_folder}/core/`;
	}
	fs.writeFileSync(`${conf.root}/package.json`, JSON.stringify(package_data, null, '\t'));
	output.done_log('alas', `Updated aliases.`);
}

async function _install_core_dep(){
	output.start_loading(`Installing core dep...`);
	await util.install_dep(defaults.core_dep_repo, 'core');
	await util.install_dep_dev(defaults.core_dep_dev_repo, 'core');
	output.done_log('core', `Installed core dependencies.`);
	return true;
}

async function _install_web_dep(){
	output.start_loading(`Installing web dep...`);
	await util.install_dep(defaults.web_dep_repo, 'web');
	await util.install_dep_dev(defaults.web_dep_dev_repo, 'web');
	output.done_log('web', `Installed web dependencies.`);
	return true;
}

async function _install_ntl_dep(){
	output.start_loading(`Installing ntl dep...`);
	await util.install_dep(defaults.ntl_dep_repo, 'ntl');
	await util.install_dep_dev(defaults.ntl_dep_dev_repo, 'ntl');
	output.done_log('ntl', `Installed ntl dependencies.`);
	return true;
}

async function _uninstall_core_dep(){
	output.start_loading(`Uninstalling core dep...`);
	const dep_folder = `${conf.root}/node_modules/${defaults.core_dep_repo}`;
	util.remove_folder_if_exists('core', dep_folder);
	const dep_dev_folder = `${conf.root}/node_modules/${defaults.core_dep_dev_repo}`;
	util.remove_folder_if_exists('core', dep_dev_folder);
	await util.uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	output.done_log('core', `Uninstalled core dependencies.`);
	return true;
}

async function _uninstall_web_dep(){
	output.start_loading(`Uninstalling web dep...`);
	const dep_folder = `${conf.root}/node_modules/${defaults.web_dep_repo}`;
	util.remove_folder_if_exists('web_', dep_folder);
	const dep_dev_folder = `${conf.root}/node_modules/${defaults.web_dep_dev_repo}`;
	util.remove_folder_if_exists('web_', dep_dev_folder);
	await util.uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.web_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
	output.done_log('web', `Uninstalled web dependencies.`);
	return true;
}

async function _uninstall_ntl_dep(){
	output.start_loading(`Uninstalling ntl dep...`);
	const dep_folder = `${conf.root}/node_modules/${defaults.ntl_dep_repo}`;
	util.remove_folder_if_exists('ntl_', dep_folder);
	const dep_dev_folder = `${conf.root}/node_modules/${defaults.ntl_dep_dev_repo}`;
	util.remove_folder_if_exists('ntl_', dep_dev_folder);
	await util.uninstall_dep(`${defaults.ntl_dep_repo.split('/').slice(-1)[0]} ${defaults.ntl_dep_dev_repo.split('/').slice(-1)[0]}`, 'ntl_');
	output.done_log('ntl', `Uninstalled ntl dependencies.`);
	return true;
}

async function _clone_dot(){
	output.start_loading(`Cloning dot...`);
	util.remove_folder_if_exists('dot', defaults.tmp_folder);
	util.create_folder_if_doesnt_exists('dot', defaults.tmp_folder);
	await util.clone_repo('dot', defaults.dot_repo, `${conf.root}/${defaults.tmp_folder}/urn-dot`);
	output.done_log('dot', `Cloned dot repo.`);
}

async function _clone_core(){
	output.start_loading(`Cloning core...`);
	await util.clone_repo('core', defaults.core_repo, `${conf.root}/${defaults.folder}/${defaults.repo_folder}`);
	output.done_log('core', `Cloned core repo.`);
}

async function _clone_web(){
	output.start_loading(`Cloning web...`);
	await util.clone_repo_recursive('web_', defaults.web_repo, `${conf.root}/${defaults.folder}/${defaults.repo_folder}`);
	output.done_log('web', `Cloned web repo.`);
}

async function _clone_ntl(){
	output.start_loading(`Cloning ntl...`);
	await util.clone_repo_recursive('ntl_', defaults.ntl_repo, `${conf.root}/${defaults.folder}/${defaults.repo_folder}`);
	output.done_log('ntl', `Cloned ntl repo.`);
}
