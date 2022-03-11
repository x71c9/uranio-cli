/**
 * Build command module
 *
 * @packageDocumentation
 */

// import {Options, Arguments} from '../types';

// import tsnode from 'ts-node';

// import {default_params, defaults} from '../conf/defaults';
import {default_params} from '../conf/defaults';

import * as output from '../output/index';

// import * as util from '../util/index';

import {Params} from '../types';

// import {hooks} from './hooks';

import {transpose} from './transpose';

import {merge_params} from './common';

import {generate} from './generate';

// import {BuildParams} from './types';

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

// let util_instance:util.UtilInstance;

let build_params = default_params as Params;

export async function build(params:Params, included=false)
		:Promise<void>{
	
	_init_build(params);
	
	output_instance.start_loading(`Building...`);
	
	await transpose(build_params, true);
	
	await generate(build_params, true);
	
	// await hooks(build_params, true);
	
	// await _build_server();
	// await _build_client();
	
	if(included){
		output_instance.done_log('Build completed.');
	}else{
		output_instance.end_log('Build completed.');
	}
	
}

// export async function build_server(params:Partial<Params>)
//     :Promise<void>{
	
//   _init_build(params);
	
//   output_instance.start_loading(`Building server...`);
	
//   // await transpose(build_params, true);
	
//   // await hooks(build_params, true);
	
//   await _build_server();
	
//   output_instance.end_log('Build server completed.');
	
// }

// export async function build_client(params:Partial<Params>)
//     :Promise<void>{
	
//   _init_build(params);
	
//   output_instance.start_loading(`Building client...`);
	
//   // await transpose(build_params, true);
	
//   // await hooks(build_params, true);
	
//   // await _build_client();
	
//   output_instance.end_log('Build client completed.');
	
// }

// async function _build_server(){
	
//   output_instance.start_loading(`Building server...`);
//   // building_server = true;
	
//   // const cd_cmd = `cd ${build_params.root}/.uranio/server`;
//   // const ts_cmd = `npx tsc -b`;
	
//   // const cmd = `${cd_cmd} && ${ts_cmd}`;
	
//   // const callback = () => {
//   //   done_building_server = true;
//   //   if(building_client){
//   //     output_instance.done_log(`Building server completed.`, 'tscb');
//   //     if(done_building_client === true){
//   //       output_instance.end_log(`Building completed.`);
//   //     }
//   //   }else{
//   //     output_instance.end_log(`Building server completed.`);
//   //   }
//   // };
	
//   // const reject = (err?:Error) => {
//   //   done_building_server = true;
//   //   output_instance.error_log(`Building server failed.`, 'tscb');
//   //   if(err){
//   //     output_instance.error_log(err.message, 'tscb');
//   //   }
//   // };
	
//   // util_instance.spawn.spin_and_verbose_log(cmd, 'tscb', 'building server', undefined, callback, reject);
	
//   await generate(build_params, true);
	
// }

// async function _build_client(){
	
//   output_instance.start_loading(`Building client...`);
//   building_client = true;
	
//   const cd_cmd = `cd ${build_params.root}/.uranio/client`;
//   const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
	
//   const cmd = `${cd_cmd} && ${nu_cmd}`;
	
//   const callback = () => {
//     done_building_client = true;
//     if(building_server){
//       output_instance.done_log(`Building client completed.`, 'nugn');
//       if(done_building_server === true){
//         output_instance.end_log(`Building completed.`);
//       }
//     }else{
//       output_instance.end_log(`Building client completed.`);
//     }
//   };
	
//   const reject = (err?:Error) => {
//     done_building_client = true;
//     output_instance.error_log(`Building server failed.`, 'tscb');
//     if(err){
//       output_instance.error_log(err.message, 'tscb');
//     }
//   };
	
//   util_instance.spawn.spin_and_verbose_log(
//     cmd, 'nuxt', 'building client', undefined, callback, reject
//   );
	
// }

function _init_build(params:Partial<Params>)
		:void{
	
	build_params = merge_params(params);
	
	output_instance = output.create(build_params);
	
	// util_instance = util.create(build_params, output_instance);
	
	// util_instance.must_be_initialized();
	
}

