/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {Arguments, Repo} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

import * as util from '../util/';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		console.clear();
		
		title();
		
		output.start_loading('Initialization...');
		
		const repo = args.r || args.repo || defaults.default_repo;
		
		util.check_repo(repo);
		
		_update_aliases(repo);
		
		_create_urn_folder();
		
		_create_rc_file(repo);
		
		await _clone_dot();
		
		_copy_dot_files();
		
		// _copy_uranio_repo(repo);
		
		await _clone_and_install_repo(repo);
		
		_remove_tmp();
		
		// await _install_dep(repo);
		
		output.end_log(`Initialization completed.`);
		
	}
	
};

function _remove_tmp(){
	output.start_loading(`Removing tmp folder [${defaults.tmp_folder}]...`);
	util.remove_folder_if_exists('dot', `${global.uranio.root}/${defaults.tmp_folder}`);
	// util.sync_exec(`rm -rf ${global.uranio.root}/${defaults.tmp_folder}`);
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

// function _copy_uranio_repo(repo:Repo){
//   const dot_folder = `${global.uranio.root}/${defaults.tmp_folder}/urn-dot`;
//   let srcs = '';
//   switch(repo){
//     case 'core':{
//       srcs = `${dot_folder}/${defaults.folder}/web/core`;
//       break;
//     }
//     case 'web':{
//       srcs = `${dot_folder}/${defaults.folder}/web`;
//       break;
//     }
//   }
//   if(srcs !== ''){
//     util.copy_folder('dot', srcs, `${global.uranio.root}/${defaults.folder}`);
//   }

// }

function _copy_dot_src_folder(){
	const dot_folder = `${global.uranio.root}/${defaults.tmp_folder}/urn-dot`;
	let srcs = ``;
	srcs += `${dot_folder}/src `;
	const dest = `${global.uranio.root}/`;
	util.copy_folder('dot', srcs, dest);
}

function _copy_dot_tsconfig(){
	const dot_folder = `${global.uranio.root}/${defaults.tmp_folder}/urn-dot`;
	let srcs = ``;
	srcs += `${dot_folder}/tsconfig.json `;
	const dest = `${global.uranio.root}/`;
	util.copy_file('dot', srcs, dest);
}

function _copy_dot_eslint_files(){
	const dot_folder = `${global.uranio.root}/${defaults.tmp_folder}/urn-dot`;
	let srcs = ``;
	srcs += `${dot_folder}/.eslintignore ${dot_folder}/.eslintrc.js`;
	const dest = `${global.uranio.root}/`;
	util.copy_files('dot', srcs, dest);
}

function _copy_dot_files(){
	_copy_dot_src_folder();
	_copy_dot_tsconfig();
	_copy_dot_eslint_files();
}

function _create_rc_file(repo:Repo){
	output.start_loading('Creating rc file...');
	let content = ``;
	content += `{\n`;
	content += `"repo": "${repo}"\n`;
	content += `}`;
	fs.writeFileSync(`${global.uranio.root}/${defaults.rcfile_path}`, content);
	util.prettier(`${global.uranio.root}/${defaults.rcfile_path}`);
	output.done_log('rcfl', `${defaults.rcfile_path} created.`);
}

// function _check_repo(repo:Repo){
//   switch(repo){
//     case 'core':
//     case 'web':{
//       global.uranio.repo = repo;
//       break;
//     }
//     default:{
//       const valid_repos_str = valid_repos().join(', ');
//       let end_log = '';
//       end_log += `Wrong repo. `;
//       end_log += `Repo must be one of the following [${valid_repos_str}]`;
//       output.end_log(end_log);
//       process.exit(1);
//     }
//   }
// }

// async function _clone_dot_in_temp(){
//   output.start_loading(`Cloning and intalling [${defaults.dot_repo}]...`);
//   await _clone_dot();
//   output.done_log('repo', `Cloned and installed repo [${defaults.dot_repo}].`);
// }

// async function _clone_and_install_repo(repo:Repo){
//   output.start_loading(`Cloning and intalling [${repo}]...`);
//   // await _clone_dot();
//   output.done_log('repo', `Cloned and installed repo [${repo}].`);
// }

async function _clone_and_install_repo(repo:Repo){
	output.start_loading(`Cloning and intalling [${repo}]...`);
	switch(repo){
		case 'core':{
			await _clone_core();
			break;
		}
		case 'web':{
			await _clone_web();
			break;
		}
		default:{
			output.log('init', `Selected repo is not valid. [${repo}]`);
			process.exit(1);
		}
	}
	await _install_dep(repo);
	output.done_log('repo', `Cloned and installed repo [${repo}].`);
}

function _create_urn_folder(){
	output.start_loading(`Creating ${defaults.folder} folder...`);
	util.remove_folder_if_exists('init', `${global.uranio.root}/${defaults.folder}`);
	util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/${defaults.folder}`);
	output.done_log('init', `Created folder ${defaults.folder}.`);
}

// function _create_src_folder(){
//   output.start_loading(`Creating src folder...`);
//   util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/src`);
//   // util.create_folder_if_doesnt_exists('init', `${global.uranio.root}/dist`);
//   output.done_log('init', `Created src folder.`);
// }

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
	const data = fs.readFileSync(`${global.uranio.root}/package.json`, 'utf8');
	const package_data = JSON.parse(data);
	package_data['_moduleAliases'] = {
		urn_books: `./dist/${defaults.folder}/books.js`,
		uranio: `./dist/${defaults.folder}/core/`
	};
	if(repo === 'web'){
		package_data['_moduleAliases']['uranio'] = `./dist/${defaults.folder}/web/`;
	}
	fs.writeFileSync(`${global.uranio.root}/package.json`, JSON.stringify(package_data, null, '\t'));
	output.done_log('alas', `Aliases updated.`);
}

// function _copy_tsconfig_file(){
//   _copy_file('./src/files/tsconfig.json', './tsconfig.json');
//   output.done_log('tsco', `Copied tsconfig file.`);
// }

// function _copy_eslint_files(){
//   output.start_loading(`Copying eslint files...`);
//   _copy_files('init', `${global.uranio.root}/src/files/.eslintrc.js ${global.uranio.root}/src/files/.eslintignore`, global.uranio.root);
//   output.done_log('esln', `Copied eslint files.`);
// }

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
	const dep_folder = `${global.uranio.root}/node_modules/${defaults.core_dep_repo}`;
	util.remove_folder_if_exists('core', dep_folder);
	const dep_dev_folder = `${global.uranio.root}/node_modules/${defaults.core_dep_dev_repo}`;
	util.remove_folder_if_exists('core', dep_dev_folder);
	await util.uninstall_dep(`${defaults.core_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'core');
	output.done_log('core', `Uninstalled core dependencies.`);
	return true;
}

async function _uninstall_web_dep(){
	output.start_loading(`Uninstalling web dep...`);
	const dep_folder = `${global.uranio.root}/node_modules/${defaults.web_dep_repo}`;
	util.remove_folder_if_exists('web_', dep_folder);
	const dep_dev_folder = `${global.uranio.root}/node_modules/${defaults.web_dep_dev_repo}`;
	util.remove_folder_if_exists('web_', dep_dev_folder);
	await util.uninstall_dep(`${defaults.web_dep_repo.split('/').slice(-1)[0]} ${defaults.core_dep_dev_repo.split('/').slice(-1)[0]}`, 'web_');
	output.done_log('web', `Uninstalled web dependencies.`);
	return true;
}

async function _clone_dot(){
	output.start_loading(`Cloning dot...`);
	const tmp = `${global.uranio.root}/${defaults.tmp_folder}`;
	util.remove_folder_if_exists('dot', tmp);
	util.create_folder_if_doesnt_exists('dot', tmp);
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
