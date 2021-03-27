/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import inquirer from 'inquirer';

import {Arguments, Repo} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

import * as util from '../util/';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		console.clear();
		
		title();
		
		const repo = args.r || args.repo;
		
		if(!repo){
				
			output.stop_loading();
			
			inquirer.
				prompt([
					{
						type: 'list',
						name: 'repo',
						message: 'Which repo do you want to clone?',
						choices: [
							'core',
							'web',
							'adm',
							'srvl'
						]
					}
				]).then(async (answers) => {
					await _proceed_with_repo(answers.repo);
				});
		}else{
			
			await _proceed_with_repo(repo);
			
		}
		
	}
	
};

async function _proceed_with_repo(repo:Repo){
	
	console.clear();
	
	title();
	
	output.log('repo', `Selected repo: [${repo}]`);
	
	output.start_loading('Initialization...');
		
	util.set_repo(repo);
	
	_update_aliases();
	
	_create_urn_folder();
	
	_ignore_urn_folder();
	
	_create_rc_file();
	
	await _clone_dot();
	
	_copy_dot_files();
	
	await _clone_and_install_repo();
	
	_remove_tmp();
		
	output.end_log(`Initialization completed.`);
	
}

function _ignore_urn_folder(){
	output.start_loading(`Adding ${defaults.folder} to .gitignore...`);
	const gitignore = `.gitignore`;
	if(!fs.existsSync(gitignore)){
		util.sync_exec(`touch .gitignore`);
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
	output.done_verbose_log('.git', log_msg);
}

function _remove_tmp(){
	output.start_loading(`Removing tmp folder [${defaults.tmp_folder}]...`);
	util.remove_folder_if_exists('dot', defaults.tmp_folder);
	output.done_verbose_log('tmp', `Removed tmp folder [${defaults.tmp_folder}].`);
}

async function _install_dep(repo:Repo){
	switch(repo){
		case 'core':{
			await _uninstall_core_dep();
			await _uninstall_web_dep();
			await _install_core_dep();
			break;
		}
		case 'web':{
			await _uninstall_core_dep();
			await _uninstall_web_dep();
			await _install_web_dep();
			break;
		}
		default:{
			output.log('init', `Selected repo is not valid. [${repo}]`);
			process.exit(1);
		}
	}
}

function _copy_dot_src_folder(){
	const dot_src_folder = `${defaults.tmp_folder}/urn-dot/src`;
	const dest = `./`;
	util.copy_folder('dot', dot_src_folder, dest);
}

function _copy_dot_tsconfig(){
	const dot_tsc_file = `${defaults.tmp_folder}/urn-dot/tsconfig.json`;
	const dest = `./`;
	util.copy_file('dot', dot_tsc_file, dest);
}

function _copy_dot_eslint_files(){
	const dot_eslint_files = `${defaults.tmp_folder}/urn-dot/.eslint*`;
	const dest = `./`;
	util.copy_files('dot', dot_eslint_files, dest);
}

function _copy_dot_files(){
	_copy_dot_src_folder();
	_copy_dot_tsconfig();
	_copy_dot_eslint_files();
}

function _create_rc_file(){
	output.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `"repo": "${global.uranio.repo}"\n`;
	content += `}`;
	fs.writeFileSync(defaults.rcfile_path, content);
	util.pretty(defaults.rcfile_path, 'json');
	output.done_log('rcfl', `[${defaults.rcfile_path}] created.`);
}

async function _clone_and_install_repo(){
	output.start_loading(`Cloning and intalling [${global.uranio.repo}]...`);
	switch(global.uranio.repo){
		case 'core':{
			await _clone_core();
			break;
		}
		case 'web':{
			await _clone_web();
			break;
		}
		default:{
			output.log('init', `Selected repo is not valid. [${global.uranio.repo}]`);
			process.exit(1);
		}
	}
	await _install_dep(global.uranio.repo);
	output.done_log('repo', `Cloned and installed repo [${global.uranio.repo}].`);
}

function _create_urn_folder(){
	output.start_loading(`Creating ${defaults.folder} folder...`);
	util.remove_folder_if_exists('init', defaults.folder);
	util.create_folder_if_doesnt_exists('init', defaults.folder);
	output.done_log('init', `Created folder ${defaults.folder}.`);
}

function _update_aliases(){
	output.start_loading('Updating aliases...');
	const data = fs.readFileSync(`./package.json`, 'utf8');
	const package_data = JSON.parse(data);
	package_data['_moduleAliases'] = {
		urn_books: `./dist/${defaults.folder}/books.js`,
		uranio: `./dist/${defaults.folder}/${global.uranio.repo}/`
	};
	fs.writeFileSync(`./package.json`, JSON.stringify(package_data, null, '\t'));
	output.done_log('alas', `Aliases updated.`);
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
	await util.install_dep(defaults.web_dep_repo, 'web_');
	await util.install_dep_dev(defaults.web_dep_dev_repo, 'web_');
	output.done_log('web', `Installed web dependencies.`);
	return true;
}

async function _uninstall_core_dep(){
	output.start_loading(`Uninstalling core dep...`);
	const dep_folder = `./node_modules/${defaults.core_dep_repo}`;
	util.remove_folder_if_exists('core', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.core_dep_dev_repo}`;
	util.remove_folder_if_exists('core', dep_dev_folder);
	await util.uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	output.done_log('core', `Uninstalled core dependencies.`);
	return true;
}

async function _uninstall_web_dep(){
	output.start_loading(`Uninstalling web dep...`);
	const dep_folder = `./node_modules/${defaults.web_dep_repo}`;
	util.remove_folder_if_exists('web_', dep_folder);
	const dep_dev_folder = `./node_modules/${defaults.web_dep_dev_repo}`;
	util.remove_folder_if_exists('web_', dep_dev_folder);
	await util.uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
	output.done_log('web', `Uninstalled web dependencies.`);
	return true;
}

async function _clone_dot(){
	output.start_loading(`Cloning dot...`);
	util.remove_folder_if_exists('dot', defaults.tmp_folder);
	util.create_folder_if_doesnt_exists('dot', defaults.tmp_folder);
	await util.clone_repo('dot', defaults.dot_repo, `${defaults.tmp_folder}/urn-dot`);
	output.done_log('dot', `Cloned dot repo.`);
}

async function _clone_core(){
	output.start_loading(`Cloning core...`);
	await util.clone_repo('core', defaults.core_repo, `${defaults.folder}/core`);
	output.done_log('core', `Cloned core repo.`);
}

async function _clone_web(){
	output.start_loading(`Cloning web...`);
	await util.clone_repo_recursive('web_', defaults.web_repo, `${defaults.folder}/web`);
	output.done_log('web', `Cloned web repo.`);
}
