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

const cli_options = {
	hide: false,
	verbose: false,
};

import {server} from './server';

import {client} from './client';

export const build = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await build.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Building...');
		
		util.read_rc_file();
		
		await server.build.run(conf.root, cli_options);
		await client.build.run(conf.root, cli_options);
		
		// output.end_log(`Building completed.`);
		
	}
	
};
