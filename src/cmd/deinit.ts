/**
 * Deinit command module
 *
 * @packageDocumentation
 */

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as docker from './docker';

import {
	Params,
} from '../types';

import {
	merge_params,
} from './common';

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
	
	await docker.tmp_remove(deinit_params, true);
	
	await docker.db_stop(deinit_params, deinit_params.db, true);
	await docker.db_remove(deinit_params, deinit_params.db, true);
	
	await docker.network_remove(deinit_params, true);
	
	await docker.stop(deinit_params, true);
	await docker.remove(deinit_params, true);
	await docker.unbuild(deinit_params, true);
}

async function _delete_files(){
	util_instance.fs.remove_directory(`${deinit_params.root}/.tmp`);
	util_instance.fs.remove_directory(`${deinit_params.root}/dist`);
	util_instance.fs.remove_directory(`${deinit_params.root}/${defaults.folder}`);
	util_instance.fs.remove_file(`${deinit_params.root}/${defaults.json_filename}`);
	util_instance.fs.remove_directory(`${deinit_params.root}/node_modules`);
	util_instance.fs.remove_file(`${deinit_params.root}/tsconfig.json`);
	util_instance.fs.remove_file(`${deinit_params.root}/sample.env`);
	util_instance.fs.remove_file(`${deinit_params.root}/.eslintrc.js`);
	util_instance.fs.remove_file(`${deinit_params.root}/.eslinignore`);
	util_instance.fs.remove_file(`${deinit_params.root}/.stylelintrc.json`);
	util_instance.fs.remove_file(`${deinit_params.root}/yarn.lock`);
	util_instance.fs.remove_file(`${deinit_params.root}/yarn-error.log`);
	util_instance.fs.remove_file(`${deinit_params.root}/package-lock.json`);
}

