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
	cp.spawn(
		'npx',
		[
			'nodemon',
			'--watch',
			'src/book.ts',
			'-e',
			'ts',
			'--exec',
			`npx uranio transpose --no-log`,
			'&',
			'npx',
			'tsc-watch',
			'--onSuccess',
			node_run
		],
		{stdio: 'inherit'}
	);
	
	// cp.spawn(
	//   'npx',
	//   ['tsc-watch', '--onSuccess', node_run],
	//   {stdio: 'inherit'}
	// );
	
}
