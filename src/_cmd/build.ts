/**
 * Build command module
 *
 * @packageDocumentation
 */

import {Options, Arguments} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

// const cli_options = {
//   hide: false,
//   verbose: false,
// };

// import {server} from './server';

// import {client} from './client';

let done_building_server = false;
let building_server = false;

let done_building_client = false;
let building_client = false;

const tscw_color = '#734de3';
const nuxt_color = '#677cc7';

export const build = {
	
	run: async (root:string, options?:Partial<Options>):Promise<void> => {
		
		conf.root = root;
		
		common.init_run(options);
		
		await build.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Building...');
		
		util.read_rc_file();
		
		build.server();
		build.client();
		
		// output.end_log(`Building completed.`);
		
	},
	
	server: ():void => {
		
		output.start_loading('Building server...');
		
		building_server = true;
		
		conf.spinner = true;
		
		output.start_loading(`Building server...`);
		
		util.read_rc_file();
		
		// transpose.run(conf.root, undefined, {verbose: true});
		
		const cd_cmd = `cd ${conf.root}/.uranio/server`;
		// const ts_cmd = `npx tsc -b --verbose`;
		const ts_cmd = `npx tsc -b`;
		
		const cmd = `${cd_cmd} && ${ts_cmd}`;
		output.log(cmd, 'srv');
		
		util.spawn_log_command(cmd, 'tscb', tscw_color, () => {
			
			if(building_client){
				output.done_log(`Building server completed.`, 'tscb');
				done_building_server = true;
				if(done_building_client === true){
					output.end_log(`Building completed.`);
				}
			}else{
				output.end_log(`Building server completed.`);
			}
			
		});
	},
	
	client: (args?:Arguments):void => {
		
		output.start_loading('Building client...');
		
		building_client = true;
		
		conf.spinner = true;
		
		output.start_loading(`Building client...`);
		
		// transpose.run(conf.root, undefined, {verbose: true});
		
		util.read_rc_file();
		
		const native = args?.native || false;
		
		const cd_cmd = `cd ${conf.root}/.uranio/client`;
		const nu_cmd = `npx nuxt generate -c ./nuxt.config.js`;
		
		const cmd = `${cd_cmd} && ${nu_cmd}`;
		output.log(cmd, 'clnt');
		
		const callback = () => {
			
			if(building_server){
				output.done_log(`Building client completed.`, 'gnrt');
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
	
};
