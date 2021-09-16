/**
 * Build command module
 *
 * @packageDocumentation
 */

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import {hooks} from './hooks';

import {transpose} from './transpose';

const cli_options = {
	hide: false,
	verbose: true,
};

export const build = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await build.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Building...');
		
		util.read_rc_file();
		
		transpose.run(conf.root, undefined, cli_options);
		
		if(conf.repo === 'trx'){
			hooks.run(cli_options);
		}
		
		conf.spinner = true;
		
		// util.sync_exec(`cd ${conf.root}/.uranio/server/ && npx tsc -b`);
		
		// util.sync_exec(`cd ${conf.root}/.uranio/client/ && npx nuxt generate -c ./nuxt.config.js`);
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(
				`cd ${conf.root}/.uranio/server/ && npx tsc -b --verbose`,
				`tscb`,
				`Compiling Typescript server.`,
				resolve,
				reject
			);
		});
		
		output.done_log(`tscb`, `Compiled server.`);
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(
				`cd ${conf.root}/.uranio/client/ && npx nuxt generate -c ./nuxt.config.js`,
				`nuxt`,
				`Generating nuxt file.`,
				resolve,
				reject
			);
		});
		
		output.done_log(`tscb`, `Compiled client.`);
		
		output.end_log(`Build completed.`);
		
	}
	
};
