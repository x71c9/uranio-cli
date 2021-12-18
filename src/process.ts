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
	transpose_one,
	build,
	build_server,
	build_client,
	alias,
	hooks,
	help,
	info,
	dot
	// test,
} from './cmd/';

import {default_params, defaults} from './conf/defaults';

import {
	check_repo,
	check_deploy,
	check_pacman,
	read_rc_file,
	check_if_is_dot
} from './cmd/common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let process_params = default_params as Params;

export function uranio_process(args:Arguments)
		:void{
	
	process_params.spin = true;
	
	_set_root(args);
	
	process_params = read_rc_file(process_params);
	
	process_params = _set_args(process_params, args);
	
	process.chdir(process_params.root);
	
	process_params = _autoset_is_dot(process_params, args);
	
	output_instance = output.create(process_params);
	util_instance = util.create(process_params, output_instance);
	
	_init_log();
	
	_switch_command(args);
	
}

function _set_root(args:Arguments){
	
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
			process_params.root = root;
		}
	}else{
		process_params.root = _get_project_root();
	}
		
}

function _autoset_is_dot(params:Params, args:Arguments):Params{
	if(typeof args.is_dot === 'undefined' && check_if_is_dot(params.root)){
		params.is_dot = true;
	}
	return params;
}

function _init_log(){
	
	const log_file_path = `${process_params.root}/${defaults.log_filepath}`;
	if(!util_instance.fs.exists(log_file_path)){
		util_instance.fs.create_file(log_file_path);
	}
	// if(!fs.existsSync(log_file_path)){
	//   fs.writeFileSync(log_file_path, '');
	// }
	
	_log_arguments(process_params);
	_log_root();
	
}

function _log_arguments(params:Params){
	output_instance.debug_log(JSON.stringify(params), 'args');
}

function _log_root(){
	output_instance.verbose_log(
		`$URNROOT$Project root [${process_params.root}]`,
		'root'
	);
}

function _set_args(params:Params, args:Arguments)
		:Params{
	
	// Paramters with default value = false
	
	const force = args.f || args.force;
	
	if(force == true){
		params.force = true;
	}
	if(typeof args.noforce === 'boolean' && !!args.noforce !== !params.force){
		params.force = !args.noforce;
	}
	
	const verbose = args.v || args.verbose;
	
	if(verbose == true){
		params.verbose = true;
	}
	if(typeof args.noverbose === 'boolean' && !!args.noverbose !== !params.verbose){
		params.verbose = !args.noverbose;
	}
	
	const debug = args.u || args.debug;
	
	if(debug == true){
		params.debug = true;
	}
	if(typeof args.nodebug === 'boolean' && !!args.nodebug !== !params.debug){
		params.debug = !args.nodebug;
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
	
	const native = args.e || args.native;
	
	if(native == true){
		params.native = true;
	}
	if(typeof args.nonative === 'boolean' && !!args.nonative !== !params.native){
		params.native = !args.nonative;
	}
	
	const is_dot = args.is_dot;
	
	if(is_dot == true){
		params.is_dot = true;
	}
	
	const time = args.t || args.time;
	
	if(time == true){
		params.time = true;
	}
	if(typeof args.notime === 'boolean' && !!args.notime !== !params.time){
		params.time = !args.notime;
	}
	
	const context = args.a || args.context;
	
	if(context == true){
		params.context = true;
	}
	if(typeof args.nocontext === 'boolean' && !!args.nocontext !== !params.context){
		params.context = !args.nocontext;
	}
	
	// Paramteters with default value = true
	
	const filelog = args.l || args.filelog;
	
	if(filelog == false){
		params.filelog = false;
	}
	if(typeof args.nofilelog === 'boolean' && !!args.nofilelog !== !params.filelog){
		params.filelog = !args.nofilelog;
	}
	
	const spin = args.i || args.spin;
	
	if(spin == false){
		params.filelog = false;
	}
	if(typeof args.nospin === 'boolean' && !!args.nospin !== !params.spin){
		params.spin = !args.nospin;
	}
	
	// Parameters with default value type = string
	
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
	
	const color_log = args.c || args.color_log;
	
	if(typeof color_log === 'string' && color_log != ''){
		params.color_log = color_log;
	}
	
	const color_verbose = args.o || args.color_verbose;
	
	if(typeof color_verbose === 'string' && color_verbose != ''){
		params.color_verbose = color_verbose;
	}
	
	const color_debug = args.o || args.color_debug;
	
	if(typeof color_debug === 'string' && color_debug != ''){
		params.color_debug = color_debug;
	}
	
	// Root parameter
	
	// let root = args.s || args.root;
	
	// if(typeof root === 'string' && root !== ''){
	//   if(root[0] !== '/'){
	//     root = path.resolve(process.cwd(), root);
	//   }
	//   if(!_check_folder(root)){
	//     let end_log = '';
	//     end_log += `\nInvalid project root.\n`;
	//     process.stderr.write(end_log);
	//     process.exit(1);
	//   }else{
	//     params.root = root;
	//   }
	// }else{
	//   params.root = _get_project_root();
	// }
		
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
			err_msg += ' Be sure to run `uranio` inside an NPM project.\n';
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
				const err = ex as Error;
				process.stderr.write(`Invalid ${package_json_path}. ${err.message}`);
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
				const err = ex as Error;
				process.stderr.write(`Invalid ${package_json_path}. ${err.message}`);
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
				const err = ex as Error;
				process.stderr.write(`Invalid ${package_json_path}. ${err.message}`);
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
			prompt_init(process_params, args);
			break;
		}
		case 'transpose':{
			if(args._.length > 1 && typeof args._[1] === 'string'){
				transpose_one(args._[1], process_params);
			}else{
				transpose(process_params);
			}
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
					dev(process_params);
				}
			}
			break;
		}
		case 'build':{
			switch(splitted_cmd[1]){
				case 'server':{
					build_server(process_params);
					break;
				}
				case 'client':{
					build_client(process_params);
					break;
				}
				case '':
				case undefined:
				default:{
					build(process_params);
				}
			}
			break;
		}
		case 'info':{
			info(process_params);
			break;
		}
		case 'help':{
			help();
			break;
		}
		case 'dot':{
			dot(process_params, args);
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

