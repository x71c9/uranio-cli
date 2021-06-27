/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as cp from 'child_process';

import {Options} from '../types';

import * as util from '../util/';

import * as output from '../output/';

import {conf, defaults} from '../conf/defaults';

export function init_log()
		:void{
	if(!fs.existsSync(`${conf.root}/${defaults.log_filepath}`)){
		cp.execSync(`touch ${conf.root}/${defaults.log_filepath}`);
	}
}

export function init_run(options?:Partial<Options>)
		:void {
	
	conf.hide = true;
	conf.spinner = false;
	
	if(options){
		util.merge_options(options);
	}
	
	if(!util.check_folder(conf.root)){
		throw new Error(`Invalid root path [${conf.root}].`);
	}
	
	if(!util.check_repo(conf.repo)){
		throw new Error(`Invalid repo [${conf.repo}].`);
	}
	
	init_log();
	
	_log_options();
	
}

function _log_options(){
	output.verbose_log('opts', JSON.stringify(conf));
}

