/**
 * Start command module
 *
 * @packageDocumentation
 */

import * as output from '../output/index';
import * as util from '../util/index';
import {default_params, defaults} from '../conf/defaults';
import {Params} from '../types';
import {merge_params} from './common';
import * as docker from './docker';
import {build_server} from './build';
import {valid_admin_repos} from '../types';
import {pacman_exec} from '../util/cmd';
let output_instance:output.OutputInstance;
let util_instance:util.UtilInstance;
let start_params = default_params as Params;

export async function start(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	docker.fail_if_compiled(start_params);
	output_instance.start_loading(`Starting...`);
	await _init_start();
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
	if(init){
		await _init_start();
	}
	const exec = pacman_exec[start_params.pacman];
	const urn_lib_pre = ` --prefix_logtype`;
	const urn_config_path = ` -c ${start_params.root}/uranio.toml`;
	const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
	let cmd_server = `${node_env}${exec}`;
	cmd_server += ` uranio-webservice-${start_params.repo}`;
	cmd_server += `${urn_lib_pre}${urn_config_path}`;
	cmd_server += `-- ${process.argv.join(' ')}`;
	util_instance.spawn.native({
		command: cmd_server,
		action: 'starting server',
		prefix: defaults.prefix_srv
	});
}

export async function start_panel(params:Partial<Params>, init=true)
		:Promise<void>{
	if(init){
		_init_params(params);
	}
	output_instance.start_loading(`Starting panel...`);
	if(init){
		await _init_start();
	}
	const exec = pacman_exec[start_params.pacman];
	const urn_lib_pre = ` --prefix_logtype`;
	const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
	const cmd_server =
		`${node_env}${exec} uranio-panel-${start_params.repo} start${urn_lib_pre}`;
	util_instance.spawn.native({
		command: cmd_server,
		action: 'starting panel',
		over: 'trace',
		prefix: defaults.prefix_pnl
	});
}

async function _init_start(){
	await build_server(start_params, true, false);
}

function _init_params(params:Partial<Params>)
		:void{
	params.spin = false;
	start_params = merge_params(params);
	output_instance = output.create(start_params);
	util_instance = util.create(start_params, output_instance);
}


