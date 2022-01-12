/**
 * Init command module
 *
 * @packageDocumentation
 */

import inquirer from 'inquirer';

import {urn_util} from 'urn-lib';

import {defaults, default_params} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as docker from './docker';

import {
	Arguments,
	Params,
	Repo,
	abstract_repos,
	abstract_pacman,
	abstract_deploy,
	abstract_db,
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

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let init_params = default_params;

export async function init(params:Partial<Params>)
		:Promise<void>{
	
	init_params = merge_init_params(params);
	
	output_instance = output.create(init_params);
	
	util_instance = util.create(init_params, output_instance);
	
	_log_important_params();
	_create_rc_file();
	_create_urn_folder();
	_create_client_server_folders();
	
	await _clone_assets_repo();
	_copy_assets();
	_create_dot_env();
	_ignore_files();
	_update_package_aliases();
	_update_package_scripts();
	_update_resolutions();
	
	if(init_params.docker === true){
		
		await docker.build(init_params);
		
	}else{
		
		await _init_pacman();
		await _clone_repo();
		await _install_repo();
		await _remove_git_files();
		
		await _copy_specific_assets();
		await _replace_aliases();
		
	}
	
	if(init_params.docker_db === true){
		await docker.network_create(init_params, true);
		await docker.db_create(init_params);
		await docker.db_start(init_params);
		docker.update_env();
	}
	
	_remove_tmp();
		
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
	output_instance.start_loading(`Initializing pacman...`);
	const yarn_lock = `${init_params.root}/yarn.lock`;
	if(init_params.pacman === 'yarn' && !util_instance.fs.exists(yarn_lock)){
		await util_instance.cmd.yarn_install();
	}
	output_instance.done_verbose_log(`Pacman initialized.`, 'pacman');
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
				await _ask_for_docker(args);
			});
	}else{
		await _ask_for_docker(args);
	}
}

async function _ask_for_docker(args:Arguments){
	const docker = args.k || args.docker;
	if(!docker && init_params.force === false){
		let confirm_msg = '';
		confirm_msg += `? Do you want to compile and run inside a docker container?\n`;
		const suffix = `? Docker need to be installed on your system.`;
		inquirer.
			prompt([
				{
					type: 'confirm',
					name: 'docker',
					message: confirm_msg,
					suffix: suffix
				}
			]).then(async (answers) => {
				if(answers.docker === true){
					init_params.docker = true;
				}
				await _ask_for_docker_db(args);
			});
	}else{
		await _ask_for_docker_db(args);
	}
}

async function _ask_for_docker_db(args:Arguments){
	const docker_db = args.docker_db;
	if(!docker_db && init_params.force === false){
		let confirm_msg = '';
		confirm_msg += `? Do you want to run the db in a docker container?\n`;
		const suffix = `? Docker need to be installed on your system.`;
		inquirer.
			prompt([
				{
					type: 'confirm',
					name: 'docker_db',
					message: confirm_msg,
					suffix: suffix
				}
			]).then(async (answers) => {
				if(answers.docker_db === true){
					init_params.docker_db = true;
					await _ask_for_db_type(args);
				}else{
					await _ask_for_repo(args);
				}
			});
	}else{
		await _ask_for_repo(args);
	}
}

async function _ask_for_db_type(args:Arguments){
	if(init_params.force === false){
		let confirm_msg = '';
		confirm_msg += `Select db:`;
		inquirer.
			prompt([
				{
					type: 'list',
					name: 'db',
					message: confirm_msg,
					choices: Object.keys(abstract_db)
				}
			]).then(async (answers) => {
				init_params.db = answers.db;
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

async function _add_admin_files(){
	output_instance.start_loading(`Adding admin files...`);
	const fix_file_nuxt_types =
		`${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
	if(!util_instance.fs.exists(fix_file_nuxt_types)){
		// util_instance.spawn.exec_sync(`touch ${fix_file_nuxt_types}`);
		await util_instance.spawn.spin(`touch ${fix_file_nuxt_types}`, 'adm', `adding nuxt file.`);
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

function _copy_assets(){
	_copy_book();
	_copy_sample();
	_copy_tsconfigs();
	_update_tsconfig_paths();
	_copy_eslint_files();
	_copy_main_files(init_params.repo);
}

async function _copy_specific_assets(){
	output_instance.start_loading(`Copying assets...`);
	if(valid_deploy_repos().includes(init_params.repo)){
		if(init_params.deploy === 'netlify'){
			_copy_netlify_files();
		}
	}
	if(valid_admin_repos().includes(init_params.repo)){
		await _add_admin_files();
		_copy_admin_files();
	}
	if(init_params.repo === 'trx'){
		_copy_trx_files();
	}
	output_instance.done_log(`Copied assets.`, 'assetes');
}

function _create_dot_env(){
	const dot_env_path = `${init_params.root}/.env`;
	if(util_instance.fs.exists(dot_env_path)){
		return;
	}
	util_instance.fs.copy_file(
		`${init_params.root}/sample.env`,
		dot_env_path
	);
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

async function _clone_assets_repo(){
	output_instance.start_loading(`Cloning assets...`);
	util_instance.fs.remove_directory(defaults.tmp_folder, 'assets');
	util_instance.fs.create_directory(defaults.tmp_folder, 'assets');
	await util_instance.cmd.clone_repo(
		defaults.assets_repo,
		`${init_params.root}/${defaults.tmp_folder}/uranio-assets`,
		'assets',
		init_params.branch
	);
	output_instance.done_log(`Cloned assets repo.`, 'assets');
}

async function _remove_git_files(){
	output_instance.start_loading(`Removing git files...`);
	const cloned_server_repo_path =
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`;
	const srv_cmd = `( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`;
	// util_instance.spawn.exec_sync(
	//   `( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`
	// );
	const srv_promise = util_instance.spawn.spin(srv_cmd, '.git', `removing srv .git files.`);
	const cloned_client_repo_path =
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`;
	const cln_cmd = `( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`;
	// util_instance.spawn.exec_sync(
	//   `( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`
	// );
	const cln_promise = util_instance.spawn.spin(cln_cmd, '.git', `removing cln .git files.`);
	await Promise.all([srv_promise, cln_promise]);
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
	content += `\t"deploy": "${init_params.deploy}",\n`;
	content += `\t"docker": ${init_params.docker},\n`;
	content += `\t"docker_db": ${init_params.docker_db},\n`;
	content += `\t"db": "${init_params.db}",\n`;
	content += `}`;
	util_instance.fs.write_file(`${init_params.root}/${defaults.json_filename}`, content);
	util_instance.pretty(`${init_params.root}/${defaults.json_filename}`, 'json');
	output_instance.done_log(`Created file ${defaults.json_filename}.`, 'rcfl');
}

function _ignore_files(){
	output_instance.start_loading(`Adding entries to .gitignore...`);
	const gitignore = `${init_params.root}/.gitignore`;
	if(!util_instance.fs.exists(gitignore)){
		util_instance.fs.create_file(gitignore, 'giti');
	}
	let content = util_instance.fs.read_file(gitignore, 'utf8');
	if(content.indexOf(defaults.folder+'/') === -1){
		content += `\n${defaults.folder}/`;
	}
	if(content.indexOf(defaults.log_filepath) === -1){
		content += `\n${defaults.log_filepath}`;
	}
	// if(content.indexOf(defaults.json_filename) === -1){
	//   content += `\n${defaults.json_filename}`;
	// }
	if(content.indexOf(`.env`) === -1){
		content += `\n.env`;
	}
	util_instance.fs.write_file(gitignore, content);
	const log_msg = `Added entries to .gitignore.`;
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
			output_instance.done_log(`Updated package.json scripts.`, 'scripts');
		}catch(ex){
			output_instance.error_log(`Cannot update ${package_json_path}.`, 'scripts');
		}
	}catch(ex){
		output_instance.error_log(`Cannot parse ${package_json_path}.`, 'scripts');
	}
}

function _update_resolutions(){
	output_instance.start_loading('Updating resolutions...');
	const package_json_path = `${init_params.root}/package.json`;
	const package_data = util_instance.cmd.get_package_data(package_json_path);
	const old_scripts = package_data['resolutions'] || {};
	package_data['resolutions'] = {
		...old_scripts,
		"@oclif/plugin-help": "3.2.14",
		"colors": "1.4.0"
	};
	try{
		util_instance.fs.write_file(
			package_json_path,
			JSON.stringify(package_data, null, '\t')
		);
		output_instance.done_log(`Updated package.json resolutions.`, 'packdata');
	}catch(ex){
		output_instance.error_log(`Cannot update ${package_json_path}.`, 'packdata');
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

function _copy_book(){
	const book_file =
		`${init_params.root}/${defaults.tmp_folder}/uranio-assets/main/book.txt`;
	const dest = `${init_params.root}/src/book.ts`;
	if(!util_instance.fs.exists(dest)){
		util_instance.fs.copy_file(book_file, dest, 'book');
	}
}

function _copy_sample(){
	const sample_file =
		`${init_params.root}/${defaults.tmp_folder}/uranio-assets/env/sample.env`;
	const dest = `${init_params.root}/sample.env`;
	util_instance.fs.copy_file(sample_file, dest, 'book');
}

function _copy_tsconfigs(){
	
	const ass_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets`;
	const ts_dir = `${ass_dir}/typescript`;
	const dot_tsc_file = `${ts_dir}/root/tsconfig.json`;
	const dest = `${init_params.root}/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file, dest, 'tsco');
	
	const dot_tsc_file_server =
		`${ts_dir}/server/${init_params.deploy}/tsconfig.json`;
	const dest_server = `${init_params.root}/.uranio/server/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
	
	const dot_tsc_file_client =
		`${ts_dir}/client/tsconfig.json`;
	const dest_client = `${init_params.root}/.uranio/client/tsconfig.json`;
	util_instance.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}

function _copy_eslint_files(){
	const eslint_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets/eslint`;
	const dest_dir = `${init_params.root}`;
	util_instance.fs.copy_file(
		`${eslint_dir}/.eslintignore`,
		`${dest_dir}/.eslintignore`,
		'esln'
	);
	util_instance.fs.copy_file(
		`${eslint_dir}/.eslintrc.js`,
		`${dest_dir}/.eslintrc.js`,
		'esln'
	);
	util_instance.fs.copy_file(
		`${eslint_dir}/.stylelintrc.json`,
		`${dest_dir}/.stylelintrc.json`,
		'esln'
	);
}

function _copy_netlify_files(){
	const netlify_dir =
		`${init_params.root}/${defaults.tmp_folder}/uranio-assets/netlify`;
	
	const toml_file = `${netlify_dir}/netlify.toml`;
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
	const functions_file = `${netlify_dir}/functions/${api_file}`;
	const functions_dest = `${function_folder}/api.ts`;
	util_instance.fs.copy_file(functions_file, functions_dest, 'assets');
}

function _copy_admin_files(){
	const nuxt_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets/nuxt`;
	const nuxt_config_file = `${nuxt_dir}/nuxt.config.${init_params.deploy}.js`;
	const nuxt_config_dest = `${init_params.root}/${defaults.folder}/client/nuxt.config.js`;
	util_instance.fs.copy_file(nuxt_config_file, nuxt_config_dest, 'adm');
}

function _copy_trx_files(){
	const assets_dir = `${init_params.root}/${defaults.tmp_folder}/uranio-assets/`;
	const trx_main_dir = `${assets_dir}/main/trx`;
	const dist_folder = `${init_params.root}/dist`;
	if(!util_instance.fs.exists(dist_folder)){
		util_instance.fs.create_directory(dist_folder, 'trx');
	}
	const html_file = `${trx_main_dir}/index.html`;
	const html_dest = `${dist_folder}/index.html`;
	util_instance.fs.copy_file(html_file, html_dest, 'trx');
	const webpack_config = `${assets_dir}/webpack/webpack.config.js`;
	const webpack_dest = `${init_params.root}/${defaults.folder}/client/webpack.config.js`;
	util_instance.fs.copy_file(webpack_config, webpack_dest, 'trx');
}

function _copy_main_files(repo:Repo){
	const core_assets_dir =
		`${init_params.root}/${defaults.tmp_folder}/uranio-assets/main/${repo}`;
	const src_folder = `${init_params.root}/src`;
	if(!util_instance.fs.exists(src_folder)){
		util_instance.fs.create_directory(src_folder);
	}
	const index_file = `${core_assets_dir}/index.txt`;
	const index_dest = `${src_folder}/index.ts`;
	const repo_dest = `${src_folder}/${repo}.ts`;
	util_instance.fs.copy_file(index_file, repo_dest, 'core');
	if(!util_instance.fs.exists(index_dest)){
		util_instance.fs.copy_file(index_file, index_dest, 'core');
	}
}

async function _clone_core(){
	output_instance.start_loading(`Cloning core...`);
	const def_folder = `${init_params.root}/${defaults.folder}`;
	const server_uranio_dir = `${def_folder}/server/src/${defaults.repo_folder}`;
	const client_uranio_dir = `${def_folder}/client/src/${defaults.repo_folder}`;
	await util_instance.cmd.clone_repo(
		defaults.core_repo,
		server_uranio_dir,
		'core',
		init_params.branch
	);
	util_instance.fs.copy_directory(server_uranio_dir, client_uranio_dir);
	output_instance.done_verbose_log(`Cloned core repo.`, 'core');
}

async function _clone_api(){
	output_instance.start_loading(`Cloning api...`);
	const def_folder = `${init_params.root}/${defaults.folder}`;
	const server_uranio_dir = `${def_folder}/server/src/${defaults.repo_folder}`;
	const client_uranio_dir = `${def_folder}/client/src/${defaults.repo_folder}`;
	await util_instance.cmd.clone_repo_recursive(
		defaults.api_repo,
		server_uranio_dir,
		'api',
		init_params.branch
	);
	util_instance.fs.copy_directory(server_uranio_dir, client_uranio_dir);
	output_instance.done_verbose_log(`Cloned api repo.`, 'api');
}

async function _clone_trx(){
	output_instance.start_loading(`Cloning trx...`);
	const def_folder = `${init_params.root}/${defaults.folder}`;
	const server_uranio_dir = `${def_folder}/server/src/${defaults.repo_folder}`;
	const client_uranio_dir = `${def_folder}/client/src/${defaults.repo_folder}`;
	await util_instance.cmd.clone_repo_recursive(
		defaults.trx_repo,
		server_uranio_dir,
		'trx',
		init_params.branch
	);
	util_instance.fs.copy_directory(server_uranio_dir, client_uranio_dir);
	output_instance.done_verbose_log(`Cloned trx repo.`, 'trx');
}

async function _clone_adm(){
	output_instance.start_loading(`Cloning adm...`);
	const def_folder = `${init_params.root}/${defaults.folder}`;
	const server_uranio_dir = `${def_folder}/server/src/${defaults.repo_folder}`;
	const client_uranio_dir = `${def_folder}/client/src/${defaults.repo_folder}`;
	await util_instance.cmd.clone_repo_recursive(
		defaults.adm_repo,
		server_uranio_dir,
		'adm',
		init_params.branch
	);
	util_instance.fs.copy_directory(server_uranio_dir, client_uranio_dir);
	// await sleep(3000);
	output_instance.done_verbose_log(`Cloned adm repo.`, 'adm');
}

// function sleep(ms:number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

async function _install_dep()
		:Promise<true>{
	const pack_data = util_instance.cmd.get_package_data(
		`${init_params.root}/package.json`
	);
	await util_instance.cmd.uninstall_core_dep(pack_data);
	await util_instance.cmd.uninstall_api_dep(pack_data);
	await util_instance.cmd.uninstall_trx_dep(pack_data);
	await util_instance.cmd.uninstall_adm_dep(pack_data);
	switch(init_params.repo){
		case 'core':{
			await util_instance.cmd.install_core_dep();
			return true;
		}
		case 'api':{
			await util_instance.cmd.install_api_dep();
			return true;
		}
		case 'trx':{
			await util_instance.cmd.install_trx_dep();
			return true;
		}
		case 'adm':{
			await util_instance.cmd.install_adm_dep();
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

