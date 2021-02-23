/**
 * Init command module
 *
 * @packageDocumentation
 */

import util from 'util';

import {exec} from 'child_process';

const execute = util.promisify(exec);

import {Arguments} from '../types';

import {conf} from '../conf/defaults';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		title();
		
		let repo = conf.default_repo;
		
		if(args.r || args.repo){
			const args_repo = args.r || args.repo;
			switch(args_repo){
				case 'web':{
					repo = 'web';
					break;
				}
				case 'core':{
					repo = 'core';
					break;
				}
			}
		}
		
		console.log(repo);
		
		// exec("echo A", (e, o, eo) => {
		//   console.log('e',e);
		//   console.log('o',o);
		//   console.log('eo',eo);
		// });
		
		// await execute('echo "The \\$HOME variable is $HOME"');
		
		execute(`mkdir .urn`)
			.then((d) => {
				console.log('THEN');
				console.log(d.stdout);
			})
			.catch((e) => {
				console.log('ERROR');
				console.log(e);
			});
		// .finally(() => {
		//   console.log('FINALLY');
		// });
		
	}
	
};
