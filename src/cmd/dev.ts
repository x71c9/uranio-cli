/**
 * Dev command module
 *
 * @packageDocumentation
 */

import path from 'path';
import cp from 'child_process';
// import forever from 'forever-monitor';
import * as output from '../output/index';
import * as util from '../util/index';
import {default_params, defaults} from '../conf/defaults';
import {Params, valid_admin_repos} from '../types';
import {generate} from './generate';
import {transpose} from './transpose';
import {build_server} from './build';
import {merge_params} from './common';
import * as docker from './docker';
import {pacman_exec} from '../util/cmd';

let output_instance:output.OutputInstance;
let util_instance:util.UtilInstance;
let dev_params = default_params as Params;

let watch_src_scanned = false;
let watch_toml_scanned = false;

// let _service_child:forever.Monitor;
let _service_child:cp.ChildProcessWithoutNullStreams;
let _is_dev_server = false;

const _valid_reload_extensions = ['.ts', '.js'];

export async function dev(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	docker.fail_if_compiled(dev_params);
	await _init_dev();
	_dev_server();
	if(valid_admin_repos().includes(dev_params.repo)){
		_dev_panel();
	}
}

export async function dev_server(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	await _init_dev();
	_dev_server();
}

export async function dev_panel(params:Partial<Params>)
		:Promise<void>{
	_init_params(params);
	await _init_dev();
	_dev_panel();
}

function _init_params(params:Partial<Params>)
		:void{
	params.spin = false;
	dev_params = merge_params(params);
	output_instance = output.create(dev_params);
	util_instance = util.create(dev_params, output_instance);
}

async function _init_dev(){
	await build_server(dev_params, true, false);
	_tsc_watch();
	_watch();
}

async function _dev_panel(){
	// uranio-panel-adm dev doesn't need Forever to reaload (like the server)
	// because it reloads itself by launching Nuxt dev service.
	const args = ' --prefix_logtype';
	const exec = pacman_exec[dev_params.pacman];
	const node_env = (dev_params.prod === true) ? `NODE_ENV=production ` : '';
	const prefix = (dev_params.no_colors === true) ? defaults.prefix_pnl_blank : defaults.prefix_pnl;
	const cmd_dev_panel = `${node_env}${exec} uranio-panel-${dev_params.repo} dev${args}`;
	util_instance.spawn.native(cmd_dev_panel, 'developing panel', 'trace', prefix);
}
async function _dev_server(){
	_is_dev_server = true;
	const prefix = (dev_params.no_colors === true) ? defaults.prefix_srv_blank : defaults.prefix_srv;
	const cmd_dev_service = `${dev_params.root}/node_modules/uranio/dist/service/ws.js`;
	_service_child = util_instance.spawn.native(cmd_dev_service, 'developing service', undefined, prefix);
}

async function _restart_service(){
	output_instance.debug_log(`Restarting server...`);
	_service_child.stdin.end();
	_service_child.stdout.destroy();
	_service_child.stderr.destroy();
	_service_child.kill('SIGINT');
	_dev_server();
}

// async function _dev_server(){
// 	_is_dev_server = true;
// 	// _fix_mongodb_saslprep_requirement();
// 	const args:string[] = ['--prefix_logtype'];
// 	// Forever module needs for ensuring that a given script runs continuously
// 	_service_child = new forever.Monitor(`${dev_params.root}/node_modules/uranio/dist/service/ws.js`,{
// 		silent: true,
// 		args: args,
// 		env: {
// 			NODE_ENV: (dev_params.prod === true) ? 'production' : 'development'
// 		}
// 		// watch: true,
// 		// watchDirectory: `${dev_params.root}/src`
// 	});
// 	_service_child.start();
// 	_service_child.on('watch:restart', function(info) {
// 		output_instance.info_log('Restarting [dev server] because ' + info.file + ' changed');
// 	});
// 	_service_child.on('restart', function(_info) {
// 		output_instance.info_log('Forever restarting [dev server].');
// 	});
// 	_service_child.on('exit:code', function(code) {
// 		output_instance.done_log('Forever detected [dev server] exited with code ' + code);
// 	});
// 	_service_child.on('stdout', function(chunk){
// 		// process.stdout.write(`${prefix} ${data.toString()}`);
// 		// process.stdout.write(chunk.toString());
// 		const splitted_chunk = chunk.toString().split('\n');
// 		for(const split of splitted_chunk){
// 			let plain_text = output_instance.clean_chunk(split);
// 			if(plain_text === ''){
// 				continue;
// 			}
// 			const prefix = (dev_params.no_colors === true) ? defaults.prefix_srv_blank : defaults.prefix_srv;
// 			plain_text = `${prefix} ${plain_text}`;
// 			output_instance.translate_loglevel(plain_text);
// 		}
// 	});
// }

function _tsc_watch(){
	const exec = pacman_exec[dev_params.pacman];
	const tsc_watch = `${exec} tsc -w`;
	const prefix = (dev_params.no_colors === true) ? defaults.prefix_tsc_blank : defaults.prefix_tsc;
	util_instance.spawn.native(tsc_watch, 'watching types', 'debug', prefix);
}

export function _watch(){
	const src_path = `${dev_params.root}/src/`;
	output_instance.debug_log(`Watching \`src\` folder [${src_path}] ...`);
	util_instance.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${src_path}].`);
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
					output_instance.debug_log(`${_event} ${_path}`);
				}
				return false;
			}
			output_instance.info_log(`${_event} ${_path}`);
			await transpose(dev_params, _path, _event);
			await generate(dev_params, _path, _event);
			if(_is_dev_server && _valid_reload_extensions.includes(extension)){
				// _service_child.restart();
				_restart_service()
			}
			output_instance.done_log(`[src watch] Built [${_event}] [${_path}].`);
		}
	);
	
	if(!util_instance.fs.exists(dev_params.config)){
		return;
	}
	
	output_instance.debug_log(`Watching \`uranio.toml\` file [${dev_params.config}] ...`);
	
	util_instance.watch(
		dev_params.config,
		`watching \`toml\` file.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${dev_params.config}].`);
			watch_toml_scanned = true;
		},
		async (_event, _path) => {
			if(!watch_toml_scanned){
				if(_event === 'add' || _event === 'addDir'){
					output_instance.debug_log(`${_event} ${_path}`);
				}
				return false;
			}
			output_instance.info_log(`${_event} ${_path}`);
			await generate(dev_params, _path, _event);
			if(_is_dev_server){
				// _service_child.restart();
				_restart_service()
			}
			output_instance.done_log(`[toml watch] Generated [${_event}] [${_path}].`);
		}
	);
	
}

// function _fix_mongodb_saslprep_requirement(){
	
//   const dist_dir = `${dev_params.root}/dist`;
//   if(!util_instance.fs.exists(dist_dir)){
//     util_instance.fs.create_directory(dist_dir);
//   }
//   const saslprep_filename = `code-points.mem`;
//   const saslprep_module_dir = `${dev_params.root}/node_modules/saslprep/`;
	
//   util_instance.fs.copy_file(
//     `${saslprep_module_dir}/${saslprep_filename}`,
//     `${dist_dir}/${saslprep_filename}`
//   );
//   // util_instance.fs.copy_file(
//   //   `${saslprep_module_dir}/${saslprep_filename}`,
//   //   `${dist_dir}/server/${saslprep_filename}`
//   // );
// }
