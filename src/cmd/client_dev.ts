/**
 * Client dev command module
 *
 * @packageDocumentation
 */

import {Options, Arguments} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

const nuxt_color = '#677cc7';

export const client_dev = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await client_dev.command();
		
	},
	
	command: async (args?:Arguments):Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		const native = args?.native || false;
		
		const cd_cmd = `cd ${conf.root}/.uranio/client`;
		const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
		
		if(native === true){
			util.spawn_native_log_command(`${cd_cmd} && ${nu_cmd}`, 'nuxt', nuxt_color);
		}else{
			util.spawn_log_command(`${cd_cmd} && ${nu_cmd}`, 'nuxt', nuxt_color);
		}
	}
	
};
