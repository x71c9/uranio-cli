/**
 * Process module
 *
 * @packageDocumentation
 */

import {Arguments} from './types';

import {help, init, transpose} from './cmd/';
// import {help, init} from './cmd/';

import {conf} from './conf/defaults';

import * as output from './log/';

export function urn_process(args:Arguments)
		:void{
	
	let cmd = args._[0] || '';
	
	if (args.version) {
		cmd = 'version';
	}
	
	if (args.help || args.h) {
		cmd = 'help';
	}
	
	const verbose = args.v || args.verbose;
	
	if(verbose === true){
		conf.verbose = true;
	}
	
	const no_colors = args['no-colors'];
	
	if(no_colors === true){
		conf.colors = false;
	}
	
	_log_arguments(args);
		
	switch(cmd){
		case '':
		case 'version':{
			console.log('v0.0.1');
			break;
		}
		case 'init':{
			init.run(args);
			break;
		}
		case 'transpose':{
			transpose.run(args);
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

function _log_arguments(args:Arguments){
	output.verbose_log('args', JSON.stringify(args));
}

