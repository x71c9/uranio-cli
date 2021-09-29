/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {urn_util} from 'urn-lib';

import {
	Repo,
	PacMan,
	Deploy,
} from '../types';

import {defaults, jsonfile_path} from '../conf/defaults';

import * as out from '../output/';

import * as utl from '../util/';

// import {alias} from './alias';

type InitParams = {
	root: string
	repo: Repo
	deploy: Deploy
	pacman: PacMan
	branch: string
}

const init_params:InitParams = {
	root: '.',
	repo: defaults.default_repo,
	deploy: 'netlify',
	pacman: 'yarn',
	branch: 'master'
};

let output:out.OutputInstance;
let util:utl.UtilInstance;

export async function init(params:InitParams, output_params:out.OutputParams)
		:Promise<void>{
	
	if(!output_params.root){
		output_params.root = params.root;
	}
	output = out.create(output_params);
	
	util = utl.create(output);
	
	init_params.root = params.root;
	init_params.repo = params.repo;
	init_params.deploy = params.deploy;
	init_params.pacman = params.pacman;
	init_params.branch = params.branch;
	
	output.verbose_log(`$URNROOT$Project root: [${init_params.root}]`, 'root');
	output.verbose_log(`Selected repo: [${init_params.repo}]`, 'repo');
	if(init_params.repo === 'api'){
		output.verbose_log(`Selected deploy: [${init_params.deploy}]`, 'dply');
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
	
	output.end_log(`Initialization completed.`);
}

function _add_admin_files(){
	output.start_loading(`Adding admin files...`);
	const fix_file_nuxt_types = `${init_params.root}/node_modules/@nuxt/types/node_modules/index.d.ts`;
	if(!fs.existsSync(fix_file_nuxt_types)){
		util.sync_exec(`touch ${fix_file_nuxt_types}`);
	}
}

function _replace_aliases(){
	output.start_loading(`Updating relative paths aliases...`);
	// alias.include(init_params.root, init_params.repo);
}

function _remove_tmp(){
	output.start_loading(`Removing tmp folder [${defaults.tmp_folder}]...`);
	util.fs.remove_directory(`${init_params.root}/${defaults.tmp_folder}`, 'tmp');
	output.done_verbose_log(`Removed tmp folder [${defaults.tmp_folder}].`, 'tmp');
}

function _copy_dot_files(){
	if(fs.existsSync(`${init_params.root}/src`) === false){
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
	output.start_loading(`Cloning dot...`);
	util.fs.remove_directory(defaults.tmp_folder, 'dot');
	util.fs.create_directory(defaults.tmp_folder, 'dot');
	await util.cmd.clone_repo(
		defaults.dot_repo,
		`${init_params.root}/${defaults.tmp_folder}/urn-dot`,
		'dot',
		init_params.branch
	);
	output.done_log(`Cloned dot repo.`, 'dot');
}

function _remove_git_files(){
	output.start_loading(`Removing git files...`);
	const cloned_server_repo_path = `${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`;
	util.sync_exec(`( find ${cloned_server_repo_path} -name ".git*" ) | xargs rm -rf`);
	const cloned_client_repo_path = `${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`;
	util.sync_exec(`( find ${cloned_client_repo_path} -name ".git*" ) | xargs rm -rf`);
	output.done_log(`Removed uranio .git files.`, '.git');
}

async function _clone_and_install_repo(){
	output.start_loading(`Cloning and intalling [${init_params.repo}]...`);
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
			output.log(`Selected repo is not valid. [${init_params.repo}]`, 'init');
			process.exit(1);
		}
	}
	await _install_dep();
	output.done_log(`Cloned and installed repo [${init_params.repo}].`, 'repo');
}

function _create_client_server_folders(){
	output.start_loading(`Creating server folder...`);
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/server`, 'init');
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/server/src`, 'init');
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/server/src/books`, 'init');
	output.start_loading(`Creating client folder...`);
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/client`, 'init');
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/client/src`, 'init');
	util.fs.create_directory(`${init_params.root}/${defaults.folder}/client/src/books`, 'init');
	output.done_log(`Created client server folders.`, 'init');
}

function _create_rc_file(){
	output.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `\t"repo": "${init_params.repo}",\n`;
	content += `\t"pacman": "${init_params.pacman}",\n`;
	content += `\t"deploy": "${init_params.deploy}"\n`;
	content += `}`;
	fs.writeFileSync(`${init_params.root}/${jsonfile_path}`, content);
	util.pretty(`${init_params.root}/${jsonfile_path}`, 'json');
	output.done_log(`Created file ${jsonfile_path}.`, 'rcfl');
}

function _ignore_urn_folder(){
	output.start_loading(`Adding ${defaults.folder} to .gitignore...`);
	const gitignore = `${init_params.root}/.gitignore`;
	if(!fs.existsSync(gitignore)){
		util.fs.create_file(gitignore, 'giti');
	}
	let content = fs.readFileSync(gitignore, 'utf8');
	if(content.indexOf(defaults.folder+'/') === -1){
		content += `\n${defaults.folder}/`;
	}
	if(content.indexOf(defaults.log_filepath+'/') === -1){
		content += `\n${defaults.log_filepath}`;
	}
	fs.writeFileSync(gitignore, content);
	const log_msg = `Added ${defaults.folder} and ${defaults.log_filepath} to .gitignore.`;
	output.done_log(log_msg, '.git');
}

function _create_urn_folder(){
	output.start_loading(`Creating ${defaults.folder} folder...`);
	util.fs.remove_directory(`${init_params.root}/${defaults.folder}`, 'init');
	util.fs.create_directory(`${init_params.root}/${defaults.folder}`, 'init');
	output.done_log(`Created folder ${defaults.folder}.`, 'init');
}


function _update_package_scripts(){
	output.start_loading('Updating scripts...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = fs.readFileSync(package_json_path, 'utf8');
	try{
		const package_data = urn_util.json.clean_parse(data);
		package_data['scripts'] = {
			'build': `uranio build`,
			'build:server': `uranio build:client`,
			'build:client': `uranio build:client`,
			'dev': `uranio dev`,
			'dev:server': `uranio dev:server`,
			'dev:client': `uranio dev:client`
		};
		try{
			fs.writeFileSync(package_json_path, JSON.stringify(package_data, null, '\t'));
			output.done_log(`Updated package.json scripts.`, 'alias');
		}catch(ex){
			output.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

function _update_package_aliases(){
	output.start_loading('Updating aliases...');
	const package_json_path = `${init_params.root}/package.json`;
	const data = fs.readFileSync(package_json_path, 'utf8');
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
			fs.writeFileSync(package_json_path, JSON.stringify(package_data, null, '\t'));
			output.done_log(`Updated package.json module aliases.`, 'alias');
		}catch(ex){
			output.error_log(`Cannot update ${package_json_path}.`, 'alias');
		}
	}catch(ex){
		output.error_log(`Cannot parse ${package_json_path}.`, 'alias');
	}
}

function _copy_dot_src_folder(){
	const dot_src_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/src`;
	const dest = `${init_params.root}/`;
	util.fs.copy_directory(dot_src_folder, dest, 'dot');
}

function _copy_dot_tsconfigs(){
	const dot_tsc_file = `${init_params.root}/${defaults.tmp_folder}/urn-dot/tsconfig.json`;
	const dest = `${init_params.root}/`;
	util.fs.copy_file(dot_tsc_file, dest, 'tsco');
	
	const dot_tsc_file_server = `${init_params.root}/${defaults.tmp_folder}/urn-dot/.uranio/server/tsconfig.json`;
	const dest_server = `${init_params.root}/.uranio/server/`;
	util.fs.copy_file(dot_tsc_file_server, dest_server, 'tscs');
	
	const dot_tsc_file_client = `${init_params.root}/${defaults.tmp_folder}/urn-dot/.uranio/client/tsconfig.json`;
	const dest_client = `${init_params.root}/.uranio/client/`;
	util.fs.copy_file(dot_tsc_file_client, dest_client, 'tscc');
}

function _copy_dot_eslint_files(){
	const dot_eslint_files = `${init_params.root}/${defaults.tmp_folder}/urn-dot/.eslint*`;
	const dest = `${init_params.root}/`;
	util.fs.copy_file(dot_eslint_files, dest, 'esln');
}

function _copy_netlify_files(){
	const dot_deploy_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	
	const toml_file = `${dot_deploy_folder}/netlify/netlify.toml`;
	const toml_dest = `${init_params.root}/`;
	util.fs.copy_file(toml_file, toml_dest, 'ntlf');
	
	const function_folder = `${init_params.root}/${defaults.folder}/server/src/functions`;
	if(!fs.existsSync(function_folder)){
		fs.mkdirSync(function_folder);
	}
	let api_file = `trx-api.txt`;
	if(init_params.repo === 'api'){
		api_file = `api-api.txt`;
	}
	const functions_file = `${dot_deploy_folder}/netlify/functions/${api_file}`;
	const functions_dest = `${function_folder}/api.ts`;
	util.fs.copy_file(functions_file, functions_dest, 'dot');
}

function _copy_express_files(){
	const dot_deploy_folder = `${init_params.root}/${defaults.tmp_folder}/urn-dot/deploy`;
	const src_folder = `${init_params.root}/src`;
	if(!fs.existsSync(src_folder)){
		fs.mkdirSync(src_folder);
	}
	const index_file = `${dot_deploy_folder}/express/index.txt`;
	const index_dest = `${src_folder}/index.ts`;
	util.fs.copy_file(index_file, index_dest, 'xprs');
}

async function _clone_core(){
	output.start_loading(`Cloning core...`);
	await util.cmd.clone_repo(
		defaults.core_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'core',
		init_params.branch
	);
	await util.cmd.clone_repo(
		defaults.core_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'core',
		init_params.branch
	);
	output.done_log(`Cloned core repo.`, 'core');
}

async function _clone_api(){
	output.start_loading(`Cloning api...`);
	await util.cmd.clone_repo_recursive(
		defaults.api_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'api',
		init_params.branch
	);
	await util.cmd.clone_repo_recursive(
		defaults.api_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'api',
		init_params.branch
	);
	output.done_log(`Cloned api repo.`, 'api');
}

async function _clone_trx(){
	output.start_loading(`Cloning trx...`);
	await util.cmd.clone_repo_recursive(
		defaults.trx_repo,
		`${init_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}`,
		'trx',
		init_params.branch
	);
	await util.cmd.clone_repo_recursive(
		defaults.trx_repo,
		`${init_params.root}/${defaults.folder}/client/src/${defaults.repo_folder}`,
		'trx',
		init_params.branch
	);
	output.done_log(`Cloned trx repo.`, 'trx');
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
		// default:{
		//   output.log('init', `Selected repo is not valid. [${repo}]`);
		//   process.exit(1);
		// }
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
	if(util.cmd.dependency_exists(short_repo)){
		output.start_loading(`Uninstalling ${short_repo} dep...`);
		const dep_folder = `${init_params.root}/node_modules/${short_repo}`;
		util.fs.remove_directory(dep_folder, context);
		const dep_dev_folder = `${init_params.root}/node_modules/${short_repo}`;
		util.fs.remove_directory(dep_dev_folder, context);
		await util.cmd.uninstall_dep(`${short_repo}`, context);
		output.done_log(`Uninstalled ${short_repo} dependencies.`, context);
		return true;
	}
}

async function _install_core_dep(){
	output.start_loading(`Installing core dep...`);
	await util.cmd.install_dep(defaults.core_dep_repo, 'core');
	await util.cmd.install_dep_dev(defaults.core_dep_dev_repo, 'core');
	output.done_log(`Installed core dependencies.`, 'core');
	return true;
}

async function _install_api_dep(){
	output.start_loading(`Installing api dep...`);
	await util.cmd.install_dep(defaults.api_dep_repo, 'api');
	await util.cmd.install_dep_dev(defaults.api_dep_dev_repo, 'api');
	output.done_log(`Installed api dependencies.`, 'api');
	return true;
}

async function _install_trx_dep(){
	output.start_loading(`Installing trx dep...`);
	await util.cmd.install_dep(defaults.trx_dep_repo, 'trx');
	await util.cmd.install_dep_dev(defaults.trx_dep_dev_repo, 'trx');
	output.done_log(`Installed trx dependencies.`, 'trx');
	return true;
}
