/**
 * Help command module
 *
 * @packageDocumentation
 */

import {title} from './title';

import * as output from '../output/';

export const help = {
	
	command: ():void =>  {
		
		output.stop_loading();
		
		title();
		
		console.log(``);
		console.log(`usage: uranio [command] <options>`);
		console.log(``);
		console.log(`commands:`);
		console.log(`  init ............... init uranio repo.`);
		console.log(`  dev ................ start uranio development mode.`);
		console.log(`  transpose .......... transpose atom books.`);
		console.log(`  version ............ show package version.`);
		console.log(`  help ............... show help menu [this one].`);
		console.log(``);
		console.log(`list of arguments`);
		console.log(`  -r --repo .......... set uranio repo to use.`);
		console.log(`  -s --root .......... set the project root folder.`);
		console.log(`  -f --force ......... initialize without prompts.`);
		console.log(`  -v --verbose ....... log in verbose mode.`);
		console.log(`  -n --hide .......... do not output log.`);
		console.log(`  -b --blank ......... log with no colors.`);
		console.log(`  -w --fullwidth ..... log in full width.`);
		console.log(`  -p --prefix ........ set a log prefix.`);
		
		console.log(``);
		console.log(``);
		
		process.exit(0);
		
	}
	
};
