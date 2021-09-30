/**
 * Process module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import {urn_util} from 'urn-lib';

import {Arguments, Repo, PacMan, Deploy, Params} from './types';

import * as output from './output/';

import * as util from './util/';

import {
	prompt_init,
	dev,
	dev_server,
	dev_client,
	transpose,
	build,
	build_server,
	build_client,
	alias,
	hooks,
	help,
	// test,
} from './cmd/';

import {default_params, defaults} from './conf/defaults';

import {check_repo, check_deploy, check_pacman} from './cmd/common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let process_params = default_params as Params;

export function uranio_process(args:Arguments)
		:void{
	
	process_params = _set_params(args);
	
	process.chdir(process_params.root);
	
	output_instance = output.create(process_params);
	util_instance = util.create(process_params, output_instance);
	
	_init_log();
	
	_switch_command(args);
	
}

function _init_log(){
	
	const log_file_path = `${process_params.root}/${defaults.log_filepath}`;
	if(!util_instance.fs.exists_sync(log_file_path)){
		util_instance.fs.create_file_sync(log_file_path);
	}
	
	_log_arguments(process_params);
	_log_root();
	
}

function _log_arguments(params:Params){
	output_instance.verbose_log(JSON.stringify(params), 'args');
}

function _log_root(){
	output_instance.verbose_log(
		`$URNROOT$Project root [${process_params.root}]`,
		'root'
	);
}

function _set_params(args:Arguments){
	
	const params = default_params;
	
	const force = args.f || args.force;
	
	if(force == true){
		params.force = true;
	}
	
	const verbose = args.v || args.verbose;
	
	if(verbose == true){
		params.verbose = true;
	}
	if(typeof args.noverbose === 'boolean' && !!args.noverbose !== !params.verbose){
		params.verbose = !args.noverbose;
	}
	
	const hide = args.n || args.hide;
	
	if(hide == true){
		params.hide = true;
	}
	if(typeof args.nohide === 'boolean' && !!args.nohide !== !params.hide){
		params.hide = !args.nohide;
	}
	
	const blank = args.b || args.blank;
	
	if(blank == true){
		params.blank = true;
	}
	if(typeof args.noblank === 'boolean' && !!args.noblank !== !params.blank){
		params.blank = !args.noblank;
	}
	
	const fullwidth = args.w || args.fullwidth;
	
	if(fullwidth == true){
		params.fullwidth = true;
	}
	if(typeof args.nofullwidth === 'boolean' && !!args.nofullwidth !== !params.fullwidth){
		params.fullwidth = !args.nofullwidth;
	}
	
	const filelog = args.l || args.filelog;
	
	if(filelog == true){
		params.filelog = true;
	}
	if(typeof args.nofilelog === 'boolean' && !!args.nofilelog !== !params.filelog){
		params.filelog = !args.nofilelog;
	}
	
	const prefix = args.x || args.prefix;
	
	if(typeof prefix === 'string' && prefix !== ''){
		params.prefix = prefix;
	}
	
	const branch = args.g || args.branch;
	
	if(typeof branch === 'string' && branch !== ''){
		params.branch = branch;
	}
	
	const pacman = args.p || args.pacman;
	
	if(typeof pacman === 'string' && pacman != ''){
		check_pacman(pacman);
		params.pacman = pacman as PacMan;
	}
	
	const repo = args.r || args.repo;
	
	if(typeof repo === 'string' && repo != ''){
		check_repo(repo);
		params.repo = repo as Repo;
	}
	
	const deploy = args.d || args.deploy;
	
	if(typeof deploy === 'string' && deploy != ''){
		check_deploy(deploy);
		params.deploy = deploy as Deploy;
	}
	
	let root = args.s || args.root;
	
	if(typeof root === 'string' && root !== ''){
		if(root[0] !== '/'){
			root = path.resolve(process.cwd(), root);
		}
		if(!_check_folder(root)){
			let end_log = '';
			end_log += `\nInvalid project root.\n`;
			process.stderr.write(end_log);
			process.exit(1);
		}else{
			params.root = root;
		}
	}else{
		params.root = _get_project_root();
	}
		
	return params;
	
}

function _get_project_root()
		:string{
	let folder_path = process.cwd();
	while(!_folder_is_valid(folder_path)){
		if(_folder_is_uranio(folder_path)){
			folder_path = `${folder_path}/urn-bld`;
			break;
		}
		const arr_folder = folder_path.split('/');
		arr_folder.pop();
		folder_path = arr_folder.join('/');
		if(folder_path === '/' || arr_folder.length === 2){
			let err_msg = `Cannot find project root.`;
			err_msg += ' Be sure to run `uranio` inside an NPM project.';
			process.stderr.write(err_msg);
			process.exit(1);
		}
	}
	return folder_path;
}

function _folder_is_valid(folder_path:string){
	const data = fs.readdirSync(folder_path);
	if(!data){
		return false;
	}
	for(const file of data){
		if(file === 'package.json'){
			const package_json_path = `${folder_path}/${file}`;
			try{
				const content = fs.readFileSync(package_json_path,'utf8');
				const pack = urn_util.json.clean_parse(content);
				if(pack.name === 'urn-cli' || (pack.name === 'uranio' && pack.uranio == true)){
					return false;
				}
				return true;
			}catch(ex){
				process.stderr.write(`Invalid ${package_json_path}. ${ex.message}`);
				return false;
			}
		}
	}
	return false;
}

function _folder_is_uranio(folder_path:string){
	const data = fs.readdirSync(folder_path);
	if(!data){
		return false;
	}
	for(const file of data){
		if(file === 'package.json'){
			const package_json_path = `${folder_path}/${file}`;
			try{
				const content = fs.readFileSync(package_json_path,'utf8');
				const pack = urn_util.json.clean_parse(content);
				if(pack.name === 'uranio'){
					return true;
				}
				return false;
			}catch(ex){
				process.stderr.write(`Invalid ${package_json_path}. ${ex.message}`);
				return false;
			}
		}
	}
	return false;
}

function _check_folder(folder_path:string){
	const data = fs.readdirSync(folder_path);
	if(!data){
		return false;
	}
	for(const file of data){
		if(file === 'package.json'){
			const package_json_path = `${folder_path}/${file}`;
			try{
				const content = fs.readFileSync(package_json_path,'utf8');
				const pack = urn_util.json.clean_parse(content);
				if(pack.name === 'urn-cli'){
					return false;
				}else if(pack.name === 'uranio'){
					const bld_path = `${folder_path}/urn-bld`;
					if(!fs.existsSync(bld_path)){
						return false;
					}
					folder_path = bld_path;
					return true;
				}
				return true;
			}catch(ex){
				// this.output.error_log(`Invalid ${package_json_path}. ${ex.message}`, 'root');
				process.stderr.write(`Invalid ${package_json_path}. ${ex.message}`);
				return false;
			}
		}
	}
	return false;
}

function _switch_command(args:Arguments){
	const full_cmd = args._[0] || '';
	const splitted_cmd = full_cmd.split(':');
	let cmd = splitted_cmd[0];
	if (args.version || args.V) {
		cmd = 'version';
	}
	if (args.help || args.h) {
		cmd = 'help';
	}
	switch(cmd){
		case '':
		case 'version':{
			output_instance.stop_loading();
			output_instance.log('v0.0.1');
			break;
		}
		case 'init':{
			prompt_init(args, process_params);
			break;
		}
		case 'transpose':{
			transpose(process_params);
			break;
		}
		case 'alias':{
			alias(process_params);
			break;
		}
		case 'hooks':{
			hooks(process_params);
			break;
		}
		case 'dev':{
			switch(splitted_cmd[1]){
				case 'server':{
					dev_server(process_params);
					break;
				}
				case 'client':{
					dev_client(process_params);
					break;
				}
				case '':
				case undefined:
				default:{
					dev(process_params, process_params);
				}
			}
			break;
		}
		case 'build':{
			switch(splitted_cmd[1]){
				case 'server':{
					build_server(process_params, process_params);
					break;
				}
				case 'client':{
					build_client(process_params, process_params);
					break;
				}
				case '':
				case undefined:
				default:{
					build(process_params, process_params);
				}
			}
			break;
		}
		case 'help':{
			help();
			break;
		}
		case 'test':{
			// test.command();
			break;
		}
		default:{
			// output_instance.wrong_end_log('Command not found.');
			process.exit(1);
		}
	}
}

// function _relative_to_absolute_path(path:string)
//     :string{
//   if(path[path.length-1] === '/'){
//     path = path.substr(0,path.length-1);
//   }
//   if(path[0] !== '/'){
//     if(path.substr(0,2) === './'){
//       path = path.substr(2);
//     }
//     path = `${conf.root}/${path}`;
//   }
//   return path;
// }

