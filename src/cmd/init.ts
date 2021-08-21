/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import inquirer from 'inquirer';

import {urn_util} from 'urn-lib';

import {
	Arguments,
	Repo,
	Options,
	abstract_repos,
	abstract_pacman,
	abstract_deploy
} from '../types';

import {conf, defaults, jsonfile_path} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import {title} from './title';

import {alias} from './alias';

export const init = {
	
	run: async (root:string, repo:Repo, options:Partial<Options>):Promise<void> => {
		
		options.root = root;
		options.repo = repo;
		
		common.init_run(options);
		
		await _initialize();
		
	},
	
	command: async (args:Arguments):Promise<void> => {
		
		console.clear();
		
		title();
		
		if(_is_already_initialized() && conf.force === false){
			
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
						
						await _ask_for_pacman(args);
					
					}else{
						process.exit(0);
					}
				});
		}else{
			
			await _ask_for_pacman(args);
			
		}
		
	}
	
};

async function _initialize()
		:Promise<void>{
	
	output.start_loading('Initialization...');
	
	if(conf.pacman === 'yarn' && !fs.existsSync(`${conf.root}/yarn.lock`)){
		await new Promise((resolve, reject) => {
			util.spawn_cmd(`yarn install`, 'yarn', 'Yarn install', resolve, reject);
		});
	}
	
	output.verbose_log('root', `$URNROOT$Project root: [${conf.root}]`);
	output.verbose_log('repo', `Selected repo: [${conf.repo}]`);
	
	if(conf.repo === 'api'){
		output.verbose_log('dply', `Selected deploy: [${conf.deploy}]`);
	}
	
	_update_package_aliases();
	_create_urn_folder();
	_ignore_urn_folder();
	_create_rc_file();
	await _clone_and_install_repo();
	_remove_git_files();
	_create_client_server_folders();
	await _clone_dot();
	_copy_dot_files();
	_remove_tmp();
	
	_update_relative_paths();
	
	output.end_log(`Initialization completed.`);
	
}


function _is_already_initialized(){
	return (fs.existsSync(`${conf.root}/${jsonfile_path}`));
}

async function _ask_for_pacman(args:Arguments){
	
	const pacman = args.pacman;
	
	if(!pacman && conf.force === false){
			
		output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'pacman',
					message: 'Select which package manager you want to use:',
					choices: Object.keys(abstract_pacman)
				}
			]).then(async (answers) => {
				
				util.set_pacman(answers.pacman);
				
				await _ask_for_repo(args);
				
			});
		
	}else{
		
		await _ask_for_repo(args);
		
	}
}

async function _ask_for_deploy(args:Arguments){
	
	const deploy = args.d || args.deploy;
	
	if(!deploy && conf.force === false){
			
		output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'deploy',
					message: 'How you want to deploy?',
					choices: Object.keys(abstract_deploy)
				}
			]).then(async (answers) => {
				
				util.set_deploy(answers.deploy);
				
				await _proceed();
				
			});
		
	}else{
		
		await _proceed();
		
	}
}

async function _ask_for_repo(args:Arguments){
	
	const repo = args.r || args.repo;
	
	if(!repo && conf.force === false){
			
		output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'repo',
					message: 'Select which URANIO repo you want to use:',
					choices: Object.keys(abstract_repos)
				}
			]).then(async (answers) => {
				
				util.set_repo(answers.repo);
				
				if(answers.repo !== 'core'){
					
					await _ask_for_deploy(args);
					
				}else{
					
					await _proceed();
					
				}
				
			});
		
	}else{
		
		await _ask_for_deploy(args);
		
	}
}

async function _proceed(){
	
	console.clear();
	
	title();
	
	await _initialize();
	
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
	await _uninstall_api_dep();
	await _uninstall_trx_dep();
	switch(repo){
		case 'core':{
			await _install_core_dep();
			return true;
		}
		case 'api':{
			await _install_api_dep();
			return true;
		}
		case 'trx':{
			await _install_trx_dep();
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

function _copy_netlify_files(){
	const dot_deploy_folder = `${conf.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	
	const toml_file = `${dot_deploy_folder}/netlify/netlify.toml`;
	const toml_dest = `${conf.root}/`;
	util.copy_file('dot', toml_file, toml_dest);
	
	const function_folder = `${conf.root}/${defaults.folder}/server/functions`;
	if(!fs.existsSync(function_folder)){
		fs.mkdirSync(function_folder);
	}
	let api_file = `trx-api.txt`;
	if(conf.repo === 'api'){
		api_file = `api-api.txt`;
	}
	const functions_file = `${dot_deploy_folder}/netlify/functions/${api_file}`;
	const functions_dest = `${function_folder}/api.ts`;
	util.copy_file('dot', functions_file, functions_dest);
}

function _copy_express_files(){
	const dot_deploy_folder = `${conf.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	
	const src_folder = `${conf.root}/src`;
	if(!fs.existsSync(src_folder)){
		fs.mkdirSync(src_folder);
	}
	
	const index_file = `${dot_deploy_folder}/express/index.txt`;
	const index_dest = `${src_folder}/index.ts`;
	util.copy_file('dot', index_file, index_dest);
}

function _copy_dot_files(){
	if(fs.existsSync(`${conf.root}/src`) === false){
		_copy_dot_src_folder();
	}
	_copy_dot_tsconfig();
	_copy_dot_eslint_files();
	if(conf.deploy === 'netlify'){
		_copy_netlify_files();
	}else{
		_copy_express_files();
	}
}

function _create_rc_file(){
	output.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `\t"repo": "${conf.repo}",\n`;
	content += `\t"pacman": "${conf.pacman}",\n`;
	content += `\t"deploy": "${conf.deploy}"\n`;
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
		case 'api':{
			await _clone_api();
			break;
		}
		case 'trx':{
			await _clone_trx();
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

function _create_client_server_folders(){
	output.start_loading(`Creating client folder...`);
	util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}/client`);
	util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}/client/books`);
	output.start_loading(`Creating server folder...`);
	util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}/server`);
	util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}/server/books`);
	// if(conf.repo === 'ntl'){
	//   output.start_loading(`Creating server functions folder...`);
	//   util.create_folder_if_doesnt_exists('init', `${conf.root}/${defaults.folder}/server/functions`);
	// }
	output.done_log('init', `Created client server folders.`);
}

function _update_package_aliases(){
	output.start_loading('Updating aliases...');
	const package_json_path = `${conf.root}/package.json`;
	const data = fs.readFileSync(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		package_data['_moduleAliases'] = {
			'uranio': `./dist/${defaults.folder}/${defaults.repo_folder}/`,
			'uranio-books': `./dist/${defaults.folder}/server/books.js`,
			'uranio-client': `./dist/${defaults.folder}/${defaults.repo_folder}/client`
		};
		if(conf.repo !== 'core'){
			package_data['_moduleAliases']['uranio-core'] = `./dist/${defaults.folder}/${defaults.repo_folder}/core/`;
		}
		try{
			fs.writeFileSync(package_json_path, JSON.stringify(package_data, null, '\t'));
			output.done_log('alia', `Updated package.json module aliases.`);
		}catch(ex){
			output.error_log('alia', `Cannot update ${package_json_path}.`);
		}
	}catch(ex){
		output.error_log('alia', `Cannot parse ${package_json_path}.`);
	}
}

async function _install_core_dep(){
	output.start_loading(`Installing core dep...`);
	await util.install_dep(defaults.core_dep_repo, 'core');
	await util.install_dep_dev(defaults.core_dep_dev_repo, 'core');
	output.done_log('core', `Installed core dependencies.`);
	return true;
}

async function _install_api_dep(){
	output.start_loading(`Installing api dep...`);
	await util.install_dep(defaults.api_dep_repo, 'api');
	await util.install_dep_dev(defaults.api_dep_dev_repo, 'api');
	output.done_log('api', `Installed api dependencies.`);
	return true;
}

async function _install_trx_dep(){
	output.start_loading(`Installing trx dep...`);
	await util.install_dep(defaults.trx_dep_repo, 'trx');
	await util.install_dep_dev(defaults.trx_dep_dev_repo, 'trx');
	output.done_log('trx', `Installed trx dependencies.`);
	return true;
}

// async function _install_ntl_dep(){
//   output.start_loading(`Installing ntl dep...`);
//   await util.install_dep(defaults.ntl_dep_repo, 'ntl');
//   await util.install_dep_dev(defaults.ntl_dep_dev_repo, 'ntl');
//   output.done_log('ntl', `Installed ntl dependencies.`);
//   return true;
// }

async function _uninstall_dep(repo:string, context:string){
	const short_repo = (repo.substr(0,3) === 'ssh' || repo.substr(0,7) === 'git+ssh') ?
		repo.split('/').slice(-1)[0] : repo;
	if(util.dependency_exists(short_repo)){
		output.start_loading(`Uninstalling ${short_repo} dep...`);
		const dep_folder = `${conf.root}/node_modules/${short_repo}`;
		util.remove_folder_if_exists(context, dep_folder);
		const dep_dev_folder = `${conf.root}/node_modules/${short_repo}`;
		util.remove_folder_if_exists(context, dep_dev_folder);
		await util.uninstall_dep(`${short_repo}`, context);
		output.done_log(context, `Uninstalled ${short_repo} dependencies.`);
		return true;
	}
}

async function _uninstall_core_dep(){
	// output.start_loading(`Uninstalling core dep...`);
	// const dep_folder = `${conf.root}/node_modules/${defaults.core_dep_repo}`;
	// util.remove_folder_if_exists('core', dep_folder);
	// const dep_dev_folder = `${conf.root}/node_modules/${defaults.core_dep_dev_repo}`;
	// util.remove_folder_if_exists('core', dep_dev_folder);
	// await util.uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	// output.done_log('core', `Uninstalled core dependencies.`);
	// return true;
	await _uninstall_dep(defaults.core_dep_repo, 'core');
	await _uninstall_dep(defaults.core_dep_dev_repo, 'core');
	return true;
}

async function _uninstall_api_dep(){
	// output.start_loading(`Uninstalling api dep...`);
	// const dep_folder = `${conf.root}/node_modules/${defaults.api_dep_repo}`;
	// util.remove_folder_if_exists('api', dep_folder);
	// const dep_dev_folder = `${conf.root}/node_modules/${defaults.api_dep_dev_repo}`;
	// util.remove_folder_if_exists('api', dep_dev_folder);
	// await util.uninstall_dep(`${defaults.api_dep_repo.split('/').slice(-1)[0]} ${defaults.api_dep_dev_repo.split('/').slice(-1)[0]}`, 'api');
	// output.done_log('api', `Uninstalled api dependencies.`);
	// return true;
	await _uninstall_dep(defaults.api_dep_repo, 'api');
	await _uninstall_dep(defaults.api_dep_dev_repo, 'api');
	return true;
}

async function _uninstall_trx_dep(){
	// output.start_loading(`Uninstalling api dep...`);
	// const dep_folder = `${conf.root}/node_modules/${defaults.api_dep_repo}`;
	// util.remove_folder_if_exists('api', dep_folder);
	// const dep_dev_folder = `${conf.root}/node_modules/${defaults.api_dep_dev_repo}`;
	// util.remove_folder_if_exists('api', dep_dev_folder);
	// await util.uninstall_dep(`${defaults.api_dep_repo.split('/').slice(-1)[0]} ${defaults.api_dep_dev_repo.split('/').slice(-1)[0]}`, 'api');
	// output.done_log('api', `Uninstalled api dependencies.`);
	// return true;
	await _uninstall_dep(defaults.trx_dep_repo, 'trx');
	await _uninstall_dep(defaults.trx_dep_dev_repo, 'trx');
	return true;
}
// async function _uninstall_ntl_dep(){
//   // output.start_loading(`Uninstalling ntl dep...`);
//   // const dep_folder = `${conf.root}/node_modules/${defaults.ntl_dep_repo}`;
//   // util.remove_folder_if_exists('ntl_', dep_folder);
//   // const dep_dev_folder = `${conf.root}/node_modules/${defaults.ntl_dep_dev_repo}`;
//   // util.remove_folder_if_exists('ntl_', dep_dev_folder);
//   // await util.uninstall_dep(`${defaults.ntl_dep_repo.split('/').slice(-1)[0]} ${defaults.ntl_dep_dev_repo.split('/').slice(-1)[0]}`, 'ntl_');
//   // output.done_log('ntl', `Uninstalled ntl dependencies.`);
//   // return true;
//   // await _uninstall_dep(defaults.ntl_dep_repo, 'ntl');
//   // await _uninstall_dep(defaults.ntl_dep_dev_repo, 'ntl');
//   return true;
// }

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

async function _clone_api(){
	output.start_loading(`Cloning api...`);
	await util.clone_repo_recursive('api', defaults.api_repo, `${conf.root}/${defaults.folder}/${defaults.repo_folder}`);
	output.done_log('api', `Cloned api repo.`);
}

async function _clone_trx(){
	output.start_loading(`Cloning trx...`);
	await util.clone_repo_recursive('trx', defaults.trx_repo, `${conf.root}/${defaults.folder}/${defaults.repo_folder}`);
	output.done_log('trx', `Cloned trx repo.`);
}

function _remove_git_files(){
	output.start_loading(`Removing git files...`);
	const cloned_repo_path = `${conf.root}/${defaults.folder}/${defaults.repo_folder}`;
	util.sync_exec(`( find ${cloned_repo_path} -name ".git*" ) | xargs rm -rf`);
	output.done_log('.git', `Removed uranio .git files.`);
}

function _update_relative_paths(){
	output.start_loading(`Updating relative paths aliases...`);
	alias.include();
}


