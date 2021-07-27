/**
 * Init command module
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import fs from 'fs';

import path from 'path';

import chokidar from 'chokidar';

import chalk from 'chalk';

import * as output from '../output/';

import * as util from '../util/';

import {conf} from '../conf/defaults';

import {transpose} from './transpose';

export const dev = {
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		_start_dev();
		
	}
	
};

let watch_client_scanned = false;
let watch_server_scanned = false;
// let watch_transposed_server_scanned = false;

const cli_options = {
	hide: false,
	verbose: true,
	prefix: chalk.green('[urn] ')
};

async function _start_dev()
		:Promise<any>{
	
	conf.prefix = chalk.green(`[urn] `);
	
	copyFolderRecursiveSync(
		`${conf.root}/src/client/.`,
		`${conf.root}/.uranio/client/src/.`
	);
	
	transpose.run(conf.root, cli_options);
	
	const nuxt_dev = cp.spawn(
		'npx',
		[`nuxt`, `-c`, `.uranio/client/nuxt.config.js`],
		// {stdio: [null, 'inherit', 'inherit']}
	);
	
	const tsc_watch = cp.spawn(
		'npx',
		[`tsc`, `-w`, `--project`, `${conf.root}/tsconfig.json`],
		// {stdio: [null, null, null]}
	);
	
	if(nuxt_dev.stdout){
		nuxt_dev.stdout.setEncoding('utf8');
		nuxt_dev.stdout.on('data', (chunk) => {
			const plain_text = chunk
				.toString()
				.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
				.replace(/\r?\n|\r/g, ' ');
			output.verbose_log('nuxt', plain_text);
		});
	}
	
	if(nuxt_dev.stderr){
		nuxt_dev.stderr.setEncoding('utf8');
		nuxt_dev.stderr.on('data', (chunk) => {
			const plain_text = chunk
				.toString()
				.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
				.replace(/\r?\n|\r/g, ' ');
			output.verbose_log('nuxt', plain_text);
		});
	}
	
	if(tsc_watch.stdout){
		tsc_watch.stdout.setEncoding('utf8');
		tsc_watch.stdout.on('data', (chunk) => {
			const plain_text = chunk
				.toString()
				.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
				.replace(/\r?\n|\r/g, ' ');
			output.verbose_log('tscw', plain_text);
		});
	}
	
	if(tsc_watch.stderr){
		tsc_watch.stderr.setEncoding('utf8');
		tsc_watch.stderr.on('data', (chunk) => {
			const plain_text = chunk
				.toString()
				.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
				.replace(/\r?\n|\r/g, ' ');
			output.verbose_log('tscw', plain_text);
		});
	}
	
	const client_folder = `${conf.root}/src/client/.`;
	output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
	
	const watch_client = chokidar.watch(client_folder).on('ready', () => {
		output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
		watch_client_scanned = true;
	}).on('all', (_event, _path) => {
		output.verbose_log(_event, _path);
		if(!watch_client_scanned){
			return false;
		}
		copyFolderRecursiveSync(
			`${conf.root}/src/client/.`,
			`${conf.root}/.uranio/client/src/.`
		);
	});
	
	const server_folder = `${conf.root}/src/server/.`;
	output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
	
	const watch_server = chokidar.watch(server_folder).on('ready', () => {
		output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
		watch_server_scanned = true;
	}).on('all', (_event, _path) => {
		output.verbose_log(_event, _path);
		if(!watch_server_scanned){
			return false;
		}
		transpose.run(conf.root, cli_options);
	});
	
	// const transposed_server_folder = `${conf.root}/${defaults.folder}/server/.`;
	// output.log(`wtch`, `Watching Transposed Server Folder [${server_folder}] ...`);
	
	// const watch_transposed_server = chokidar.watch(transposed_server_folder).on('ready', () => {
	//   output.log(`wtch`, `Initial scanner completed for [${transposed_server_folder}].`);
	//   watch_transposed_server_scanned = true;
	// }).on('all', (_event, _path) => {
	//   output.verbose_log(_event, _path);
	//   if(!watch_transposed_server_scanned){
	//     return false;
	//   }
	// });



	process.on('SIGINT', function() {
		watch_client.close().then(() => {
			output.log(`wtch`, 'Stop watching client folder.');
		});
		watch_server.close().then(() => {
			output.log(`wtch`, 'Stop watching server folder.');
		});
		// watch_transposed_server.close().then(() => {
		//   output.log(`wtch`, 'Stop watching transposed server folder.');
		// });
		process.stdout.write("\r--- Caught interrupt signal ---\n");
		if(nuxt_dev.pid){
			process.kill(nuxt_dev.pid);
		}
		if(tsc_watch.pid){
			process.kill(tsc_watch.pid);
		}
	});
	
}
function copyFileSync(source:string, target:string) {
	let targetFile = target;
	// If target is a directory, a new file with the same name will be created
	if(fs.existsSync(target)) {
		if(fs.lstatSync(target).isDirectory()) {
			targetFile = path.join(target, path.basename(source));
		}
	}
	fs.writeFileSync(targetFile, fs.readFileSync(source));
}
//
function copyFolderRecursiveSync(source:string, target:string) {
	let files = [];
	// Check if folder needs to be created or integrated
	const targetFolder = path.join( target, path.basename( source ) );
	if(!fs.existsSync(targetFolder)){
		fs.mkdirSync( targetFolder );
	}
	// Copy
	if(fs.lstatSync(source).isDirectory()) {
		files = fs.readdirSync(source);
		files.forEach(function (file) {
			const curSource = path.join(source, file);
			if(fs.lstatSync(curSource).isDirectory()) {
				copyFolderRecursiveSync(curSource, targetFolder);
			}else if(!curSource.endsWith('.swp')){
				copyFileSync(curSource, targetFolder);
			}
		});
	}
}

