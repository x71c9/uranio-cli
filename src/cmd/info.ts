/**
 * Help command module
 *
 * @packageDocumentation
 */

// import fs from 'fs';

import chalk from 'chalk';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import * as docker from '../cmd/docker';

import { Params } from '../types';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let info_params = default_params as Params;

export async function info(params:Params):Promise<void> {
	
	_info_init(params);
	
	_check_if_is_initialized();
	
	console.log(`root:   ${_bold(info_params.root)}`);
	console.log(`repo:   ${_bold(info_params.repo)}`);
	console.log(`pacman: ${_bold(info_params.pacman)}`);
	_console_docker();
	process.exit(0);
	
}

function _info_init(params:Params){
	
	info_params = merge_params(params);
	
	output_instance = output.create(info_params);
	
	util_instance = util.create(info_params, output_instance);
	
}

function _console_docker(){
	if(docker.is_docker_compiled(info_params)){
		console.log(`docker: true`);
	}
}

function _repo_not_initialized(){
	output_instance.info_log(
		`This repo is not initialized. In order to initialize it run: \`uranio init\`.`
	);
	process.exit(0);
}

function _check_if_is_initialized(){
	if(!util_instance.fs.exists(`${info_params.root}/${defaults.folder}/${defaults.init_filepath}`)){
		_repo_not_initialized();
	}
}

function _bold(str:string){
	return chalk.bold(str);
}
