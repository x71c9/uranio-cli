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
	Repo,
	abstract_repos,
	abstract_pacman,
	abstract_deploy,
	valid_deploy_repos,
	valid_admin_repos
} from '../types';

import {alias} from './alias';

import {title} from './title';

import {
	merge_init_params,
	check_repo,
	check_deploy,
	check_pacman
} from './common';

// import {InitParams} from './types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let init_params = default_params;

export async function init(params:Partial<Params>)
		:Promise<void>{
	
	init_params = merge_init_params(params);
	
	output_instance = output.create(init_params);
	
	util_instance = util.create(init_params, output_instance);
	
	_log_important_params();
	await _init_pacman();
	_update_package_aliases();
	_update_package_scripts();
	_create_urn_folder();
	_ignore_urn_folder();
	_create_rc_file();
	_create_client_server_folders();
	await _clone_repo();
	await _install_repo();
	_remove_git_files();
	await _clone_dot();
	_copy_dot_files();
	_remove_tmp();
	await _replace_aliases();
	
	output_instance.end_log(`Initialization completed.`);
}

export async function prompt_init(params:Params, args:Arguments)
		:Promise<void>{
	
	init_params = params;
	
	output_instance = output.create(params);
	
	util_instance = util.create(init_params, output_instance);
	
	console.clear();
	
	title();
	
	if(util_instance.is_initialized() && init_params.force === false){
		
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

function _log_important_params(){
	output_instance.verbose_log(
		`$URNROOT$Project root: [${init_params.root}]`,
		'root'
	);
	output_instance.verbose_log(
		`Selected repository: [${init_params.repo}]`,
		'repo'
	);
	output_instance.verbose_log(
		`Selected pacman: [${init_params.pacman}]`,
		'repo'
	);
	if(valid_deploy_repos().includes(init_params.repo)){
		output_instance.verbose_log(
			`Selected deploy: [${init_params.deploy}]`,
			'dply'
		);
	}
}

async function _init_pacman(){
	const yarn_lock = `${init_params.root}/yarn.lock`;
	if(init_params.pacman === 'yarn' && !util_instance.fs.exists(yarn_lock)){
		await util_instance.cmd.yarn_install();
	}
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
				init_params.repo = answers.repo;
				
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
				init_params.deploy = answers.deploy;
				
				await init(init_params);
				
			});
		
	}else{
		
		await init(init_params);
		
	}
}

function _add_admin_files(){
	output_instance.start_loading(`Adding admin files...`);
	const fix_file_nuxt_types =
		`${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
	if(!util_instance.fs.exists(fix_file_nuxt_types)){
		util_instance.spawn.exec_sync(`touch ${fix_file_nuxt_types}`);
	}
	output_instance.done_verbose_log('Added admin files.', 'adm');
}

async function _replace_aliases(){
	output_instance.start_loading(`Updating relative paths aliases...`);
	await alias(init_params, true);
	output_instance.done_verbose_log('Updated relative paths aliases.', 'alias');
}

function _remove_tmp(){
	output_instance.start_loading(
		`Removing tmp folder [${defaults.tmp_folder}]...`
	);
	util_instance.fs.remove_directory(
		`${init_params.root}/${defaults.tmp_folder}`,
		'tmp'
	);
	output_instance.done_verbose_log(
		`Removed tmp folder [${defaults.tmp_folder}].`,
		'tmp'
	);
}

function _copy_dot_files(){
	
	_copy_book();
	
	_copy_sample();
	
	_copy_dot_tsconfigs();
	
	_update_tsconfig_paths();
	
	_copy_dot_eslint_files();
	
	if(valid_deploy_repos().includes(init_params.repo)){
		if(init_params.deploy === 'netlify'){
			_copy_netlify_files();
		}else{
			_copy_express_files();
		}
	}
	if(init_params.repo === 'trx'){
		_copy_trx_files();
	}
	if(init_params.repo === 'core'){
		_copy_core_files();
	}
	
	if(valid_admin_repos().includes(init_params.repo)){
		_add_admin_files();
		_copy_admin_files();
	}
	
}

function _update_tsconfig_paths(){
	const prefix = init_params.is_dot === true ? '.' : `${defaults.folder}/server`;
	const main_paths = _generate_paths_server(init_params.repo, prefix);
	const real_paths_server = _generate_paths_server(init_params.repo, `.`);
	const real_paths_client = _generate_paths_client(init_params.repo, `.`);
	
	const main_tsconfig = `tsconfig.json`;
	_update_paths(main_tsconfig, main_paths);
	
	const real_tsconfig_server = `.uranio/server/tsconfig.json`;
	_update_paths(real_tsconfig_server, real_paths_server);
	
	const real_tsconfig_client = `.uranio/client/tsconfig.json`;
	_update_paths(real_tsconfig_client, real_paths_client);
}

function _update_paths(tsconfig_filepath:string, paths:string){
	if(!util_instance.fs.exists(tsconfig_filepath)){
		util_instance.fs.write_file(tsconfig_filepath, '');
	}
	const content = util_instance.fs.read_file(tsconfig_filepath, 'utf8');
	const tsdata = JSON.parse(content);
	if(!tsdata.compilerOptions){
		tsdata.compilerOptions = {};
	}
	if(!tsdata.compilerOptions.paths){
		tsdata.compilerOptions.paths = [];
	}
	tsdata.compilerOptions.paths = paths;
	util_instance.fs.write_file(
		tsconfig_filepath,
		JSON.stringify(tsdata, null, '\t')
	);
}

function _generate_paths_server(repo:Repo, prefix:string){
	const paths = {} as any;
	paths['uranio'] = [`${prefix}/src/uranio`];
	paths['uranio-books'] = [`${prefix}/src/books`];
	paths['uranio-books/*'] = [`${prefix}/src/books/*`];
	switch(repo){
		case 'core':{
			break;
		}
		case 'api':{
			paths['uranio-core'] = [`${prefix}/src/uranio/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/core/*`];
			break;
		}
		case 'trx':{
			paths['uranio-core'] = [`${prefix}/src/uranio/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/api/*`];
			break;
		}
		case 'adm':{
			paths['uranio-core'] = [`${prefix}/src/uranio/trx/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/trx/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/trx/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/trx/api/*`];
			paths['uranio-trx'] = [`${prefix}/src/uranio/trx`];
			paths['uranio-trx/*'] = [`${prefix}/src/uranio/trx/*`];
			break;
		}
	}
	return paths;
}

function _generate_paths_client(repo:Repo, prefix:string){
	const paths = {} as any;
	paths['uranio'] = [`${prefix}/src/uranio/client`];
	paths['uranio-books'] = [`${prefix}/src/books`];
	paths['uranio-books/*'] = [`${prefix}/src/books/*`];
	switch(repo){
		case 'core':{
			break;
		}
		case 'api':{
			paths['uranio-core'] = [`${prefix}/src/uranio/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/core/*`];
			break;
		}
		case 'trx':{
			paths['uranio-core'] = [`${prefix}/src/uranio/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/api/*`];
			break;
		}
		case 'adm':{
			paths['uranio-core'] = [`${prefix}/src/uranio/trx/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/trx/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/trx/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/trx/api/*`];
			paths['uranio-trx'] = [`${prefix}/src/uranio/trx`];
			paths['uranio-trx/*'] = [`${prefix}/src/uranio/trx/*`];
			break;
		}
	}
	return paths;
}

async function _clone_dot(){
	output_instance.start_loading(`Cloning dot...`);
	util_instance.fs.remove_directory(defaults.tmp_folder, 'dot');
	util_instance.fs.create_directory(defaults.tmp_folder, 'dot');
	await util_instance.cmd.clone_repo(
		defaults.dot_repo,
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot`,
		'dot',
		init_params.branch
	);
	output_instance.done_log(`Cloned dot repo.`, 'dot');
}

function _remove_git_files(){
	output_instance.start_loading(`Removing git files...`);
	const cloned_server_repo_path =
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`;
	util_instance.spawn.exec_sync(
		`( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`
	);
	const cloned_client_repo_path =
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`;
	util_instance.spawn.exec_sync(
		`( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`
	);
	output_instance.done_log(`Removed uranio .git files.`, '.git');
}

async function _clone_repo(){
	output_instance.start_loading(
		`Cloning [${init_params.repo}]...`
	);
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
		case 'adm':{
			await _clone_adm();
			break;
		}
		default:{
			output_instance.error_log(
				`Selected repo is not valid. [${init_params.repo}]`,
				'init'
			);
			process.exit(1);
		}
	}
	output_instance.done_log(
		`Cloned repo [${init_params.repo}].`,
		'repo'
	);
}

async function _install_repo(){
	output_instance.start_loading(
		`Intalling [${init_params.repo}]...`
	);
	await _install_dep();
	output_instance.done_log(
		`Installed repo [${init_params.repo}].`,
		'repo'
	);
}

function _create_client_server_folders(){
	output_instance.start_loading(`Creating server folder...`);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/server`,
		'init'
	);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/server/src`,
		'init'
	);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/server/src/books`,
		'init'
	);
	output_instance.done_verbose_log(`Created server folders.`, 'init');

	output_instance.start_loading(`Creating client folder...`);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/client`,
		'init'
	);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/client/src`,
		'init'
	);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}/client/src/books`,
		'init'
	);
	output_instance.done_verbose_log(`Created client folders.`, 'init');
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
	if(content.indexOf(defaults.folder+'/') === -1 || content.indexOf(defaults.folder)){
		content += `\n${defaults.folder}/`;
	}
	if(content.indexOf(defaults.log_filepath) === -1){
		content += `\n${defaults.log_filepath}`;
	}
	util_instance.fs.write_file(gitignore, content);
	const log_msg =
		`Added ${defaults.folder} and ${defaults.log_filepath} to .gitignore.`;
	output_instance.done_log(log_msg, '.git');
}

function _create_urn_folder(){
	output_instance.start_loading(`Creating ${defaults.folder} folder...`);
	util_instance.fs.remove_directory(
		`${init_params.root}/${defaults.folder}`,
		'init'
	);
	util_instance.fs.create_directory(
		`${init_params.root}/${defaults.folder}`,
		'init'
	);
	output_instance.done_log(`Created folder ${defaults.folder}.`, 'init');
}


function _update_package_scripts(){
	output_instance.start_loading('Updating scripts...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		const old_scripts = package_data['scripts'] || {};
		package_data['scripts'] = {
			...old_scripts,
			'build': `uranio build`,
			'build:server': `uranio build:client`,
			'build:client': `uranio build:client`,
			'dev': `uranio dev`,
			'dev:server': `uranio dev:server`,
			'dev:client': `uranio dev:client`
		};
		try{
			util_instance.fs.write_file(
				package_json_path,
				JSON.stringify(package_data, null, '\t')
			);
			output_instance.done_log(`Updated package.json scripts.`, 'alias');
		}catch(ex){
			output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

function _update_package_aliases(){
	output_instance.start_loading('Updating package.json aliases...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = util_instance.fs.read_file(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		package_data['_moduleAliases'] = {
			'uranio': `./dist/${defaults.folder}/server/src/${defaults.repo_folder}/`,
			'uranio-books': `./dist/${defaults.folder}/server/src/books/`,
		};
		switch(init_params.repo){
			case 'adm':{
				package_data['_moduleAliases']['uranio-trx'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/trx/`;
				package_data['_moduleAliases']['uranio-api'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/trx/api/`;
				package_data['_moduleAliases']['uranio-core'] =
					`./dist/${defaults.folder}/server/src/${defaults.repo_folder}/trx/api/core/`;
				break;
			}
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
			util_instance.fs.write_file(
				package_json_path,
				JSON.stringify(package_data, null, '\t')
			);
			output_instance.done_log(`Updated package.json module aliases.`, 'alias');
		}catch(ex){
			output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

// function _copy_dot_src_folder(){
//   const dot_src_folder =
//     `${init_params.root}/${defaults.tmp_folder}/urn-dot/src`;
//   const dest = `${init_params.root}/src`;
//   util_instance.fs.copy_directory(dot_src_folder, dest, 'dot');
// }

function _copy_book(){
	const book_file =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/book.txt`;
	const dest = `${init_params.root}/src/book.ts`;
	if(!util_instance.fs.exists(dest)){
		util_instance.fs.copy_file(book_file, dest, 'book');
	}
}

function _copy_sample(){
	const sample_file =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/sample.env`;
	const dest = `${init_params.root}/sample.env`;
	// if(!util_instance.fs.exists(dest)){
	util_instance.fs.copy_file(sample_file, dest, 'book');
	// }
}

function _copy_dot_tsconfigs(){
	const dot_tsc_file =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/tsconfig.json`;
	const dest = `${init_params.root}/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
	
	const dot_tsc_file_server =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/server/tsconfig.json`;
	const dest_server = `${init_params.root}/.uranio/server/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
	
	const dot_tsc_file_client =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/client/tsconfig.json`;
	const dest_client = `${init_params.root}/.uranio/client/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}

function _copy_dot_eslint_files(){
	const dot_folder = `${init_params.root}/${defaults.tmp_folder}/uranio-dot`;
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
	const dot_deploy_folder =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/deploy`;
	
	const toml_file = `${dot_deploy_folder}/netlify/netlify.toml`;
	const toml_dest = `${init_params.root}/netlify.toml`;
	util_instance.fs.copy_file(toml_file, toml_dest, 'ntlf');
	
	const function_folder =
		`${init_params.root}/${defaults.folder}/server/src/functions`;
	if(!util_instance.fs.exists(function_folder)){
		util_instance.fs.create_directory(function_folder);
	}
	let api_file = `api.txt`;
	if(init_params.repo === 'api'){
		api_file = `api-api.txt`;
	}
	const functions_file = `${dot_deploy_folder}/netlify/functions/${api_file}`;
	const functions_dest = `${function_folder}/api.ts`;
	util_instance.fs.copy_file(functions_file, functions_dest, 'dot');
}

function _copy_admin_files(){
	// const dot_client_folder =
	//   `${init_params.root}/${defaults.tmp_folder}/urn-dot/${defaults.folder}/client`;
	
	// const nuxt_config_file = `${dot_client_folder}/nuxt.config.js`;
	// const nuxt_config_dest = `${init_params.root}/${defaults.folder}/client/nuxt.config.js`;
	// util_instance.fs.copy_file(nuxt_config_file, nuxt_config_dest, 'adm');
	
	const dot_files_folder = `${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/`;
	const nuxt_config_file = `${dot_files_folder}/client/nuxt.config.js`;
	const nuxt_config_dest = `${init_params.root}/${defaults.folder}/client/nuxt.config.js`;
	util_instance.fs.copy_file(nuxt_config_file, nuxt_config_dest, 'adm');
}

function _copy_express_files(){
	const dot_deploy_folder =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/deploy`;
	const src_folder = `${init_params.root}/src`;
	if(!util_instance.fs.exists(src_folder)){
		util_instance.fs.create_directory(src_folder);
	}
	const index_file = `${dot_deploy_folder}/express/index.txt`;
	const index_dest = `${src_folder}/express.ts`;
	util_instance.fs.copy_file(index_file, index_dest, 'xprs');
}

function _copy_trx_files(){
	const trx_asset_dir =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/trx`;
	const src_folder = `${init_params.root}/src`;
	if(!util_instance.fs.exists(src_folder)){
		util_instance.fs.create_directory(src_folder);
	}
	const index_file = `${trx_asset_dir}/index.txt`;
	const index_dest = `${src_folder}/trx.ts`;
	util_instance.fs.copy_file(index_file, index_dest, 'trx');
	
	const dist_folder = `${init_params.root}/dist`;
	if(!util_instance.fs.exists(dist_folder)){
		util_instance.fs.create_directory(dist_folder, 'trx');
	}
	const html_file = `${trx_asset_dir}/index.html`;
	const html_dest = `${dist_folder}/index.html`;
	util_instance.fs.copy_file(html_file, html_dest, 'trx');
	
	const webpack_config = `${trx_asset_dir}/webpack.config.js`;
	const webpack_dest = `${init_params.root}/${defaults.folder}/client/webpack.config.js`;
	util_instance.fs.copy_file(webpack_config, webpack_dest, 'trx');
}

function _copy_core_files(){
	const core_assets_dir =
		`${init_params.root}/${defaults.tmp_folder}/uranio-dot/assets/core`;
	const src_folder = `${init_params.root}/src`;
	if(!util_instance.fs.exists(src_folder)){
		util_instance.fs.create_directory(src_folder);
	}
	const index_file = `${core_assets_dir}/index.txt`;
	const index_dest = `${src_folder}/core.ts`;
	util_instance.fs.copy_file(index_file, index_dest, 'core');
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
	output_instance.done_verbose_log(`Cloned core repo.`, 'core');
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
	output_instance.done_verbose_log(`Cloned api repo.`, 'api');
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
	output_instance.done_verbose_log(`Cloned trx repo.`, 'trx');
}

async function _clone_adm(){
	output_instance.start_loading(`Cloning adm...`);
	await util_instance.cmd.clone_repo_recursive(
		defaults.adm_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'adm',
		init_params.branch
	);
	await util_instance.cmd.clone_repo_recursive(
		defaults.adm_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'adm',
		init_params.branch
	);
	output_instance.done_verbose_log(`Cloned adm repo.`, 'adm');
}

async function _install_dep()
		:Promise<true>{
	const pack_data = util_instance.cmd.get_package_data(
		`${init_params.root}/package.json`
	);
	await _uninstall_core_dep(pack_data);
	await _uninstall_api_dep(pack_data);
	await _uninstall_trx_dep(pack_data);
	await _uninstall_adm_dep(pack_data);
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
			await _install_adm_dep();
			return true;
		}
		default:{
			output_instance.log(
				`Selected repo is not valid. [${init_params.repo}]`,
				'init'
			);
			process.exit(1);
		}
	}
}

async function _uninstall_core_dep(pack_data?:any){
	await _uninstall_dep(defaults.core_dep_repo, 'core', pack_data);
	await _uninstall_dep(defaults.core_dep_dev_repo, 'core', pack_data);
	return true;
}

async function _uninstall_api_dep(pack_data?:any){
	await _uninstall_dep(defaults.api_dep_repo, 'api', pack_data);
	await _uninstall_dep(defaults.api_dep_dev_repo, 'api', pack_data);
	return true;
}

async function _uninstall_trx_dep(pack_data?:any){
	await _uninstall_dep(defaults.trx_dep_repo, 'trx', pack_data);
	await _uninstall_dep(defaults.trx_dep_dev_repo, 'trx', pack_data);
	return true;
}

async function _uninstall_adm_dep(pack_data?:any){
	await _uninstall_dep(defaults.adm_dep_repo, 'adm', pack_data);
	await _uninstall_dep(defaults.adm_dep_dev_repo, 'adm', pack_data);
	return true;
}

async function _uninstall_dep(repo:string, context:string, pack_data?:any){
	const short_repo =
		(repo.substr(0,3) === 'ssh' || repo.substr(0,7) === 'git+ssh') ?
			repo.split('/').slice(-1)[0] : repo;
	if(util_instance.cmd.dependency_exists(short_repo, pack_data)){
		output_instance.start_loading(`Uninstalling ${short_repo} dep...`);
		const dep_folder = `${init_params.root}/node_modules/${short_repo}`;
		util_instance.fs.remove_directory(dep_folder, context);
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

async function _install_adm_dep(){
	output_instance.start_loading(`Installing adm dep...`);
	await util_instance.cmd.install_dep(defaults.adm_dep_repo, 'adm');
	await util_instance.cmd.install_dep_dev(defaults.adm_dep_dev_repo, 'adm');
	output_instance.done_log(`Installed adm dependencies.`, 'adm');
	return true;
}
