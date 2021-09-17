/**
 * Server commands module
 *
 * @packageDocumentation
 */

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

// import {transpose} from './transpose';

import {done_building_client, building_client} from './client';

const tscw_color = '#734de3';

export let done_building_server = false;
export let building_server = false;

export const server = {
	
	dev: {
		
		run: async (root:string, options?:Partial<Options>):Promise<void> => {
			
			conf.root = root;
			
			common.init_run(options);
			
			await server.dev.command();
			
		},
		
		command: async ():Promise<void> => {
			
			output.stop_loading();
			
			util.read_rc_file();
			
			const cd_cmd = `cd ${conf.root}/.uranio/server`;
			const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
			
			util.spawn_log_command(`${cd_cmd} && ${ts_cmd}`, 'tscw', tscw_color);
			
		}
		
	},
	
	build: {
		
		run: async (root:string, options?:Partial<Options>):Promise<void> => {
			
			conf.root = root;
			
			common.init_run(options);
			
			server.build.command();
			
		},
		
		command: async ():Promise<void> => {
			
			building_server = true;
			
			conf.spinner = true;
			
			output.start_loading(`Building server...`);
			
			util.read_rc_file();
			
			// transpose.run(conf.root, undefined, {verbose: true});
			
			const cd_cmd = `cd ${conf.root}/.uranio/server`;
			// const ts_cmd = `npx tsc -b --verbose`;
			const ts_cmd = `npx tsc -b`;
			
			const cmd = `${cd_cmd} && ${ts_cmd}`;
			output.log(`srv`, cmd);
			
			util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
				
				if(building_client){
					output.done_log(`tscb`, `Building server completed.`);
					done_building_server = true;
					if(done_building_client === true){
						output.end_log(`Building completed.`);
					}
				}else{
					output.end_log(`Building server completed.`);
				}
				
			});
			
		}
		
	}
	
};
