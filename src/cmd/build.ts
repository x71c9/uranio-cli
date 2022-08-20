/**
 * Build command module
 *
 * @packageDocumentation
 */

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params, valid_admin_repos} from '../types';

import {merge_params} from './common';

import {transpose} from './transpose';

import {generate} from './generate';

// import * as docker from './docker';

import {pacman_exec} from '../util/cmd';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let build_params = default_params as Params;

export async function build(params:Params)
		:Promise<void>{
	
	_init_build(params);
	
	await _build();
	
	await build_server(build_params, false);
	
	if(valid_admin_repos().includes(build_params.repo)){
		await build_panel(build_params, false);
	}
	
	
	output_instance.done_log('Build completed.');
	
	process.exit(0);
	
}

export async function build_server(params:Params, init=true, exit=true)
		:Promise<void>{
	
	if(init){
		_init_build(params);
	}
	
	if(init){
		await _build();
	}
	
	// await _bundle_service_ws();
	
	output_instance.done_log('Build server completed.');
	
	if(exit){
		process.exit(0);
	}
}

export async function build_panel(params:Params, init=true)
		:Promise<void>{
	
	if(init){
		_init_build(params);
	}
	
	// await _bundle_panel_index();
	
	if(init){
		await _build();
	}
	
	const exec = pacman_exec[build_params.pacman];
	
	const urn_lib_pre = ` --prefix_logtype`;
	const node_env = (params.prod === true) ? `NODE_ENV=production ` : '';
	const cmd_server = `${node_env}${exec} uranio-panel-${build_params.repo} build ${urn_lib_pre}`;
	
	await util_instance.spawn.native_promise(cmd_server, 'building panel');
	
	output_instance.done_log('Build panel completed.');
	
	if(init){
		process.exit(0);
	}
}

async function _build(){
	
	// if(build_params.docker === true){
		
	// 	return await docker.build(build_params);
		
	// }
	
	await transpose(build_params);
	
	await generate(build_params);
	
}

// async function _create_bundles(){
// 	await _bundle_service_ws();
// 	await _bundle_panel_index();
// }

// @ts-ignore
async function _bundle_service_ws(params:Params){
	
	const exec = pacman_exec[params.pacman];
	
	output_instance.start_loading(`Bundling service ws...`);
	let cmd_service = '';
	cmd_service += `${exec} esbuild ${build_params.root}/dist/service/ws.js`;
	cmd_service += `--bundle`;
	cmd_service += `--platform=node`;
	cmd_service += `--minify`;
	cmd_service += `--outfile=${build_params.root}/${defaults.folder}/bundles/ws.bundle.js`;
	await util_instance.spawn.native_promise(cmd_service, 'bundling webservice');
}

// @ts-ignore
async function _bundle_panel_index(params:Params){
	
	const exec = pacman_exec[params.pacman];
	
	output_instance.start_loading(`Bundling panel index...`);
	let cmd_service = '';
	cmd_service += `${exec} esbuild ${build_params.root}/dist/panel/index.js`;
	cmd_service += `--bundle`;
	cmd_service += `--platform=node`;
	cmd_service += `--minify`;
	cmd_service += `--outfile=${build_params.root}/${defaults.folder}/bundles/panel.bundle.js`;
	await util_instance.spawn.native_promise(cmd_service, 'bundling panel');
}

function _init_build(params:Partial<Params>)
		:void{
	
	build_params = merge_params(params);
	
	output_instance = output.create(build_params);
	
	util_instance = util.create(build_params, output_instance);
	
}

