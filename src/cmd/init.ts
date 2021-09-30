/**
 * Init command module
 *
 * @packageDocumentation
 */

import inquirer from 'inquirer';

import {urn_util} from 'urn-lib';

import {defaults, default_params, jsonfile_path} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {
	Arguments,
	Params,
	abstract_repos,
	abstract_pacman,
	abstract_deploy
} from '../types';

import {alias} from './alias';

import {title} from './title';

import {
	merge_params,
	check_repo,
	check_deploy,
	check_pacman
} from './common';

import {InitParams} from './types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let init_params = default_params as Params & InitParams;

export async function init(params:InitParams, output_params?:Partial<output.OutputParams>)
		:Promise<void>{
	
	if(!output_params){
		output_params = params;
	}
	if(!output_params.root){
		output_params.root = params.root;
	}
	
	output_instance = output.create(output_params);
	init_params = merge_params(params);
	
	const util_params = {
		...init_params
	};
	
	util_instance = util.create(util_params, output_instance);
	
	output_instance.verbose_log(`$URNROOT$Project root: [${init_params.root}]`, 'root');
	output_instance.verbose_log(`Selected repo: [${init_params.repo}]`, 'repo');
	if(init_params.repo === 'api'){
		output_instance.verbose_log(`Selected deploy: [${init_params.deploy}]`, 'dply');
	}
	
	_update_package_aliases();
	_update_package_scripts();
	_create_urn_folder();
	_ignore_urn_folder();
	_create_rc_file();
	_create_client_server_folders();
	await _clone_and_install_repo();
	_remove_git_files();
	await _clone_dot();
	_copy_dot_files();
	_remove_tmp();
	_replace_aliases();
	if(init_params.repo === 'adm'){
		_add_admin_files();
	}
	
	output_instance.end_log(`Initialization completed.`);
}

export async function prompt_init(args:Arguments, params:InitParams)
		:Promise<void>{
	
	output_instance = output.create(params);
	
	init_params = merge_params(params);
	
	util_instance = util.create(init_params, output_instance);
	
	console.clear();
	
	title();
	
	// output_instance.verbose_log(urn_util.json.safe_stringify(init_params), 'init');
	
	if(_is_already_initialized() && init_params.force === false){
		
		// output.stop_loading();
		
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

function _is_already_initialized(){
	util_instance.output.hide = true;
	const is = (util_instance.fs.exists(`${init_params.root}/${jsonfile_path}`));
	util_instance.output.hide = false;
	return is;
}

async function _ask_for_pacman(args:Arguments){
	
	const pacman = args.p || args.pacman;
	
	if(!pacman && init_params.force === false){
			
		// output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'pacman',
					message: 'Select which package manager you want to use:',
					choices: Object.keys(abstract_pacman)
				}
			]).then(async (answers) => {
				
				check_pacman(answers.pacman);
				init_params.pacman = answers.pacman;
				
				await _ask_for_repo(args);
				
			});
		
	}else{
		
		await _ask_for_repo(args);
		
	}
}

async function _ask_for_repo(args:Arguments){
	
	const repo = args.r || args.repo;
	
	if(!repo && init_params.force === false){
			
		// output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'repo',
					message: 'Select which URANIO repo you want to use:',
					choices: Object.keys(abstract_repos)
				}
			]).then(async (answers) => {
				
				check_repo(answers.repo);
				
				if(answers.repo !== 'core'){
					
					await _ask_for_deploy(args);
					
				}else{
					
					await init(init_params);
					
				}
				
			});
		
	}else{
		
		await _ask_for_deploy(args);
		
	}
}

async function _ask_for_deploy(args:Arguments){
	
	const deploy = args.d || args.deploy;
	
	if(!deploy && init_params.force === false){
			
		// output.stop_loading();
		
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'deploy',
					message: 'How you want to deploy?',
					choices: Object.keys(abstract_deploy)
				}
			]).then(async (answers) => {
				
				check_deploy(answers.deploy);
				
				await init(init_params);
				
			});
		
	}else{
		
		await init(init_params);
		
	}
}

function _add_admin_files(){
	output_instance.start_loading(`Adding admin files...`);
	const fix_file_nuxt_types = `${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
	if(!util_instance.fs.exists(fix_file_nuxt_types)){
		util_instance.spawn.exec_sync(`touch ${fix_file_nuxt_types}`);
	}
}

function _replace_aliases(){
	output_instance.start_loading(`Updating relative paths aliases...`);
	alias(init_params);
}

function _remove_tmp(){
	output_instance.start_loading(`Removing tmp folder [${defaults.tmp_folder}]...`);
	util_instance.fs.remove_directory(`${init_params.root}/${defaults.tmp_folder}`, 'tmp');
	output_instance.done_verbose_log(`Removed tmp folder [${defaults.tmp_folder}].`, 'tmp');
}

function _copy_dot_files(){
	if(util_instance.fs.exists(`${init_params.root}/src`) === false){
		_copy_dot_src_folder();
	}
	_copy_dot_tsconfigs();
	_copy_dot_eslint_files();
	if(init_params.deploy === 'netlify'){
		_copy_netlify_files();
	}else{
		_copy_express_files();
	}
}

async function _clone_dot(){
	output_instance.start_loading(`Cloning dot...`);
	util_instance.fs.remove_directory(defaults.tmp_folder, 'dot');
	util_instance.fs.create_directory(defaults.tmp_folder, 'dot');
	await util_instance.cmd.clone_repo(
		defaults.dot_repo,
		`${init_params.root}/${defaults.tmp_folder}/urn-dot`,
		'dot',
		init_params.branch
	);
	output_instance.done_log(`Cloned dot repo.`, 'dot');
}

function _remove_git_files(){
	output_instance.start_loading(`Removing git files...`);
	const cloned_server_repo_path = `${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`;
	util_instance.spawn.exec_sync(`( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`);
	const cloned_client_repo_path = `${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`;
	util_instance.spawn.exec_sync(`( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`);
	output_instance.done_log(`Removed uranio .git files.`, '.git');
}

async function _clone_and_install_repo(){
	output_instance.start_loading(`Cloning and intalling [${init_params.repo}]...`);
	switch(init_params.repo){
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
			output_instance.log(`Selected repo is not valid. [${init_params.repo}]`, 'init');
			process.exit(1);
		}
	}
	await _install_dep();
	output_instance.done_log(`Cloned and installed repo [${init_params.repo}].`, 'repo');
}

function _create_client_server_folders(){
	output_instance.start_loading(`Creating server folder...`);
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/server`, 'init');
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/server/src`, 'init');
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/server/src/books`, 'init');
	output_instance.start_loading(`Creating client folder...`);
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/client`, 'init');
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/client/src`, 'init');
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}/client/src/books`, 'init');
	output_instance.done_log(`Created client server folders.`, 'init');
}

function _create_rc_file(){
	output_instance.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `\t"repo": "${init_params.repo}",\n`;
	content += `\t"pacman": "${init_params.pacman}",\n`;
	content += `\t"deploy": "${init_params.deploy}"\n`;
	content += `}`;
	util_instance.fs.write_file(`${init_params.root}/${jsonfile_path}`, content);
	util_instance.pretty(`${init_params.root}/${jsonfile_path}`, 'json');
	output_instance.done_log(`Created file ${jsonfile_path}.`, 'rcfl');
}

function _ignore_urn_folder(){
	output_instance.start_loading(`Adding ${defaults.folder} to .gitignore...`);
	const gitignore = `${init_params.root}/.gitignore`;
	if(!util_instance.fs.exists(gitignore)){
		util_instance.fs.create_file(gitignore, 'giti');
	}
	let content = util_instance.fs.read_file(gitignore, 'utf8');
	if(content.indexOf(defaults.folder+'/') === -1){
		content += `\n${defaults.folder}/`;
	}
	if(content.indexOf(defaults.log_filepath+'/') === -1){
		content += `\n${defaults.log_filepath}`;
	}
	util_instance.fs.write_file(gitignore, content);
	const log_msg = `Added ${defaults.folder} and ${defaults.log_filepath} to .gitignore.`;
	output_instance.done_log(log_msg, '.git');
}

function _create_urn_folder(){
	output_instance.start_loading(`Creating ${defaults.folder} folder...`);
	util_instance.fs.remove_directory(`${init_params.root}/${defaults.folder}`, 'init');
	util_instance.fs.create_directory(`${init_params.root}/${defaults.folder}`, 'init');
	output_instance.done_log(`Created folder ${defaults.folder}.`, 'init');
}


function _update_package_scripts(){
	output_instance.start_loading('Updating scripts...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		package_data['scripts'] = {
			...package_data['scripts'],
			'build': `uranio build`,
			'build:server': `uranio build:client`,
			'build:client': `uranio build:client`,
			'dev': `uranio dev`,
			'dev:server': `uranio dev:server`,
			'dev:client': `uranio dev:client`
		};
		try{
			util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
			output_instance.done_log(`Updated package.json scripts.`, 'alias');
		}catch(ex){
			output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

function _update_package_aliases(){
	output_instance.start_loading('Updating aliases...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		package_data['_moduleAliases'] = {
			'uranio': `./dist/${defaults.folder}/server/src/${defaults.repo_folder}/`,
			'uranio-books': `./dist/${defaults.folder}/server/src/books/`,
		};
		switch(init_params.repo){
			case 'trx':{
				package_data['_moduleAliases']['uranio-api'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/api/`;
				package_data['_moduleAliases']['uranio-core'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/api/core/`;
				break;
			}
			case 'api':{
				package_data['_moduleAliases']['uranio-core'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/api/core/`;
				break;
			}
			case 'core':{
				break;
			}
		}
		try{
			util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
			output_instance.done_log(`Updated package.json module aliases.`, 'alias');
		}catch(ex){
			output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

function _copy_dot_src_folder(){
	const dot_src_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/src`;
	const dest = `${init_params.root}/`;
	util_instance.fs.copy_directory(dot_src_folder, dest, 'dot');
}

function _copy_dot_tsconfigs(){
	const dot_tsc_file = `${init_params.root}/${defaults.tmp_folder}/urn-dot/tsconfig.json`;
	const dest = `${init_params.root}/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
	
	const dot_tsc_file_server = `${init_params.root}/${defaults.tmp_folder}/urn-dot/.uranio/server/tsconfig.json`;
	const dest_server = `${init_params.root}/.uranio/server/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
	
	const dot_tsc_file_client = `${init_params.root}/${defaults.tmp_folder}/urn-dot/.uranio/client/tsconfig.json`;
	const dest_client = `${init_params.root}/.uranio/client/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}

function _copy_dot_eslint_files(){
	const dot_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot`;
	const dest_folder = `${init_params.root}`;
	util_instance.fs.copy_file(
		`${dot_folder}/.eslintignore`,
		`${dest_folder}/.eslintignore`,
		'esln'
	);
	util_instance.fs.copy_file(
		`${dot_folder}/.eslintrc.js`,
		`${dest_folder}/.eslintrc.js`,
		'esln'
	);
}

function _copy_netlify_files(){
	const dot_deploy_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	
	const toml_file = `${dot_deploy_folder}/netlify/netlify.toml`;
	const toml_dest = `${init_params.root}/netlify.toml`;
	util_instance.fs.copy_file(toml_file, toml_dest, 'ntlf');
	
	const function_folder = `${init_params.root}/${defaults.folder}/server/src/functions`;
	if(!util_instance.fs.exists(function_folder)){
		util_instance.fs.create_directory(function_folder);
	}
	let api_file = `trx-api.txt`;
	if(init_params.repo === 'api'){
		api_file = `api-api.txt`;
	}
	const functions_file = `${dot_deploy_folder}/netlify/functions/${api_file}`;
	const functions_dest = `${function_folder}/api.ts`;
	util_instance.fs.copy_file(functions_file, functions_dest, 'dot');
}

function _copy_express_files(){
	const dot_deploy_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	const src_folder = `${init_params.root}/src`;
	if(!util_instance.fs.exists(src_folder)){
		util_instance.fs.create_directory(src_folder);
	}
	const index_file = `${dot_deploy_folder}/express/index.txt`;
	const index_dest = `${src_folder}/index.ts`;
	util_instance.fs.copy_file(index_file, index_dest, 'xprs');
}

async function _clone_core(){
	output_instance.start_loading(`Cloning core...`);
	await util_instance.cmd.clone_repo(
		defaults.core_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'core',
		init_params.branch
	);
	await util_instance.cmd.clone_repo(
		defaults.core_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'core',
		init_params.branch
	);
	output_instance.done_log(`Cloned core repo.`, 'core');
}

async function _clone_api(){
	output_instance.start_loading(`Cloning api...`);
	await util_instance.cmd.clone_repo_recursive(
		defaults.api_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'api',
		init_params.branch
	);
	await util_instance.cmd.clone_repo_recursive(
		defaults.api_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'api',
		init_params.branch
	);
	output_instance.done_log(`Cloned api repo.`, 'api');
}

async function _clone_trx(){
	output_instance.start_loading(`Cloning trx...`);
	await util_instance.cmd.clone_repo_recursive(
		defaults.trx_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'trx',
		init_params.branch
	);
	await util_instance.cmd.clone_repo_recursive(
		defaults.trx_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'trx',
		init_params.branch
	);
	output_instance.done_log(`Cloned trx repo.`, 'trx');
}

async function _install_dep()
		:Promise<true>{
	await _uninstall_core_dep();
	await _uninstall_api_dep();
	await _uninstall_trx_dep();
	switch(init_params.repo){
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
		case 'adm':{
			// await _install_adm_dep();
			return true;
		}
		default:{
			output_instance.log('init', `Selected repo is not valid. [${init_params.repo}]`);
			process.exit(1);
		}
	}
}

async function _uninstall_core_dep(){
	await _uninstall_dep(defaults.core_dep_repo, 'core');
	await _uninstall_dep(defaults.core_dep_dev_repo, 'core');
	return true;
}

async function _uninstall_api_dep(){
	await _uninstall_dep(defaults.api_dep_repo, 'api');
	await _uninstall_dep(defaults.api_dep_dev_repo, 'api');
	return true;
}

async function _uninstall_trx_dep(){
	await _uninstall_dep(defaults.trx_dep_repo, 'trx');
	await _uninstall_dep(defaults.trx_dep_dev_repo, 'trx');
	return true;
}

async function _uninstall_dep(repo:string, context:string){
	const short_repo = (repo.substr(0,3) === 'ssh' || repo.substr(0,7) === 'git+ssh') ?
		repo.split('/').slice(-1)[0] : repo;
	if(util_instance.cmd.dependency_exists(short_repo)){
		output_instance.start_loading(`Uninstalling ${short_repo} dep...`);
		const dep_folder = `${init_params.root}/node_modules/${short_repo}`;
		util_instance.fs.remove_directory(dep_folder, context);
		const dep_dev_folder = `${init_params.root}/node_modules/${short_repo}`;
		util_instance.fs.remove_directory(dep_dev_folder, context);
		await util_instance.cmd.uninstall_dep(`${short_repo}`, context);
		output_instance.done_log(`Uninstalled ${short_repo} dependencies.`, context);
		return true;
	}
}

async function _install_core_dep(){
	output_instance.start_loading(`Installing core dep...`);
	await util_instance.cmd.install_dep(defaults.core_dep_repo, 'core');
	await util_instance.cmd.install_dep_dev(defaults.core_dep_dev_repo, 'core');
	output_instance.done_log(`Installed core dependencies.`, 'core');
	return true;
}

async function _install_api_dep(){
	output_instance.start_loading(`Installing api dep...`);
	await util_instance.cmd.install_dep(defaults.api_dep_repo, 'api');
	await util_instance.cmd.install_dep_dev(defaults.api_dep_dev_repo, 'api');
	output_instance.done_log(`Installed api dependencies.`, 'api');
	return true;
}

async function _install_trx_dep(){
	output_instance.start_loading(`Installing trx dep...`);
	await util_instance.cmd.install_dep(defaults.trx_dep_repo, 'trx');
	await util_instance.cmd.install_dep_dev(defaults.trx_dep_dev_repo, 'trx');
	output_instance.done_log(`Installed trx dependencies.`, 'trx');
	return true;
}
