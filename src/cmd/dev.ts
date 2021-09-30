/**
 * Dev command module
 *
 * @packageDocumentation
 */

import * as output from '../output/';

import * as util from '../util/';

import {default_params, defaults} from '../conf/defaults';

import {Params} from '../types';

import {transpose} from './transpose';

import {hooks} from './hooks';

import {merge_params} from './common';

import {DevParams} from './types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let dev_params = default_params as Params & DevParams;

// let watch_client_scanned = false;
// let watch_server_scanned = false;
// let watch_book_scanned = false;
let watch_lib_scanned = false;
let watch_src_scanned = false;

// const cli_options = {
//   hide: false,
//   verbose: true,
// };

// const nuxt_color = '#677cc7';
// const tscw_color = '#734de3';
// const watc_color = '#687a6a';

export async function dev(params:DevParams, output_params?:Partial<output.OutputParams>):Promise<void>{
	
	_init_dev(params, output_params);
	
	output_instance.start_loading(`Developing...`);
	
	await _dev_server();
	await _dev_client();
	
}

export async function dev_server(params:DevParams, output_params?:Partial<output.OutputParams>):Promise<void>{
	_init_dev(params, output_params);
	await _dev_server();
}

export async function dev_client(params:DevParams, output_params?:Partial<output.OutputParams>):Promise<void>{
	_init_dev(params, output_params);
	output_instance.start_loading(`Developing client...`);
	await _dev_client();
}

async function _dev_server(){
	
	output_instance.start_loading(`Developing server...`);
	
	const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/server`;
	const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
	
	const cmd = `${cd_cmd} && ${ts_cmd}`;
	output_instance.verbose_log(cmd, 'dev');
	
	util_instance.spawn.log(cmd, 'tscw', 'developing server');
	
}

async function _dev_client(){
	
	output_instance.start_loading(`Developing client...`);
	
	const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/client`;
	const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
	
	const cmd = `${cd_cmd} && ${nu_cmd}`;
	output_instance.verbose_log(cmd, 'dev');
	
	util_instance.spawn.log(cmd, 'nuxt', 'developing client');
	
}

function _init_dev(params:DevParams, output_params?:Partial<output.OutputParams>)
		:void{
	if(!output_params){
		output_params = {};
	}
	if(!output_params.root){
		output_params.root = params.root;
	}
	output_instance = output.create(output_params);
	
	dev_params = merge_params(params);
	const util_params = {
		...dev_params
	};
	util_instance = util.create(util_params, output_instance);
	
	_watch(output_params);
	
}

function _watch(output_params?:Partial<output.OutputParams>){
	
	const src_path = `${dev_params.root}/src/`;
	
	output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
	
	util_instance.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
			watch_src_scanned = true;
		},
		(event, path) => {
			output_instance.verbose_log(`${event} ${path}`, 'wtch');
			if(!watch_src_scanned){
				return false;
			}
			if(event !== 'unlink'){
				transpose({...dev_params, file: path}, output_params);
				if(dev_params.repo === 'trx'){
					hooks(dev_params, output_params);
				}
				output_instance.done_log(`[Book watch] Transposed [${path}].`, 'wtch');
			}else{
				const relative_path = path.replace(`${dev_params.root}/src/`, '');
				const new_path_server = `${dev_params.root}/${defaults.folder}/server/src/${relative_path}`;
				const new_path_client = `${dev_params.root}/${defaults.folder}/client/src/${relative_path}`;
				util_instance.fs.remove_file_sync(new_path_server);
				util_instance.fs.remove_file_sync(new_path_client);
			}
			_replace_netlify_function_file();
		}
	);
	const lib_path = `${dev_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}/`;
	output_instance.log(`Watching uranio repo folder [${lib_path}] ...`, 'wtch');
	util_instance.watch(
		lib_path,
		`watching uranio repo folder.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${lib_path}].`, 'wtch');
			watch_lib_scanned = true;
		},
		(event, path) => {
			output_instance.verbose_log(`${event} ${path}`, 'wtch');
			if(!watch_lib_scanned){
				return false;
			}
			_replace_netlify_function_file();
		}
	);
}

function _replace_netlify_function_file(){
	const api_file_path = `${dev_params.root}/.uranio/server/src/functions/api.ts`;
	const result = util_instance.fs.read_file_sync(api_file_path);
	let new_content = result.toString();
	const splitted = new_content.split(`\n`);
	const comment = '// uranio autoupdate';
	if(splitted[splitted.length - 2] !== comment){
		new_content += `\n${comment}`;
		new_content += `\n// 0`;
	}else{
		const last_update = splitted.splice(-1);
		const last_update_split = last_update[0].split(' ');
		const update_number = Number(last_update_split[1]);
		new_content = splitted.join('\n');
		new_content += `\n// ${update_number + 1}`;
	}
	util_instance.fs.write_file_sync(api_file_path, new_content, 'utf8');
	output_instance.verbose_log(`Replacing Netlify serverless function file.`, 'less');
}



// export const dev = {
	
//   command: async ():Promise<void> => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     dev_params.filelog = false;
		
//     _start_dev();
		
//   },
	
//   server: ():void => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     const cd_cmd = `cd ${dev_params.root}/.uranio/server`;
//     const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
		
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
		
//     util_instance.spawn_log_command(cmd, 'tscw', tscw_color);
		
//   },
	
//   client: (args?:Arguments):void => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     const native = args?.native || false;
		
//     const cd_cmd = `cd ${dev_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
		
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
		
//     if(native === true){
//       util_instance.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
//     }else{
//       util_instance.spawn_log_command(cmd, 'nuxt', nuxt_color);
//     }
		
//   }
	
// };



// }

// async function _start_dev(params:DevParams, output_params?:Partial<output_instance.OutputParams>)
//     :Promise<any>{
//   transpose(params, output_params);
//   // if(dev_params.repo === 'trx'){
//   //   hooks.run(cli_options);
//   // }
//   if(dev_params.deploy === 'netlify'){
//     const ntl_cmd = `npx ntl dev`;
//     util_instance.spawn.log(ntl_cmd, 'ntlf', 'developing netlify');
//   }else{
//     const nuxt_cmd = `cd ${dev_params.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`;
//     util_instance.spawn.log(nuxt_cmd, 'nuxt', 'developing nuxt');
//   }
//   const tscw_cmd = `cd ${dev_params.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`;
//   util_instance.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
//   const src_path = `${dev_params.root}/src/`;
//   output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch', watc_color);
//   util_instance.watch(
//     src_path,
//     `watching \`src\` folder.`,
//     () => {
//       output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
//       watch_src_scanned = true;
//     },
//     (event, path) => {
//       output_instance.verbose_log(`${event} ${path}`, 'wtch', watc_color);
//       if(!watch_src_scanned){
//         return false;
//       }
//       if(event !== 'unlink'){
//         transpose.run(dev_params.root, path, cli_options);
//         if(dev_params.repo === 'trx'){
//           hooks.run(cli_options);
//         }
//         output_instance.done_log(`[Book watch] Transposed [${path}].`, 'wtch');
//       }else{
//         const relative_path = path.replace(`${dev_params.root}/src/`, '');
//         const new_path_server = `${dev_params.root}/${defaults.folder}/server/src/${relative_path}`;
//         const new_path_client = `${dev_params.root}/${defaults.folder}/client/src/${relative_path}`;
//         util_instance.delete_file_sync(new_path_server);
//         util_instance.delete_file_sync(new_path_client);
//       }
//       _replace_netlify_function_file();
//     }
//   );
//   const lib_path = `${dev_params.root}/${defaults.folder}/server/src/${defaults.repo_folder}/`;
//   output_instance.log(`Watching uranio repo folder [${lib_path}] ...`, 'wtch', watc_color);
//   util_instance.watch(
//     lib_path,
//     `watching uranio repo folder.`,
//     () => {
//       output_instance.done_log(`Initial scanner completed for [${lib_path}].`, 'wtch');
//       watch_lib_scanned = true;
//     },
//     (event, path) => {
//       output_instance.verbose_log(`${event} ${path}`, 'wtch', watc_color);
//       if(!watch_lib_scanned){
//         return false;
//       }
//       _replace_netlify_function_file();
//     }
//   );
// }

// export const dev = {
	
//   command: async ():Promise<void> => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     dev_params.filelog = false;
		
//     _start_dev();
		
//   },
	
//   server: ():void => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     const cd_cmd = `cd ${dev_params.root}/.uranio/server`;
//     const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
		
//     const cmd = `${cd_cmd} && ${ts_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
		
//     util_instance.spawn_log_command(cmd, 'tscw', tscw_color);
		
//   },
	
//   client: (args?:Arguments):void => {
		
//     output_instance.stop_loading();
		
//     util_instance.read_rc_file();
		
//     const native = args?.native || false;
		
//     const cd_cmd = `cd ${dev_params.root}/.uranio/client`;
//     const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
		
//     const cmd = `${cd_cmd} && ${nu_cmd}`;
//     output_instance.verbose_log(cmd, 'dev');
		
//     if(native === true){
//       util_instance.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
//     }else{
//       util_instance.spawn_log_command(cmd, 'nuxt', nuxt_color);
//     }
		
//   }
	
// };
