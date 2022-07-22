/**
 * Generate command module
 *
 * Method `generate` first create the "register files" with the user defined
 * Atoms by reading what is inside `src/atoms` directory.
 * > See _generate_register function
 *
 * Then it runs the binary script exported according to the repo that is being
 * used, so one of the following:
 * - uranio-generate-adm
 * - uranio-generate-trx
 * - uranio-generate-api
 * - uranio-generate-core
 *
 * This scripts are always defined in `src/server/generate.ts` for each uranio
 * repo.
 *
 * In general what they do is:
 * - Generating the schema in node_modules/uranio-schema
 * - Generating the hooks in node_modules/uranio-trx
 * - Generating the hook types in node_modules/uranio-trx
 * - Generating the client_toml module in node_modules/uranio
 *
 * A copy of uranio-schema generated in node_modules will be copied to
 * .uranio/uranio-schema. This will allow the text editor to read the repo
 * with better support.
 *
 * @packageDocumentation
 */

import path from 'path';

import * as esbuild from 'esbuild';

import {defaults, default_params} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params, valid_admin_repos, valid_deploy_repos} from '../types';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let generate_params = default_params as Params;

const _valid_generate_extensions = ['.ts', '.js'];

let register_path_server = `node_modules/uranio/src/server/register.ts`;
let register_path_client = `node_modules/uranio/src/client/register.ts`;
let compiled_register_path_server = `node_modules/uranio/dist/server/register.js`;
let compiled_register_path_client = `node_modules/uranio/dist/client/register.js`;

export async function generate(params:Params, _path?:string, _event?:string)
		:Promise<void>{
	
	_init_generate(params);
	
	const src_path = `${generate_params.root}/src`;
	
	const atoms_src_dir = `${src_path}/atoms`;
	const server_src_dir = `${src_path}/server`;
	const admin_src_dir = `${src_path}/admin`;
	
	if(typeof _path === 'undefined'){
		await _generate_all();
		return;
	}
	
	const ext = path.parse(_path).ext;
	if(!_is_valid_extension(ext)){
		return;
	}
	
	if(_path.includes(atoms_src_dir)){
		
		await _generate_atoms();
		
	}else if(
		valid_deploy_repos().includes(generate_params.repo)
		&& _path.includes(server_src_dir)
	){
		
		// TODO
		
	}else if(
		valid_admin_repos().includes(generate_params.repo)
		&& _path.includes(admin_src_dir)
	){
		
		// TODO
		
	}else if(
		_path.includes(generate_params.config)
	){
		
		await _generate_client_config();
		
	}else{
		
		await _generate_all();
		
	}
	
	output_instance.done_log('Generate completed.');
	
}

function _is_valid_extension(ext:string){
	return _valid_generate_extensions.includes(ext);
}

async function _generate_all():Promise<void>{
	await _generate('');
	output_instance.done_verbose_log('Generate all completed.');
}

async function _generate_atoms():Promise<void>{
	await _generate(`urn_command=atoms`);
}

// async function _generate_schema(params:Params):Promise<void>{
//   await _generate(`urn_command=schema`, params);
// }

// async function _generate_hooks(params:Params):Promise<void>{
//   await _generate(`urn_command=hooks`, params);
//   await _generate(`urn_command=hook-types`, params);
// }

async function _generate_client_config():Promise<void>{
	await _generate(`urn_command=client-config`);
}

async function _generate(args:string){
	
	// _init_generate(params);
	
	await _generate_register();
	
	await new Promise((resolve, reject) => {
		let root_uranio = generate_params.config;
		if(generate_params.config[0] !== '/'){
			root_uranio = `${generate_params.root}/${generate_params.config}`;
		}
		const generate_cmd = `yarn uranio-generate-${generate_params.repo} -c ${root_uranio} ${args}`;
		util_instance.spawn.verbose_log(generate_cmd, 'generate', 'generating', undefined, resolve, reject);
	});
	
	_copy_uranio_schema_repo();
	
	// output_instance.done_log('Generate completed.');
	
}

function _copy_uranio_schema_repo(){
	const uranio_schema_path =
		`${generate_params.root}/node_modules/uranio-schema/dist/typ/atom.d.ts`;
	const schema_copy_path =
		`${generate_params.root}/${defaults.folder}/uranio-schema/dist/typ/atom.d.ts`;
	util_instance.fs.copy_file(uranio_schema_path, schema_copy_path);
}

/**
 * "Register files" will be imported when Uranio initialize and when running
 * the "Generate methods":
 * - uranio-generate-adm
 * - uranio-generate-trx
 * - uranio-generate-api
 * - uranio-generate-core
 *
 * These files import the modules the User have defined in `./src/atoms/`.
 *
 * This function creates a file for the server and a file for the client.
 * Then it will compile both of them.
 *
 * The location of the compiled files is:
 * `./node_modules/uranio/src/[server|client]/register.js`
 */
async function _generate_register()
		:Promise<void>{
	
	const node_register_uranio_src = `node_modules/uranio/src`;
	const node_register_src_server = `${node_register_uranio_src}/server/register.ts`;
	const node_register_src_client = `${node_register_uranio_src}/client/register.ts`;
	
	const node_register_uranio_dist = `node_modules/uranio/dist`;
	const node_register_dist_server = `${node_register_uranio_dist}/server/register.js`;
	const node_register_dist_client = `${node_register_uranio_dist}/client/register.js`;
	
	register_path_server = `${generate_params.root}/${node_register_src_server}`;
	register_path_client = `${generate_params.root}/${node_register_src_client}`;
	
	compiled_register_path_server = `${generate_params.root}/${node_register_dist_server}`;
	compiled_register_path_client = `${generate_params.root}/${node_register_dist_client}`;
	
	_generate_server_register();
	_generate_client_register();
	
	_compile_register_server();
	_compile_register_client();
	
	output_instance.done_log('Generate register completed.');
	
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
				if(!_is_valid_route_name(route_file)){
					continue;
				}
				text += `export * from '../atoms/${parent_folder}/${atom_folder}/routes/${base_route_filename}';\n`;
			}
		}
		output_instance.verbose_log(`Exported atom [${atom_folder}].`, `atms`);
	}
	text += `export {};\n`;
	return text;
}

function _is_valid_route_name(name:string){
	if(name[0] === '.'){
		return false;
	}
	return true;
}

function _init_generate(params:Partial<Params>)
		:void{
	
	generate_params = merge_params(params);
	
	output_instance = output.create(generate_params);
	
	util_instance = util.create(generate_params, output_instance);
	
}

