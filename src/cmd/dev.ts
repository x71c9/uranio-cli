/**
 * Init command module
 *
 * @packageDocumentation
 */

import {Arguments} from '../types';

import * as output from '../log/';

import * as util from '../util/';

export const dev = {
	
	run: async (args:Arguments):Promise<void> => {
		
		output.start_loading('Developing...');
		
		util.check_if_initialized();
		
		_start_dev(args);
		
	}
	
};

async function _start_dev(args:Arguments)
		:Promise<any>{
	
	args;
	
	return new Promise((resolve, reject) => {
		
		const register = `-r source-map-support/register -r module-alias/register`;
		const node_run = `node ${register} ./dist/src/index.js`;
		const on_success = `uranio transpose && ${node_run}`;
		
		const cmd = `npx tsc-watch --onSuccess "${on_success}"`;
		
		util.spawn_cmd(cmd, 'dev', 'Developing', resolve, reject);
	});
}
