/**
 * Process module
 *
 * @packageDocumentation
 */

import {Arguments, Repo, PacMan, Deploy, Params} from './types';

// import * as output from './output/';

// import * as util from './util/';

import {
	init,
	dev,
	dev_server,
	dev_client,
	transpose,
	build,
	build_server,
	build_client,
	alias,
	hooks,
	// help,
	// test,
} from './cmd/';

import {default_params} from './conf/defaults';

// // import * as common from './cmd/common';

// let output_instance:output.OutputInstance;

// let util_instance:util.UtilInstance;

let process_params = default_params as Params;

export function uranio_process(args:Arguments)
		:void{
	
	process_params = _set_params(args);
	
	// output_instance = output.create(params);
	
	// util_instance = util.create(params, output_instance);
	
	// console.log(process_params);
	
	// process.chdir(conf.root);
	
	// // common.init_log();
	
	// _log_arguments(args);
	
	_switch_command(args);
	
	// process.exit(1);
	
}

// function _log_arguments(args:Arguments){
//   output_instance.verbose_log(JSON.stringify(args), 'args');
// }

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
	
	const prefix = args.p || args.prefix;
	
	if(typeof prefix === 'string' && prefix !== ''){
		params.prefix = prefix;
	}
	
	const pacman = args.pacman;
	
	if(typeof pacman === 'string' && pacman != ''){
		// util_instance.cmd.set_pacman(pacman);
		params.pacman = pacman as PacMan;
	}
	
	const repo = args.r || args.repo;
	
	if(typeof repo === 'string' && repo != ''){
		// util_instance.cmd.set_repo(repo);
		params.repo = repo as Repo;
	}
	
	const deploy = args.d || args.deploy;
	
	if(typeof deploy === 'string' && deploy != ''){
		// util_instance.cmd.set_repo(repo);
		params.deploy = deploy as Deploy;
	}
	
	// let root = args.s || args.root;
	
	// if(typeof root === 'string' && root !== ''){
	//   root = util_instance.relative_to_absolute_path(root);
	//   if(!util_instance.check_folder(root)){
	//     let end_log = '';
	//     end_log += `Invalid project root.`;
	//     output_instance.wrong_end_log(end_log);
	//     process.exit(1);
	//   }else{
	//     params.root = root;
	//     // common.init_log();
	//     output_instance.done_verbose_log(`$URNROOT$Project root set to [${params.root}]`, 'root');
	//   }
	// }else{
	//   util_instance.auto_set_project_root();
	// }
		
	return params;
	
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
		// case '':
		// case 'version':{
		//   output_instance.stop_loading();
		//   console.log('v0.0.1');
		//   break;
		// }
		case 'init':{
			init(process_params, process_params);
			break;
		}
		case 'transpose':{
			transpose(process_params, process_params);
			break;
		}
		case 'alias':{
			alias(process_params, process_params);
			break;
		}
		case 'hooks':{
			hooks(process_params, process_params);
			break;
		}
		case 'dev':{
			switch(splitted_cmd[1]){
				case 'server':{
					dev_server(process_params, process_params);
					break;
				}
				case 'client':{
					dev_client(process_params, process_params);
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
			// help.command();
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

