/**
 * Process module
 *
 * @packageDocumentation
 */

import {Arguments} from './types';

import {help, init} from './cmd/';

export function urn_process(args:Arguments)
		:void{
	
	let cmd = args._[0] || 'help';
	
	if (args.version || args.v) {
		cmd = 'version';
	}
	
	if (args.help || args.h) {
		cmd = 'help';
	}
	
	switch(cmd){
		case 'init':{
			init.run(args);
			break;
		}
		case 'help':{
			help.run();
			break;
		}
		default:{
			console.log('Command not found.');
		}
	}
	
	// process.exit(1);
	
}
