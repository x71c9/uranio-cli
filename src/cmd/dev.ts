/**
 * Init command module
 *
 * @packageDocumentation
 */

import chokidar from 'chokidar';

// import chalk from 'chalk';

import * as output from '../output/';

import * as util from '../util/';

import {conf, defaults} from '../conf/defaults';
// import {conf} from '../conf/defaults';

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

const cli_options = {
	hide: false,
	verbose: true,
};

const nuxt_color = '#677cc7';
// const tscw_color = '#8a5b5b';
const tscw_color = '#734de3';
const watc_color = '#687a6a';

async function _start_dev()
		:Promise<any>{
	
	// conf.prefix = chalk.green(`[urn] `);
	
	util.copy_folder_recursive_sync(
		`${conf.root}/src/client/.`,
		`${conf.root}/.uranio/client/src/.`
	);
	
	transpose.run(conf.root, undefined, cli_options);
	
	// const nuxt_cmd = `npx nuxt -c ${defaults.folder}/client/nuxt.config.js`;
	// const nuxt_child = _spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
	
	const ntl_cmd = `npx ntl dev`;
	util.spawn_log_command(ntl_cmd, 'ntl', nuxt_color);
	
	const tscw_cmd = `npx tsc -w --project ${conf.root}/tsconfig.json`;
	util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);

	const client_folder = `${conf.root}/src/client/.`;
	output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
	
	const watch_client = chokidar.watch(client_folder).on('ready', () => {
		output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
		watch_client_scanned = true;
	}).on('all', (_event, _path) => {
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
	});
	
	util.watch_child_list.push({
		child: watch_client,
		context: `wtch`,
		text: `watching client folder.`
	});
	
	const server_folder = `${conf.root}/src/server/.`;
	output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
	
	const watch_server = chokidar.watch(server_folder).on('ready', () => {
		output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
		watch_server_scanned = true;
	}).on('all', (_event, _path) => {
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
		// _replace_netlify_function_file();
	});
	
	util.watch_child_list.push({
		child: watch_server,
		context: `wtch`,
		text: `watching server folder.`
	});
	
	const book_path = `${conf.root}/src/book.ts`;
	output.log(`wtch`, `Watching Book file [${book_path}] ...`);
	
	const watch_book = chokidar.watch(book_path).on('ready', () => {
		output.log(`wtch`, `Initial scanner completed for [${book_path}].`);
		watch_book_scanned = true;
	}).on('all', (_event, _path) => {
		output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
		if(!watch_book_scanned){
			return false;
		}
		if(_event !== 'unlink'){
			output.log(`wtch`, `[Book watch] Transpose [${_path}].`);
			transpose.run(conf.root, _path, cli_options);
		}
		// _replace_netlify_function_file();
	});
	
	util.watch_child_list.push({
		child: watch_book,
		context: `wtch`,
		text: `watching book file.`
	});
	
	// process.on('SIGINT', function() {
	//   util.status.user_exit = true;
	//   watch_client.close().then(() => {
	//     output.log(`wtch`, 'Stop watching client folder.');
	//   });
	//   watch_server.close().then(() => {
	//     output.log(`wtch`, 'Stop watching server folder.');
	//   });
	//   watch_book.close().then(() => {
	//     output.log(`wtch`, 'Stop watching book file.');
	//   });
	//   process.stdout.write("\r--- Caught interrupt signal ---\n");
	//   // if(nuxt_child.pid){
	//   //   process.kill(nuxt_child.pid);
	//   // }
	//   if(ntl_child.pid){
	//     process.kill(ntl_child.pid);
	//   }
	//   if(tscw_child.pid){
	//     process.kill(tscw_child.pid);
	//   }
	// });
	
}

// function _replace_netlify_function_file(){
//   util.copy_file(
//     'fnc',
//     `${conf.root}/.uranio/functions/api.ts`,
//     `${conf.root}/.uranio/functions/api.ts`
//   );
// }

