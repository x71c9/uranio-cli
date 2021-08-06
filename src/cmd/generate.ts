/**
 * Generate command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import {transpose} from './transpose';

const cli_options = {
	hide: false,
	verbose: true,
};

export const generate = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await generate.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Generating...');
		
		util.read_rc_file();
		
		const client_folder = `${conf.root}/src/client/.`;
		
		if(!fs.existsSync(client_folder)){
			output.wrong_end_log(`No such file or directory [${client_folder}]`);
			process.exit(0);
		}
		
		util.copy_folder_recursive_sync(
			client_folder,
			`${conf.root}/.uranio/client/src/.`
		);
		
		transpose.run(conf.root, undefined, cli_options);
		
		// util.sync_exec(`npx tsc -b --verbose`);
		
		// util.sync_exec(`npx nuxt generate -c .uranio/client/nuxt.config.js`);
		
		// util.spawn_log_command(`npx tsc -b --verbose`, `gnrt`, '');
		
		// util.spawn_log_command(`npx nuxt generate -c .uranio/client/nuxt.config.js`, `gnrt`, '');
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(`npx tsc -b --verbose`, `tscb`, `Compiling Typescript server.`, resolve, reject);
		});
		
		output.done_log(`tscb`, `Compiled server.`);
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(`npx nuxt generate -c .uranio/client/nuxt.config.js`, `nuxt`, `Generating nuxt file.`, resolve, reject);
		});
		
		output.done_log(`tscb`, `Compiled client.`);
		
		output.end_log(`Generate completed.`);
		
	}
	
};
