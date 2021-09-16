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

const tscw_color = '#734de3';

export const server_dev = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await server_dev.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		const cd_cmd = `cd ${conf.root}/.uranio/server`;
		const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
		
		util.spawn_log_command(`${cd_cmd} && ${ts_cmd}`, 'tscw', tscw_color);
		
	}
	
};
