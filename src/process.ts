/**
 * Process module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {Arguments} from './types';

import {help, init, transpose} from './cmd/';

import {conf} from './conf/defaults';

import * as output from './log/';

export function urn_process(args:Arguments)
		:void{
	
	_init_global();
	
	_get_project_root();
	
	_log_arguments(args);
	
	_switch_command(args);
	
	// process.exit(1);
	
}

function _init_global(){
	global.uranio = {root: '.'};
}

function _check_folder(folder_path:string)
		:boolean{
	const data = fs.readdirSync(folder_path);
	for(const file of data){
		if(file === 'package.json'){
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
		_check_folder(folder_path);
	}
	output.done_verbose_log('root', `$URNROOT$Project root found [${global.uranio.root}]`);
}

function _log_arguments(args:Arguments){
	output.verbose_log('args', JSON.stringify(args));
}

function _switch_command(args:Arguments){
	
	let cmd = args._[0] || '';
	
	if (args.version) {
		cmd = 'version';
	}
	
	if (args.help || args.h) {
		cmd = 'help';
	}
	
	const verbose = args.v || args.verbose;
	
	if(verbose === true){
		conf.verbose = true;
	}
	
	const no_colors = args['no-colors'];
	
	if(no_colors === true){
		conf.colors = false;
	}
	
	switch(cmd){
		case '':
		case 'version':{
			console.log('v0.0.1');
			break;
		}
		case 'init':{
			init.run(args);
			break;
		}
		case 'transpose':{
			transpose.run(args);
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

