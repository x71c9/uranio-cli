/**
 * Process module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import {urn_util} from 'uranio-lib';

import {
	Arguments,
	Repo,
	PacMan,
	Params,
	DB,
	LogLevel,
	valid_admin_repos
} from './types';

import * as output from './output/index';

import * as util from './util/index';

import {
	prompt_init,
	transpose,
	generate,
	dev,
	dev_server,
	dev_panel,
	build,
	build_server,
	build_panel,
	start,
	start_server,
	start_panel,
	help,
	info,
	docker,
	deinit,
} from './cmd/index';

import {default_params, defaults} from './conf/defaults';

import {
	check_repo,
	check_pacman,
	check_db,
	check_loglevel,
	read_init_file,
} from './cmd/common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let process_params = default_params as Params;

export async function uranio_process(args:Arguments)
		:Promise<void>{
	
	process_params.spin = true;
	
	if(!_cmd_that_do_not_need_root(args)){
		_set_root(args);
	}
	
	process_params = read_init_file(process_params);
	
	process_params = _set_args(process_params, args);
	
	process.chdir(process_params.root);
	
	output_instance = output.create(process_params);
	util_instance = util.create(process_params, output_instance);
	
	_init_log();
	
	await _switch_command(args);
	
	// process.exit(0);
}

function _cmd_that_do_not_need_root(args:Arguments){
	const full_cmd = args._[0] || '';
	const splitted_cmd = full_cmd.split(':');
	let cmd = splitted_cmd[0];
	if (args.version || args.V) {
		cmd = 'version';
	}
	if (args.help || args.h) {
		cmd = 'help';
	}
	const no_root_cmd = ['', 'help', 'version'];
	if(no_root_cmd.includes(cmd)){
		return true;
	}
	return false;
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

function _init_log(){
	
	const log_file_path = `${process_params.root}/${defaults.log_filepath}`;
	if(!util_instance.fs.exists(log_file_path) && process_params.filelog === true){
		util_instance.fs.create_file(log_file_path);
	}
	_log_arguments(process_params);
	_log_root();
	
}

function _log_arguments(params:Params){
	output_instance.trace_log(JSON.stringify(params));
}

function _log_root(){
	output_instance.debug_log(
		`$URNROOT$Project root [${process_params.root}]`
	);
}

function _set_args(params:Params, args:Arguments)
		:Params{
	
	/* Paramters with default value = false */
	
	const prod = args.p || args.prod;
	
	if(prod == true || prod == 'true'){
		params.prod = true;
	}
	if(typeof args.noprod === 'boolean' && !!args.noprod !== !params.prod){
		params.prod = !args.noprod;
	}
	
	const force = args.f || args.force;
	
	if(force == true || force == 'true'){
		params.force = true;
	}
	if(typeof args.noforce === 'boolean' && !!args.noforce !== !params.force){
		params.force = !args.noforce;
	}
	
	const verbose = args.v || args.verbose;
	
	if(verbose == true || verbose == 'true'){
		params.verbose = true;
	}
	if(typeof args.noverbose === 'boolean' && !!args.noverbose !== !params.verbose){
		params.verbose = !args.noverbose;
	}
	if(params.verbose === true){
		params.log_level = LogLevel.DEBUG;
	}
	
	const trace = args.u || args.trace;
	
	if(trace == true || trace == 'true'){
		params.trace = true;
	}
	if(typeof args.notrace === 'boolean' && !!args.notrace !== !params.trace){
		params.trace = !args.notrace;
	}
	if(params.trace === true){
		params.log_level = LogLevel.TRACE;
	}
	
	// If debug mode is one also verbose mode must be on.
	// if(params.debug === true){
	// 	params.verbose = true;
	// }
	
	// const hide = args.h || args.hide;
	
	// if(hide == true){
	// 	params.hide = true;
	// }
	// if(typeof args.nohide === 'boolean' && !!args.nohide !== !params.hide){
	// 	params.hide = !args.nohide;
	// }
	
	const no_colors = args.n || args.no_colors;
	
	if(no_colors == true || process.env.NO_COLOR == 'true'){
		params.no_colors = true;
	}
	if(typeof args.nono_colors === 'boolean' && !!args.nono_colors !== !params.no_colors){
		params.no_colors = !args.nono_colors;
	}
	
	const prefix_logtype = args.x || args.prefix_logtype;
	
	if(prefix_logtype == true || prefix_logtype == 'true'){
		params.prefix_logtype = true;
	}
	if(typeof args.noprefix_logtype === 'boolean' && !!args.noprefix_logtype !== !params.prefix_logtype){
		params.prefix_logtype = !args.noprefix_logtype;
	}
	
	if(params.prefix_logtype === true){
		params.no_colors = true;
	}
	
	const fullwidth = args.w || args.fullwidth;
	
	if(fullwidth == true || fullwidth == 'true'){
		params.fullwidth = true;
	}
	if(typeof args.nofullwidth === 'boolean' && !!args.nofullwidth !== !params.fullwidth){
		params.fullwidth = !args.nofullwidth;
	}
	
	// const native = args.e || args.native;
	
	// if(native == true){
	// 	params.native = true;
	// }
	// if(typeof args.nonative === 'boolean' && !!args.nonative !== !params.native){
	// 	params.native = !args.nonative;
	// }
	
	const inside_ntl = args.inside_ntl;
	
	if(inside_ntl == true || inside_ntl == 'true'){
		params.inside_ntl = true;
	}
	if(typeof args.noinside_ntl === 'boolean' && !!args.noinside_ntl !== !params.inside_ntl){
		params.inside_ntl = !args.noinside_ntl;
	}
	
	const time = args.t || args.time;
	
	if(time == true || time == 'true'){
		params.time = true;
	}
	if(typeof args.notime === 'boolean' && !!args.notime !== !params.time){
		params.time = !args.notime;
	}
	
	// const context = args.a || args.context;
	
	// if(context == true){
	// 	params.context = true;
	// }
	// if(typeof args.nocontext === 'boolean' && !!args.nocontext !== !params.context){
	// 	params.context = !args.nocontext;
	// }
	
	// const prefix_color = args.prefix_color;
	
	// if(prefix_color == true){
	// 	params.prefix_color = true;
	// }
	// if(typeof args.noprefix_color === 'boolean' && !!args.noprefix_color !== !params.prefix_color){
	// 	params.prefix_color = !args.noprefix_color;
	// }
	
	// const docker = args.k || args.docker;
	
	// if(docker == true || docker == 'true'){
	// 	params.docker = true;
	// }
	// if(typeof args.nodocker === 'boolean' && !!args.nodocker !== !params.docker){
	// 	params.docker = !args.nodocker;
	// }
	
	// const docker_db = args.docker_db;
	
	// if(docker_db == true || docker_db == 'true'){
	// 	params.docker_db = true;
	// }
	// if(typeof args.nodocker_db === 'boolean' && !!args.nodocker_db !== !params.docker_db){
	// 	params.docker_db = !args.nodocker_db;
	// }
	
	// const build = args.b || args.build;
	
	// if(build == true || build == 'true'){
	// 	params.build = true;
	// }
	// if(typeof args.nobuild === 'boolean' && !!args.nobuild !== !params.build){
	// 	params.build = !args.nobuild;
	// }
	
	const docker_load = args.docker_load;
	
	if(docker_load == true || docker_load == 'true'){
		params.docker_load = true;
	}
	if(typeof args.nodocker_load === 'boolean' && !!args.nodocker_load !== !params.docker_load){
		params.docker_load = !args.nodocker_load;
	}
	
	const filelog = args.g || args.filelog;
	
	if(filelog == true || filelog == 'true'){
		params.filelog = true;
	}
	if(typeof args.nofilelog === 'boolean' && !!args.nofilelog !== !params.filelog){
		params.filelog = !args.nofilelog;
	}
	
	/* Paramteters with default value = true */
	
	const spin = args.i || args.spin;
	
	if(spin == false || spin == 'false'){
		params.spin = false;
	}
	if(typeof args.nospin === 'boolean' && !!args.nospin !== !params.spin){
		params.spin = !args.nospin;
	}
	
	// const color_uranio = args.color_uranio;
	
	// if(color_uranio == false || color_uranio == 'false'){
	// 	params.color_uranio = false;
	// }
	// if(typeof args.nocolor_uranio === 'boolean' && !!args.nocolor_uranio !== !params.color_uranio){
	// 	params.color_uranio = !args.nocolor_uranio;
	// }
	
	/* Parameters with default value type = string */
	
	const prefix = args.e || args.prefix;
	
	if(typeof prefix === 'string' && prefix !== ''){
		params.prefix = prefix;
	}
	
	const branch = args.a || args.branch;
	
	if(typeof branch === 'string' && branch !== ''){
		params.branch = branch;
	}
	
	const pacman = args.m || args.pacman;
	
	if(typeof pacman === 'string' && pacman != ''){
		check_pacman(pacman);
		params.pacman = pacman as PacMan;
	}
	
	const repo = args.r || args.repo;
	
	if(typeof repo === 'string' && repo != ''){
		check_repo(repo);
		params.repo = repo as Repo;
	}
	
	const config = args.c || args.config;
	
	if(typeof config === 'string' && config != ''){
		params.config = config;
	}
	
	const db = args.db;
	
	if(typeof db === 'string' && db !== ''){
		check_db(db);
		params.db = db as DB;
	}
	
	const docker_tag = args.docker_tag;
	
	if(typeof docker_tag === 'string' && docker_tag !== ''){
		params.docker_tag = docker_tag
	}
	
	const log_level = args.l || args.log_level;
	
	if(typeof log_level === 'string' && log_level !== ''){
		check_loglevel(log_level);
		switch(log_level){
			case 'none':{
				params.log_level = LogLevel.NONE;
				break;
			}
			case 'error':{
				params.log_level = LogLevel.ERROR;
				break;
			}
			case 'warn':{
				params.log_level = LogLevel.WARN;
				break;
			}
			case 'info':{
				params.log_level = LogLevel.INFO;
				break;
			}
			case 'debug':{
				params.log_level = LogLevel.DEBUG;
				break;
			}
			case 'trace':{
				params.log_level = LogLevel.TRACE;
				break;
			}
		}
	}
	
	// const color_log = args.d || args.color_log;
	
	// if(typeof color_log === 'string' && color_log != ''){
	// 	params.color_log = color_log;
	// }
	
	// const color_verbose = args.o || args.color_verbose;
	
	// if(typeof color_verbose === 'string' && color_verbose != ''){
	// 	params.color_verbose = color_verbose;
	// }
	
	// const color_debug = args.o || args.color_debug;
	
	// if(typeof color_debug === 'string' && color_debug != ''){
	// 	params.color_debug = color_debug;
	// }
	
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
				if(pack.name === 'uranio' || (pack.name === 'uranio-monorepo' && pack.uranio == true)){
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
				if(pack.name === 'uranio-monorepo'){
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

function _return_version(){
	if(!process.mainModule || typeof process.mainModule.path !== 'string'){
		output_instance.error_log(`Invalid mainModule.path [${process.mainModule?.path}].`);
		process.exit(1);
	}
	const data = util_instance.fs.read_file(process.mainModule.path + `/../package.json`);
	const json_data = urn_util.json.clean_parse(data);
	const version = json_data.version;
	if(typeof version !== 'string' || version === ''){
		output_instance.error_log(`Invalid package.json version.`);
		process.exit(1);
	}
	return version;
}

async function _switch_command(args:Arguments){
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
			output_instance.info_log(_return_version());
			break;
		}
		case 'reinit':{
			await deinit(process_params);
			prompt_init(process_params, args);
			break;
		}
		case 'init':{
			prompt_init(process_params, args);
			break;
		}
		case 'dev':{
			switch(splitted_cmd[1]){
				case 'server':{
					dev_server(process_params);
					break;
				}
				case 'panel':{
					if(valid_admin_repos().includes(process_params.repo)){
						dev_panel(process_params);
					}
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
				case 'panel':{
					if(valid_admin_repos().includes(process_params.repo)){
						build_panel(process_params);
					}
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
		case 'start':{
			switch(splitted_cmd[1]){
				case 'server':{
					start_server(process_params);
					break;
				}
				case 'panel':{
					if(valid_admin_repos().includes(process_params.repo)){
						start_panel(process_params);
					}
					break;
				}
				case '':
				case undefined:
				default:{
					start(process_params);
				}
			}
			break;
		}
		case 'generate':{
			generate(process_params);
			break;
		}
		case 'transpose':{
			// if(args._.length > 1 && typeof args._[1] === 'string'){
			//   const final_path = (args._[1][0] === '/') ?
			//     args._[1] : `${process.cwd()}/${args._[1]}`;
			//   transpose_one(final_path, process_params);
			// }else{
			transpose(process_params);
			// }
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
		case 'docker':{
			docker(process_params, args);
			break;
		}
		case 'deinit':{
			deinit(process_params);
			break;
		}
		default:{
			output_instance.error_log(`Invalid argument [${cmd}]`);
			process.exit(1);
		}
	}
}
