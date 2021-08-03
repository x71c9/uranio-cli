/**
 * Init command module
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import fs from 'fs';

import path from 'path';

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

let user_exit = false;

async function _start_dev()
		:Promise<any>{
	
	// conf.prefix = chalk.green(`[urn] `);
	
	_copy_folder_recursive_sync(
		`${conf.root}/src/client/.`,
		`${conf.root}/.uranio/client/src/.`
	);
	
	transpose.run(conf.root, undefined, cli_options);
	
	// const nuxt_cmd = `npx nuxt -c ${defaults.folder}/client/nuxt.config.js`;
	// const nuxt_child = _spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
	
	const ntl_cmd = `npx ntl dev`;
	const ntl_child = _spawn_log_command(ntl_cmd, 'ntl', nuxt_color);
	
	const tscw_cmd = `npx tsc -w --project ${conf.root}/tsconfig.json`;
	const tscw_child = _spawn_log_command(tscw_cmd, 'tscw', tscw_color);
	
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
			_delete_file_sync(new_path);
		}else{
			output.log(`wtch`, `[Client watch] Copy file sync [${_path}] to [${new_path}]`);
			_copy_file_sync(_path, new_path);
		}
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
			_delete_file_sync(new_path);
		}else{
			output.log(`wtch`, `[Server watch] Transpose [${_path}].`);
			transpose.run(conf.root, _path, cli_options);
		}
		// _replace_netlify_function_file();
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
	
	process.on('SIGINT', function() {
		user_exit = true;
		watch_client.close().then(() => {
			output.log(`wtch`, 'Stop watching client folder.');
		});
		watch_server.close().then(() => {
			output.log(`wtch`, 'Stop watching server folder.');
		});
		watch_book.close().then(() => {
			output.log(`wtch`, 'Stop watching book file.');
		});
		process.stdout.write("\r--- Caught interrupt signal ---\n");
		// if(nuxt_child.pid){
		//   process.kill(nuxt_child.pid);
		// }
		if(ntl_child.pid){
			process.kill(ntl_child.pid);
		}
		if(tscw_child.pid){
			process.kill(tscw_child.pid);
		}
	});
	
}

// function _replace_netlify_function_file(){
//   util.copy_file(
//     'fnc',
//     `${conf.root}/.uranio/functions/api.ts`,
//     `${conf.root}/.uranio/functions/api.ts`
//   );
// }

function _clean_chunk(chunk:string){
	const plain_text = chunk
		.toString()
		.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
		.replace(/\r?\n|\r/g, ' ');
	return plain_text;
}

function _spawn_log_command(command:string, context:string, color:string){
	
	const splitted_command = command.split(' ');
	
	const spawned = cp.spawn(
		splitted_command[0],
		splitted_command.slice(1),
		// {stdio: [null, 'inherit', 'inherit']}
	);
	
	if(spawned.stdout){
		spawned.stdout.setEncoding('utf8');
		spawned.stdout.on('data', (chunk:string) => {
			const splitted_chunk = chunk.split('\n');
			for(const split of splitted_chunk){
				const plain_text = _clean_chunk(split);
				if(plain_text.includes('<error>')){
					output.error_log(context, plain_text);
					// process.stdout.write(chunk);
				}else if(plain_text != ''){
					output.verbose_log(context, plain_text, color);
				}
			}
		});
	}
	
	if(spawned.stderr){
		spawned.stderr.setEncoding('utf8');
		spawned.stderr.on('data', (chunk) => {
			const splitted_chunk = chunk.split('\n');
			for(const split of splitted_chunk){
				const plain_text = _clean_chunk(split);
				if(plain_text !== ''){
					output.error_log(context, plain_text);
				}
				// process.stdout.write(chunk);
				// process.stderr.write(`[${context}] ${chunk}`);
			}
		});
	}
	
	spawned.on('close', (code) => {
		switch(code){
			case 0:{
				output.verbose_log(context, `Closed.`, color);
				break;
			}
			default:{
				if(user_exit === false){
					output.error_log(context, `Child process exited with code ${code}`);
				}
			}
		}
	});
	
	spawned.on('error', (err) => {
		if(user_exit === false){
			output.error_log(context, `${err}`);
		}
	});
	
	return spawned;
}


function _delete_file_sync(file_path:string) {
	fs.unlinkSync(file_path);
	output.verbose_log('dl', `Deleted file ${file_path}.`);
}

function _copy_file_sync(source:string, target:string) {
	let target_file = target;
	if(fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
		target_file = path.join(target, path.basename(source));
	}
	fs.writeFileSync(target_file, fs.readFileSync(source));
	output.verbose_log('cp', `Copied file ${target_file}.`);
}


function _copy_folder_recursive_sync(source:string, target:string) {
	let files = [];
	const target_folder = path.join(target, path.basename( source ));
	if(!fs.existsSync(target_folder)){
		fs.mkdirSync( target_folder );
	}
	if(fs.lstatSync(source).isDirectory()) {
		files = fs.readdirSync(source);
		files.forEach(function (file) {
			const cur_source = path.join(source, file);
			if(fs.lstatSync(cur_source).isDirectory()) {
				_copy_folder_recursive_sync(cur_source, target_folder);
			}else if(!cur_source.endsWith('.swp')){
				_copy_file_sync(cur_source, target_folder);
			}
		});
	}
}

