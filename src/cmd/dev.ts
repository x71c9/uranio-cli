/**
 * Dev command module
 *
 * @packageDocumentation
 */

import path from 'path';

import forever from 'forever-monitor';

import * as output from '../output/index';

import * as util from '../util/index';

import {default_params} from '../conf/defaults';

import {Params, valid_admin_repos} from '../types';

import {generate} from './generate';

import {transpose} from './transpose';

import {build_server} from './build';

import {merge_params} from './common';

import * as docker from './docker';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let dev_params = default_params as Params;

// let watch_lib_scanned = false;
let watch_src_scanned = false;
let watch_toml_scanned = false;

// const nuxt_color = '#677cc7';
// const tscw_color = '#734de3';
const watc_color = '#687a6a';
// const pane_color = '#4f9ee3';
const pane_color = '#b44fe3';

let service_child:forever.Monitor;

export async function dev(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	if(params.docker === true){
		
		await docker.start(dev_params);
		
	}else{
		
		await _init_dev();
		_dev_server();
		
		if(valid_admin_repos().includes(dev_params.repo)){
			_dev_panel();
		}
		
	}
}

export async function dev_server(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	if(params.docker === true){
		
		await docker.start_server(dev_params);
		
	}else{
		
		await _init_dev();
		_dev_server();
		
	}
	
}

export async function dev_panel(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	if(params.docker === true){
		
		await docker.start_panel(dev_params);
		
	}else{
		
		await _init_dev();
		_dev_panel();
		
	}
	
}

function _init_params(params:Partial<Params>)
		:void{
	
	params.spin = false;
	
	dev_params = merge_params(params);
	
	output_instance = output.create(dev_params);
	
	util_instance = util.create(dev_params, output_instance);
	
}

async function _init_dev(){
	
	await build_server(dev_params);
	
	_watch();
}

async function _dev_panel(){
	
	// const urn_lib_pre = ` urn_log_prefix_type=true`;
	// const urn_config_path = ` -c ${build_params.root}/uranio.toml`;
	// const cmd_dev_panel = `yarn uranio-panel-${dev_params.repo} dev ${urn_lib_pre}`;
	const cmd_dev_panel = `yarn uranio-panel-${dev_params.repo} dev`;
	util_instance.spawn.log(cmd_dev_panel, 'dev', 'developing panel', pane_color);
	
	// service_child = new forever.Monitor(`${dev_params.root}/node_modules/uranio/dist/panel/index.js dev`,{
	//   args: ['urn_log_prefix=true'],
	//   // watch: true,
	//   // watchDirectory: `${dev_params.root}/src`
	// });
	
	// service_child.start();
	
	// service_child.on('watch:restart', function(info) {
	//   output_instance.log('Restarting [dev panel] because ' + info.file + ' changed');
	// });
	
	// service_child.on('restart', function(_info) {
	//   output_instance.log('Forever restarting [dev panel].');
	// });
	
	// service_child.on('exit:code', function(code) {
	//   output_instance.done_log('Forever detected [dev panel] exited with code ' + code);
	// });
	
}
async function _dev_server(){
	
	service_child = new forever.Monitor(`${dev_params.root}/node_modules/uranio/dist/service/ws.js`,{
		args: ['urn_log_prefix=true'],
		// watch: true,
		// watchDirectory: `${dev_params.root}/src`
	});
	
	service_child.start();
	
	service_child.on('watch:restart', function(info) {
		output_instance.log('Restarting [dev server] because ' + info.file + ' changed');
	});
	
	service_child.on('restart', function(_info) {
		output_instance.log('Forever restarting [dev server].');
	});
	
	service_child.on('exit:code', function(code) {
		output_instance.done_log('Forever detected [dev server] exited with code ' + code);
	});
	
}

function _watch(){
	
	const src_path = `${dev_params.root}/src/`;
	
	output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
	
	util_instance.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
			watch_src_scanned = true;
		},
		async (_event, _path) => {
			
			const basename = path.basename(_path);
			const extension = path.extname(basename);
			
			const not_valid_extensions = ['.swp', '.swo'];
			if(not_valid_extensions.includes(extension) || not_valid_extensions.includes(basename)){
				return false;
			}
			
			if(!watch_src_scanned){
				if(_event === 'add' || _event === 'addDir'){
					output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
				}
				return false;
			}
			
			output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
			
			await transpose(dev_params, _path, _event);
			
			await generate(dev_params, _path, _event);
			
			service_child.restart();
			
			output_instance.done_log(`[src watch] Built [${_event}] [${_path}].`, 'wtch');
			
		}
	);
	
	if(!util_instance.fs.exists(dev_params.config)){
		return;
	}
	
	output_instance.log(`Watching \`uranio.toml\` file [${dev_params.config}] ...`, 'wtch');
	
	util_instance.watch(
		dev_params.config,
		`watching \`toml\` file.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${dev_params.config}].`, 'wtch');
			watch_toml_scanned = true;
		},
		async (_event, _path) => {
			
			if(!watch_toml_scanned){
				if(_event === 'add' || _event === 'addDir'){
					output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
				}
				return false;
			}
			
			output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
			
			await generate(dev_params, _path, _event);
			
			service_child.restart();
			
			output_instance.done_log(`[toml watch] Generated [${_event}] [${_path}].`, 'wtch');
			
		}
	);
	
}
