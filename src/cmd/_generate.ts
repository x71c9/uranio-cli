/**
 * Generate command module
 *
 * @packageDocumentation
 */

import path from 'path';

import * as esbuild from 'esbuild';

import {default_params} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params} from '../types';

import {merge_params} from './common';

// import {valid_hooks_repos} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let generate_params = default_params as Params;

let register_path_server = `node_modules/uranio/src/server/register.ts`;
let register_path_client = `node_modules/uranio/src/client/register.ts`;
let compiled_register_path_server = `node_modules/uranio/dist/server/register.js`;
let compiled_register_path_client = `node_modules/uranio/dist/client/register.js`;

export async function generate(params:Params, is_included=false)
		:Promise<void>{
	
	_init_generate(params);
	
	_generate_register();
	
	const generate_cmd = `yarn uranio-generate-${generate_params.repo}`;
	util_instance.spawn.verbose_log(generate_cmd, 'generate', 'generating');
	
	if(!is_included){
		output_instance.end_log('Generate completed.');
	}
	
}

async function _generate_register()
		:Promise<void>{
	
	const node_register_uranio_src = `node_modules/uranio/src`;
	const node_register_src_server = `${node_register_uranio_src}/server/register.ts`;
	const node_register_src_client = `${node_register_uranio_src}/client/register.ts`;
	
	const node_register_uranio_dist = `node_modules/uranio/dist`;
	const node_register_dist_server = `${node_register_uranio_dist}/server/register.js`
	const node_register_dist_client = `${node_register_uranio_dist}/client/register.js`
	
	register_path_server = `${generate_params.root}/${node_register_src_server}`;
	register_path_client = `${generate_params.root}/${node_register_src_client}`;
	
	compiled_register_path_server = `${generate_params.root}/${node_register_dist_server}`;
	compiled_register_path_client = `${generate_params.root}/${node_register_dist_client}`;
	
	_generate_server_register();
	_generate_client_register();
	
	_compile_register_server();
	_compile_register_client();
	
	output_instance.end_log('Generate register completed.');
	
}

function _compile(src:string, dest:string){
	esbuild.buildSync({
		entryPoints: [src],
		outfile: dest,
		platform: 'node',
		format: 'cjs',
		// sourcemap: true,
		// minify: true
	});
}

function _compile_register_server(){
	_compile(register_path_server, compiled_register_path_server);
}

function _compile_register_client(){
	_compile(register_path_client, compiled_register_path_client);
}

function _generate_server_register(){
	const text = _register_text('server');
	util_instance.fs.write_file(register_path_server, text);
}

function _generate_client_register(){
	const text = _register_text('client');
	util_instance.fs.write_file(register_path_client, text);
}

function _register_text(parent_folder:string){
	let text = '';
	text += '/**\n';
	text += ' * Auto-generated uranio register file.\n';
	text += ' *\n';
	text += ' */\n\n';
	const atom_dir = `${generate_params.root}/src/atoms`;
	const atom_folders = util_instance.fs.read_dir(atom_dir);
	for(const atom_folder of atom_folders){
		if(!util_instance.fs.exists(`${atom_dir}/${atom_folder}/index.ts`)){
			continue;
		}
		text += `export * from '../atoms/${parent_folder}/${atom_folder}/index';\n`;
		if(util_instance.fs.exists(`${atom_dir}/${atom_folder}/routes`)){
			const routes_folder = util_instance.fs.read_dir(`${atom_dir}/${atom_folder}/routes`);
			for(const route_file of routes_folder){
				const base_route_filename = path.parse(route_file).name;
				text += `export * from '../atoms/${parent_folder}/${atom_folder}/routes/${base_route_filename}';\n`
			}
		}
		output_instance.verbose_log(`Exported atom [${atom_folder}].`, `atms`);
	}
	text += `export {};\n`;
	return text;
}

function _init_generate(params:Partial<Params>, must_init=true)
		:void{
	
	generate_params = merge_params(params);
	
	output_instance = output.create(generate_params);
	
	util_instance = util.create(generate_params, output_instance);
	
	if(must_init){
		// util_instance.must_be_initialized();
	}
	
}

