/**
 * Dev command module
 *
 * @packageDocumentation
 */

import * as output from '../output/index';

import * as util from '../util/index';

import {default_params} from '../conf/defaults';

import {Params} from '../types';

import {merge_params} from './common';

// import * as docker from './docker';

import {valid_admin_repos} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let start_params = default_params as Params;

export async function start(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	output_instance.start_loading(`Starting...`);
	
	start_server(start_params, false);
	
	if(valid_admin_repos().includes(start_params.repo)){
		start_panel(start_params, false);
	}
	
}

export async function start_server(params:Partial<Params>, init=true)
		:Promise<void>{
	
	if(init){
		_init_params(params);
	}
	
	output_instance.start_loading(`Starting server...`);
	
	const urn_lib_pre = ` urn_log_prefix_type=true`;
	const urn_config_path = ` -c ${start_params.root}/uranio.toml`;
	const cmd_server = `NODE_ENV=production yarn uranio-webservice-${start_params.repo}${urn_lib_pre}${urn_config_path}`;
	util_instance.spawn.log(cmd_server, 'start', 'starting server');
	
}

export async function start_panel(params:Partial<Params>, init=true)
		:Promise<void>{
	
	if(init){
		_init_params(params);
	}
	
	output_instance.start_loading(`Starting panel...`);
	
	const urn_lib_pre = ` urn_log_prefix_type=true`;
	// const urn_config_path = ` -c ${start_params.root}/uranio.toml`;
	const cmd_server = `NODE_ENV=production yarn uranio-panel-${start_params.repo} start${urn_lib_pre}`;
	util_instance.spawn.log(cmd_server, 'start', 'starting panel');
	
}

function _init_params(params:Partial<Params>)
		:void{
	
	params.spin = false;
	
	start_params = merge_params(params);
	
	output_instance = output.create(start_params);
	
	util_instance = util.create(start_params, output_instance);
	
}


