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
		
		// output.start_loading('Developing...');
		
		output.stop_loading();
		
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
	
	// const ts_node = `npx ts-node-dev -r module-alias/register --clear --respawn --watch src/* -- src/index.ts`;
	// const nodemon = `nodemon --watch 'src/**/*' -e ts --ignore '.urn/**/*' --exec 'npx uranio transpose && tsc -b && ${node_run}'`;

	// const nodemon_urntranspose = `npx nodemon --watch 'src/**/*' -e ts  --exec 'npx uranio transpose'`;

	// cp.spawn('nodemon', ['--watch', "'src/**/*'", '-e', 'ts',  `--ignore`, "'.urn/**/*'", '--exec', `'npx uranio transpose && tsc -b && ${node_run}'`], {stdio: 'inherit'});
	
	cp.spawn(
		'npx',
		['nodemon', '--watch', "src/book.ts", '-e', 'ts', '--exec', `npx uranio transpose`],
		{stdio: 'inherit'}
	);
	
	cp.spawn(
		'npx',
		['tsc-watch', '--onSuccess', node_run],
		{stdio: 'inherit'}
	);
	
}
