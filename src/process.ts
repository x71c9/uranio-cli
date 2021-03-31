/**
 * Process module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as cp from 'child_process';

import {Arguments} from './types';

import {help, init, transpose, dev} from './cmd/';

import {conf, defaults} from './conf/defaults';

import * as output from './log/';

// import * as util from './util/';

export function urn_process(args:Arguments)
		:void{
	
	_init_global();
	
	_read_options(args);
	
	_init_log();
	
	_get_project_root();
	
	_log_arguments(args);
	
	_switch_command(args);
	
	// process.exit(1);
	
}

function _init_log(){
	if(!fs.existsSync(defaults.log_filepath)){
		cp.execSync(`touch ${defaults.log_filepath}`);
	}
}

function _init_global(){
	global.uranio = {
		root: '.',
		repo: defaults.default_repo
	};
}

function _check_folder(folder_path:string)
		:boolean{
	const data = fs.readdirSync(folder_path);
	for(const file of data){
		if(file === 'package.json'){
			const content = fs.readFileSync(`${folder_path}/${file}`,'utf8');
			const pack = JSON.parse(content);
			if(pack.name === 'urn-cli'){
				return false;
			}else if(pack.name === 'uranio'){
				const bld_path = `${folder_path}/urn-bld`;
				if(!fs.existsSync(bld_path)){
					return false;
				}
				global.uranio.root = bld_path;
				return true;
			}
			global.uranio.root = folder_path;
			return true;
		}
	}
	return false;
}

function _get_project_root(){
	output.start_loading('Getting project root...');
	let folder_path = process.cwd();
	while(!_check_folder(folder_path)){
		const arr_folder = folder_path.split('/');
		arr_folder.pop();
		folder_path = arr_folder.join('/');
		if(folder_path === '/'){
			throw new Error('Cannot find project root.');
		}
	}
	process.chdir(global.uranio.root);
	output.done_verbose_log('root', `$URNROOT$Project root found [${global.uranio.root}]`);
}

function _log_arguments(args:Arguments){
	output.verbose_log('args', JSON.stringify(args));
}

function _read_options(args:Arguments){
	
	const verbose = args.v || args.verbose;
	
	if(verbose === true){
		conf.verbose = true;
	}
	
	const colors = args['colors'];
	
	if(colors === false){
		conf.colors = false;
	}
	
	const log = args['log'];
	
	if(log === false){
		conf.output = false;
	}
	
}

function _switch_command(args:Arguments){
	
	let cmd = args._[0] || '';
	
	if (args.version) {
		cmd = 'version';
	}
	
	if (args.help || args.h) {
		cmd = 'help';
	}
	
	switch(cmd){
		case '':
		case 'version':{
			output.stop_loading();
			console.log('v0.0.1');
			break;
		}
		case 'init':{
			init.run(args);
			break;
		}
		case 'transpose':{
			transpose.run();
			break;
		}
		case 'dev':{
			dev.run();
			break;
		}
		case 'help':{
			help.run();
			break;
		}
		default:{
			console.log('Command not found.');
		}
	}
}

