/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as output from '../output/';

import * as util from '../util/';

import {conf, defaults} from '../conf/defaults';
// import {conf} from '../conf/defaults';

import {Arguments} from '../types';

import {transpose} from './transpose';

import {hooks} from './hooks';

export const dev = {
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		conf.filelog = false;
		
		_start_dev();
		
	},
	
	server: ():void => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		const cd_cmd = `cd ${conf.root}/.uranio/server`;
		const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
		
		const cmd = `${cd_cmd} && ${ts_cmd}`;
		output.verbose_log('dev', cmd);
		
		util.spawn_log_command(cmd, 'tscw', tscw_color);
		
	},
	
	client: (args?:Arguments):void => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		const native = args?.native || false;
		
		const cd_cmd = `cd ${conf.root}/.uranio/client`;
		const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
		
		const cmd = `${cd_cmd} && ${nu_cmd}`;
		output.verbose_log(`dev`, cmd);
		
		if(native === true){
			util.spawn_native_log_command(cmd, 'nuxt', nuxt_color);
		}else{
			util.spawn_log_command(cmd, 'nuxt', nuxt_color);
		}
		
	}
	
};

// let watch_client_scanned = false;
// let watch_server_scanned = false;
// let watch_book_scanned = false;
// let watch_lib_scanned = false;
let watch_src_scanned = false;

const cli_options = {
	hide: false,
	verbose: true,
};

const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';

async function _start_dev()
		:Promise<any>{
	
	cli_options.verbose = conf.verbose;
	
	transpose.run(conf.root, undefined, cli_options);
	
	if(conf.repo === 'trx'){
		hooks.run(cli_options);
	}
	
	if(conf.deploy === 'netlify'){
		const ntl_cmd = `npx ntl dev`;
		util.spawn_log_command(ntl_cmd, 'ntlf', nuxt_color);
	}else{
		const nuxt_cmd = `cd ${conf.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`;
		util.spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
	}
	
	const tscw_cmd = `cd ${conf.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`;
	util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
	
	const src_path = `${conf.root}/src/`;
	output.log(`wtch`, `Watching \`src\` folder [${src_path}] ...`, watc_color);
	
	util.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output.done_log(`wtch`, `Initial scanner completed for [${src_path}].`);
			watch_src_scanned = true;
		},
		(_event, _path) => {
			output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			if(!watch_src_scanned){
				return false;
			}
			
			if(_event !== 'unlink'){
				
				transpose.run(conf.root, _path, cli_options);
				
				if(conf.repo === 'trx'){
					hooks.run(cli_options);
				}
				
				output.done_log(`wtch`, `[Book watch] Transposed [${_path}].`);
			
			}else{
				const relative_path = _path.replace(`${conf.root}/src/`, '');
				const new_path_server = `${conf.root}/${defaults.folder}/server/src/${relative_path}`;
				const new_path_client = `${conf.root}/${defaults.folder}/client/src/${relative_path}`;
				util.delete_file_sync(new_path_server);
				util.delete_file_sync(new_path_client);
			}
			_replace_netlify_function_file();
		}
	);
	
}

function _replace_netlify_function_file(){
	const api_file_path = `${conf.root}/.uranio/server/src/functions/api.ts`;
	const result = fs.readFileSync(api_file_path);
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
	fs.writeFileSync(api_file_path, new_content, 'utf8');
	output.verbose_log('less', `Replacing Netlify serverless function file.`);
}

