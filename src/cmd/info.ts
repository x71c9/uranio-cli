/**
 * Help command module
 *
 * @packageDocumentation
 */

// import {title} from './title';

// import * as output from '../output/';

import chalk from 'chalk';

import { Params } from '../types';

export async function info(params:Params):Promise<void> {
	
	// title();
	
	console.log(`root:   ${_bold(params.root)}`);
	console.log(`repo:   ${_bold(params.repo)}`);
	console.log(`deploy: ${_bold(params.deploy)}`);
	console.log(`pacman: ${_bold(params.pacman)}`);
	process.exit(0);
	
}

function _bold(str:string){
	return chalk.bold(str);
}
