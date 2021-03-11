/**
 * Init command module
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import * as output from '../log/';

import * as util from '../util/';

export const dev = {
	
	run: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		_start_dev();
		
	}
	
};

async function _start_dev()
		:Promise<any>{
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
			`npx uranio transpose`,
		]
	);
	cp.spawn(
		'npx',
		['tsc-watch', '--onSuccess', node_run],
		{stdio: 'inherit'}
	);
	
}
