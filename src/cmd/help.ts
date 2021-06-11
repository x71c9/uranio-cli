/**
 * Help command module
 *
 * @packageDocumentation
 */

import {title} from './title';

import * as output from '../log/';

export const help = {
	
	run: ():void =>  {
		
		output.stop_loading();
		
		title();
		
		console.log(``);
		console.log(`uranio [command] <options>`);
		console.log(``);
		console.log(`init ............... init uranio repo`);
		console.log(`version ............ show package version`);
		console.log(`help ............... show help menu for a command`);
		
		console.log(``);
		console.log(``);
		
		process.exit(0);
		
	}
	
};
