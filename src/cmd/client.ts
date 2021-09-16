/**
 * Client commands module
 *
 * @packageDocumentation
 */

import {Options, Arguments} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import {done_building_server, building_server} from './server';

const nuxt_color = '#677cc7';

export let done_building_client = false;
export let building_client = false;

export const client = {
	
	dev: {
		
		run: async (root:string, options?:Partial<Options>):Promise<void> => {
			
			conf.root = root;
			
			common.init_run(options);
			
			await client.dev.command();
			
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
		
	},
	
	build: {
		
		run: async (root:string, options?:Partial<Options>):Promise<void> => {
			
			conf.root = root;
			
			common.init_run(options);
			
			client.build.command();
			
		},
		
		command: async (args?:Arguments):Promise<void> => {
			
			building_client = true;
			
			conf.spinner = true;
			
			output.start_loading(`Building client...`);
			
			util.read_rc_file();
			
			const native = args?.native || false;
			
			const cd_cmd = `cd ${conf.root}/.uranio/client`;
			const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
			
			const cmd = `${cd_cmd} && ${nu_cmd}`;
			output.log(`clnt`, cmd);
			
			const callback = () => {
				
				if(building_server){
					output.done_log(`gnrt`, `Building client completed.`);
					done_building_client = true;
					if(done_building_server === true){
						output.end_log(`Building completed.`);
					}
				}else{
					output.end_log(`Building client completed.`);
				}
				
			};
			
			if(native === true){
				util.spawn_native_log_command(cmd, 'nuxt', nuxt_color, callback);
			}else{
				util.spawn_log_command(cmd, 'nuxt', nuxt_color, callback);
			}
			
		}
		
	}
	
};
