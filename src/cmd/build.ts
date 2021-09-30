/**
 * Build command module
 *
 * @packageDocumentation
 */

// import {Options, Arguments} from '../types';

import {default_params} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {Params} from '../types';

import {transpose} from './transpose';

import {merge_params} from './common';

import {BuildParams} from './types';

// import * as common from './common';

// // const cli_options = {
// //   hide: false,
// //   verbose: false,
// // };

// // import {server} from './server';

// // import {client} from './client';

// let done_building_server = false;
// let building_server = false;

// let done_building_client = false;
// let building_client = false;

// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let build_params = default_params as Params & BuildParams;

export async function build(params:BuildParams, output_params?:Partial<output.OutputParams>)
		:Promise<void>{
	
	_init_build(params, output_params);
	
	output_instance.start_loading(`Building...`);
	
	transpose(build_params, output_params);
	
	await _build_server();
	await _build_client();
	
}

export async function build_server(params:BuildParams, output_params?:Partial<output.OutputParams>)
		:Promise<void>{
	
	_init_build(params, output_params);
	
	output_instance.start_loading(`Building server...`);
	
	transpose(build_params, output_params);
	
	await _build_server();
	
}

export async function build_client(params:BuildParams, output_params?:Partial<output.OutputParams>)
		:Promise<void>{
	
	_init_build(params, output_params);
	
	output_instance.start_loading(`Building client...`);
	
	transpose(build_params, output_params);
	
	await _build_client();
	
}

async function _build_server(){
	
	output_instance.start_loading(`Building server...`);
	
	const cd_cmd = `cd ${build_params.root}/.uranio/server`;
	const ts_cmd = `npx tsc -b`;
	
	const cmd = `${cd_cmd} && ${ts_cmd}`;
	output_instance.log(cmd, 'srv');
	
	const callback = () => {
		output_instance.done_log(`Building client completed.`, 'gnrt');
	};
	
	const reject = (err?:Error) => {
		output_instance.error_log(`Building server failed.`, 'tscb');
		if(err){
			output_instance.error_log(err.message, 'tscb');
		}
	};
	
	util_instance.spawn.spin_and_log(cmd, 'tscb', 'building server', callback, reject);
	
}

async function _build_client(){
	
	output_instance.start_loading(`Building client...`);
	
	const cd_cmd = `cd ${build_params.root}/.uranio/client`;
	const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
	
	const cmd = `${cd_cmd} && ${nu_cmd}`;
	output_instance.log(cmd, 'clnt');
	
	const callback = () => {
		output_instance.done_log(`Building client completed.`, 'gnrt');
	};
	
	const reject = (err?:Error) => {
		output_instance.error_log(`Building server failed.`, 'tscb');
		if(err){
			output_instance.error_log(err.message, 'tscb');
		}
	};
	
	util_instance.spawn.spin_and_log(cmd, 'nuxt', 'building client', callback, reject);
	
}

function _init_build(params:BuildParams, output_params?:Partial<output.OutputParams>)
		:void{
	if(!output_params){
		output_params = {};
	}
	if(!output_params.root){
		output_params.root = params.root;
	}
	output_instance = output.create(output_params);
	
	build_params = merge_params(params);
	const util_params = {
		...build_params
	};
	util_instance = util.create(util_params, output_instance);
}


// export const build = {
	
//   run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
//     build_params.root = root;
		
//     common.init_run(options);
		
//     await build.command();
		
//   },
	
//   command: async ():Promise<void> => {
		
//     output.start_loading('Building...');
		
//     util.read_rc_file();
		
//     build.server();
//     build.client();
		
//     // output.end_log(`Building completed.`);
		
//   },
	
//   server: ():void => {
		
//     output.start_loading('Building server...');
		
//     building_server = true;
		
//     build_params.spinner = true;
		
//     output.start_loading(`Building server...`);
		
//     util.read_rc_file();
		
//     // transpose.run(build_params.root, undefined, {verbose: true});
		
//     const cd_cmd = `cd ${build_params.root}/.uranio/server`;
//     // const ts_cmd = `npx tsc -b --verbose`;
//     const ts_cmd = `npx tsc -b`;
		
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output.log(cmd, 'srv');
		
//     util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
			
//       if(building_client){
//         output.done_log(`Building server completed.`, 'tscb');
//         done_building_server = true;
//         if(done_building_client === true){
//           output.end_log(`Building completed.`);
//         }
//       }else{
//         output.end_log(`Building server completed.`);
//       }
			
//     });
//   },
	
//   client: (args?:Arguments):void => {
		
//     output.start_loading('Building client...');
		
//     building_client = true;
		
//     build_params.spinner = true;
		
//     output.start_loading(`Building client...`);
		
//     // transpose.run(build_params.root, undefined, {verbose: true});
		
//     util.read_rc_file();
		
//     const native = args?.native || false;
		
//     const cd_cmd = `cd ${build_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
		
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output.log(cmd, 'clnt');
		
//     const callback = () => {
			
//       if(building_server){
//         output.done_log(`Building client completed.`, 'gnrt');
//         done_building_client = true;
//         if(done_building_server === true){
//           output.end_log(`Building completed.`);
//         }
//       }else{
//         output.end_log(`Building client completed.`);
//       }
			
//     };
		
//     if(native === true){
//       util.spawn_native_log_command(cmd, 'nuxt', nuxt_color, callback);
//     }else{
//       util.spawn_log_command(cmd, 'nuxt', nuxt_color, callback);
//     }
		
//   }
	
// };
