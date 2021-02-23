/**
 * Help command module
 *
 * @packageDocumentation
 */

import {title} from './title';

export const help = {
	
	run: ():void =>  {
		
		title();
		
		console.log(``);
		console.log(`uranio [command] <options>`);
		console.log(``);
		console.log(`init ............... init uranio repo`);
		console.log(`version ............ show package version`);
		console.log(`help ............... show help menu for a command`);
		
	}
	
};
