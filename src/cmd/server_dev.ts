/**
 * Server dev command module
 *
 * @packageDocumentation
 */

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

export const server_dev = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await server_dev.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Starting server dev...');
		
		util.read_rc_file();
		
		conf.spinner = true;
		
		// util.sync_exec(`cd ${conf.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`);
		
		await new Promise((resolve, reject) => {
			util.spawn_cmd(
				`cd ${conf.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`,
				`tscw`,
				`Typescript watch server.`,
				resolve,
				reject
			);
		});
		
	}
	
};
