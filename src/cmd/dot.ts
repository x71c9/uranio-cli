/**
 * Dev command module
 *
 * @packageDocumentation
 */

import cp from 'child_process';

import * as output from '../output/';

import * as util from '../util/';

import {init} from './init';

import {default_params, defaults} from '../conf/defaults';

import {
	Params,
	Arguments,
	Repo,
	PacMan,
	Deploy,
	valid_deploy_repos
} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

import {
	merge_params,
	check_if_is_dot,
	check_repo,
	check_pacman,
	check_deploy
} from './common';

let dot_params = default_params as Params;

export async function dot(params:Partial<Params>, args:Arguments):Promise<void>{
	_init_params(params);
	if(!check_if_is_dot(dot_params.root)){
		output_instance.error_log(`Cannot run dot command outside urn-dot repo.`);
		process.exit(1);
	}
	switch(args._[1]){
		case 'switch':{
			await _switch(args);
			break;
		}
		default:{
			output_instance.error_log(`Invalid dot command.`);
			process.exit(1);
		}
	}
}

function _init_params(params:Partial<Params>)
		:void{
	
	params.color_log = '#AAAAAA';
	// params.blank = true;
	
	dot_params = merge_params(params);
	
	output_instance = output.create(dot_params);
	
	util_instance = util.create(dot_params, output_instance);
	
	// util_instance.must_be_initialized();
	
}

async function _switch(args:Arguments):Promise<void>{
	let repo = (args._[2]) as Repo;
	if(typeof repo === 'undefined' && typeof args.repo === 'string'){
		repo = args.repo as Repo;
	}
	let pacman = (args._[3] || 'yarn') as PacMan;
	if(typeof pacman === 'undefined' && typeof args.pacman === 'string'){
		pacman = args.pacman as PacMan;
	}
	let deploy = (args._[4] || 'express') as Deploy;
	if(typeof deploy === 'undefined' && typeof args.deploy === 'string'){
		deploy = args.deploy as Deploy;
	}
	
	const branch = (args._[5] || 'master');
	
	output_instance.log(
		`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`,
		`args`
	);
	output_instance.log(
		`!!! Do not interrupt this process or you might end up in a corrupted repo !!!`,
		`args`
	);
	output_instance.log(
		`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`,
		`args`
	);
	output_instance.log(`Selected repo: ${repo}`, `args`);
	output_instance.log(`Selected pacman: ${pacman}`, `args`);
	if(valid_deploy_repos().includes(repo)){
		output_instance.log(`Selected deploy: ${deploy}`, `args`);
	}
	
	check_repo(repo);
	check_pacman(pacman);
	check_deploy(deploy);
	
	await _check_if_clean_repo();
	
	await _execute(`git checkout ${repo}`, 'git', 'checking out');
	output_instance.done_log(`Checked out ${repo}`);
	
	if(repo !== dot_params.repo){
		
		const origin = defaults[`${repo}_repo` as keyof typeof defaults];
		const dest = `src/uranio`;
		
		await _commit_previous_submodule();
		
		await _deinit(dest);
		
		await _add_submodule(repo, origin, dest, branch);
		
		await _remove_node_modules_and_lock_files();
		
		await _install_dependencies(pacman);
		
	}
	
	await _uranio_init(repo, pacman, deploy);
}

async function _uranio_init(repo:Repo, pacman:PacMan, deploy:Deploy){
	const cloned_params = {
		...dot_params
	};
	const tscw_color = '#734de3';
	cloned_params.color_log = tscw_color;
	cloned_params.repo = repo;
	cloned_params.pacman = pacman;
	cloned_params.deploy = deploy;
	
	output_instance.log(`Initializing uranio ...`);
	
	await init(cloned_params);
	
	output_instance.done_log(`Uranio initialized.`);
}

async function _check_if_clean_repo(){
	const output = cp.execSync(`git status --porcelain`).toString();
	if(output === ''){
		output_instance.done_verbose_log('Working directory clean.');
	}else{
		output_instance.error_log('-------------------------------------------------------------');
		output_instance.error_log('Working directory not clean. Please commit before proceeding.');
		output_instance.error_log('-------------------------------------------------------------');
		process.exit(1);
	}
}

async function _commit_previous_submodule(){
	await _execute('git add .', 'git', 'add');
	await _execute(
		`git commit -m "[updated submodule of previous repo ${dot_params.repo}]"`,
		'git',
		'commit'
	);
	
	output_instance.done_log(`Commited previous repo ${dot_params.repo}.`);
}

async function _install_dependencies(pacman:PacMan){
	const install_cmd = (pacman === 'yarn') ? `yarn install` : 'npm install';
	await _execute(install_cmd, 'pacman', 'installing');
	
	output_instance.done_log(`Installed dependencies.`);
}

async function _remove_node_modules_and_lock_files(){
	await _execute(
		`rm -rf node_modules/ yarn.lock package-lock.json`,
		'git',
		`removing node_modules and lock files`,
	);
	
	output_instance.done_log(`Deleted node_modules and lock files.`);
}

async function _add_submodule(repo:Repo, origin:string, dest:string, branch:string){
	await _execute(
		`git submodule add -b ${branch} ${origin} ${dest}`,
		'git',
		'adding submodule'
	);
	await _execute(
		`git config -f .gitmodules submodule.${dest}.update rebase`,
		'git',
		'updating config'
	);
	await _execute(
		`git submodule update --remote --init --recursive`,
		'git',
		'updating submodule'
	);
	let cmd = '';
	// cmd += `git submodule foreach --recursive 'case $displaypath in ".uranio"*)`;
	cmd += `git submodule foreach --recursive 'case $displaypath in "${dest}"*)`;
	cmd += ` git checkout ${branch} ;; *) : ;; esac'`;
	await _execute(cmd, 'git', 'foreach submodule');
	
	await _execute('git add .', 'git', 'add');
	await _execute(
		`git commit -m "[added submodule ${repo} in ${dest}]"`,
		'git',
		'commit'
	);
	
	output_instance.done_log(`Added submodule ${origin}.`);
}

async function _deinit(dest:string){
	await _execute(`git submodule deinit ${dest}`, 'git', 'deinit');
	await _execute(`git rm ${dest}`, 'git', 'gitrm');
	await _execute(`rm -rf ${dest}`, 'git', 'rm');
	await _execute(`rm -rf ../.git/modules/urn-dot/modules/${dest}`, 'git', 'rm');
	await _execute('git add .', 'git', 'add');
	await _execute(`git commit -m "[removed submodule ${dest}]"`, 'git', 'commit');
	
	output_instance.done_log(`Deinitialized submodule ${dest}.`);
}

async function _execute(cmd:string, context:string, action:string){
	return new Promise((resolve, reject) => {
		util_instance.spawn.spin_and_verbose_log(
			cmd,
			context,
			action,
			undefined,
			resolve,
			reject
		);
	});
}
