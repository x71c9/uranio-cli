/**
 * Init command module
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

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
	
	const register = `-r source-map-support/register -r module-alias/register`;
	const node_run = `node ${register} ./dist/src/index.js`;
	// const on_success = `uranio transpose && ${node_run}`;
	// const cmd = `tsc-watch --onSuccess "${on_success}"`;
	// const cmd = `nodemon --watch 'src/**/*.ts' --ignore '.urn/**/*' --exec 'npx uranio transpose && tsc -b && ${node_run}'`;
	// cp.spawn('npx', ['tsc-watch', '--onSuccess', `"${on_success}"`], {stdio: 'inherit'});
	cp.spawn('nodemon', ['--watch', "'src/**/*.ts'", `--ignore`, "'.urn/**/*'", '--exec', `'npx uranio transpose && tsc -b && ${node_run}'`], {stdio: 'inherit'});
	
}
