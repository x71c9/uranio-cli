/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as output from '../output/';

import * as util from '../util/';

import {conf, defaults} from '../conf/defaults';

import {transpose} from './transpose';

export const dev = {
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		conf.filelog = false;
		
		_start_dev();
		
	}
	
};

let watch_client_scanned = false;
let watch_server_scanned = false;
let watch_book_scanned = false;
let watch_lib_scanned = false;

const cli_options = {
	hide: false,
	verbose: true,
};

const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';

async function _start_dev()
		:Promise<any>{
	
	util.copy_folder_recursive_sync(
		`${conf.root}/src/client/.`,
		`${conf.root}/.uranio/client/src/.`
	);
	
	transpose.run(conf.root, undefined, cli_options);
	
	if(conf.deploy === 'netlify'){
		const ntl_cmd = `npx ntl dev`;
		util.spawn_log_command(ntl_cmd, 'ntlf', nuxt_color);
	}else{
		const nuxt_cmd = `npx nuxt -c ${defaults.folder}/client/nuxt.config.js`;
		util.spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
	}
	
	const tscw_cmd = `npx tsc -w --project ${conf.root}/tsconfig.json`;
	util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
	
	const client_folder = `${conf.root}/src/client/.`;
	output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
	
	util.watch(
		client_folder,
		`watching client folder.`,
		() => {
			output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
			watch_client_scanned = true;
		},
		(_event, _path) => {
			output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			if(!watch_client_scanned){
				return false;
			}
			if(_path.endsWith('.swp')){
				return false;
			}
			const relative_path_to_client = _path.replace(`${conf.root}/src/client/`, '');
			const new_path = `${conf.root}/${defaults.folder}/client/src/${relative_path_to_client}`;
			if(_event === 'unlink'){
				util.delete_file_sync(new_path);
			}else{
				output.log(`wtch`, `[Client watch] Copy file sync [${_path}] to [${new_path}]`);
				util.copy_file_sync(_path, new_path);
			}
		}
	);
	
	const server_folder = `${conf.root}/src/server/.`;
	output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
	
	util.watch(
		server_folder,
		`watching server folder.`,
		() => {
			output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
			watch_server_scanned = true;
		},
		(_event, _path) => {
			output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			if(!watch_server_scanned){
				return false;
			}
			const relative_path_to_server = _path.replace(`${conf.root}/src/server/`, '');
			const new_path = `${conf.root}/${defaults.folder}/server/${relative_path_to_server}`;
			if(_event === 'unlink'){
				output.log(`wtch`, `[Server watch] Unlink [${_path}].`);
				util.delete_file_sync(new_path);
			}else{
				output.log(`wtch`, `[Server watch] Transpose [${_path}].`);
				transpose.run(conf.root, _path, cli_options);
			}
			_replace_netlify_function_file();
		}
	);
	
	const book_path = `${conf.root}/src/book.ts`;
	output.log(`wtch`, `Watching Book file [${book_path}] ...`);
	
	util.watch(
		book_path,
		`watching book file.`,
		() => {
			output.log(`wtch`, `Initial scanner completed for [${book_path}].`);
			watch_book_scanned = true;
		},
		(_event, _path) => {
			output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			if(!watch_book_scanned){
				return false;
			}
			if(_event !== 'unlink'){
				output.log(`wtch`, `[Book watch] Transpose [${_path}].`);
				transpose.run(conf.root, _path, cli_options);
			}
			_replace_netlify_function_file();
		}
	);
	
	const lib_path = `${conf.root}/.uranio/lib/.`;
	output.log(`wtch`, `Watching Lib folder [${lib_path}] ...`);
	
	util.watch(
		lib_path,
		`watching lib folder.`,
		() => {
			output.log(`wtch`, `Initial scanner completed for [${lib_path}].`);
			watch_lib_scanned = true;
		},
		(_event, _path) => {
			if(_event !== 'add' && _event !== 'addDir'){
				output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			}
			if(!watch_lib_scanned){
				return false;
			}
			_replace_netlify_function_file();
		}
	);
	
}

function _replace_netlify_function_file(){
	const api_file_path = `${conf.root}/.uranio/server/functions/api.ts`;
	const result = fs.readFileSync(api_file_path);
	let new_content = result.toString();
	const splitted = new_content.split(`\n`);
	const comment = '// uranio autoupdate';
	if(splitted[splitted.length - 1] === comment){
		splitted.splice(-1);
		new_content = splitted.join('\n');
	}else{
		new_content += `\n${comment}`;
	}
	fs.writeFileSync(api_file_path, new_content, 'utf8');
}

