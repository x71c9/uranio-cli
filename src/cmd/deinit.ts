/**
 * Deinit command module
 *
 * @packageDocumentation
 */

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {
	docker_stop,
	docker_remove,
	docker_unbuild,
	// docker_db_stop,
	// docker_db_remove,
	docker_remove_tmp
} from './docker';

import {
	// Arguments,
	Params,
	// DB
} from '../types';

import {
	merge_params,
} from './common';

// import {InitParams} from './types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let deinit_params = default_params;

export async function deinit(params:Partial<Params>)
		:Promise<void>{
	
	deinit_params = merge_params(params);
	
	output_instance = output.create(deinit_params);
	
	util_instance = util.create(deinit_params, output_instance);
	
	await _remove_dockers();
	await _delete_files();
	
	output_instance.end_log(`Deinitialization completed.`);
}

async function _remove_dockers()
		:Promise<void>{
	// const dotenv = util_instance.cmd.read_dotenv();
	
	await docker_remove_tmp(deinit_params, true);
	
	// await docker_db_stop(deinit_params, dotenv.URN_DB_TYPE as DB, true);
	// await docker_db_remove(deinit_params, dotenv.URN_DB_TYPE as DB, true);
	
	await docker_stop(deinit_params, true);
	await docker_remove(deinit_params, true);
	await docker_unbuild(deinit_params, true);
}

async function _delete_files(){
	// util_instance.fs.remove_directory(`${deinit_params.root}/${defaults.folder}`);
	// util_instance.fs.remove_file(`${deinit_params.root}/.urnlog`);
	// util_instance.fs.remove_directory(`${deinit_params.root}/dist/server`);
	// util_instance.fs.remove_directory(`${deinit_params.root}/dist/client`);
	util_instance.fs.remove_directory(`${deinit_params.root}/dist`);
	util_instance.fs.remove_directory(`${deinit_params.root}/${defaults.folder}`);
	util_instance.fs.remove_file(`${deinit_params.root}/${defaults.json_filename}`);
	util_instance.fs.remove_directory(`${deinit_params.root}/node_modules`);
}

