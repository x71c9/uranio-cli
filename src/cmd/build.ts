/**
 * Build command module
 *
 * @packageDocumentation
 */

import {default_params} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params, valid_admin_repos} from '../types';

import {merge_params} from './common';

import {transpose} from './transpose';

import {generate} from './generate';

// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let build_params = default_params as Params;

export async function build(params:Params)
		:Promise<void>{
	
	_init_build(params);
	
	output_instance.start_loading(`Building...`);
	
	await _build();
	
	build_server(build_params, false);
	
	if(valid_admin_repos().includes(build_params.repo)){
		build_panel(build_params, false);
	}
	
	output_instance.done_log('Build completed.');
	
}

export async function build_server(params:Params, init=true)
		:Promise<void>{
	
	if(init){
		_init_build(params);
	}
	
	output_instance.start_loading(`Building server...`);
	
	if(init){
		await _build();
	}
	
	output_instance.done_log('Build server completed.');
	
}

export async function build_panel(params:Params, init=true)
		:Promise<void>{
	
	if(init){
		_init_build(params);
	}
	
	output_instance.start_loading(`Building panel...`);
	
	if(init){
		await _build();
	}
	
	const urn_lib_pre = ` urn_log_prefix_type=true`;
	// const urn_config_path = ` -c ${build_params.root}/uranio.toml`;
	// const cmd_server = `NODE_ENV=production yarn uranio-panel-${build_params.repo} generate ${urn_lib_pre}`;
	const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
	const cmd_server = `${node_env}yarn uranio-panel-${build_params.repo} build ${urn_lib_pre}`;
	util_instance.spawn.log(cmd_server, 'panel', 'building panel');
	
	output_instance.done_log('Build panel completed.');
	
}

async function _build(){
	
	await transpose(build_params);
	
	await generate(build_params);
	
}

function _init_build(params:Partial<Params>)
		:void{
	
	build_params = merge_params(params);
	
	output_instance = output.create(build_params);
	
	util_instance = util.create(build_params, output_instance);
	
}

