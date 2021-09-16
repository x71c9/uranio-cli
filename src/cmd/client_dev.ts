/**
 * Client dev command module
 *
 * @packageDocumentation
 */

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

export const client_dev = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await client_dev.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Starting client dev...');
		
		util.read_rc_file();
		
		conf.spinner = true;
		
		// util.sync_exec(`cd ${conf.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`);
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(
				`cd ${conf.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`,
				`nuxt`,
				`Nuxt dev.`,
				resolve,
				reject
			);
		});
		
	}
	
};
