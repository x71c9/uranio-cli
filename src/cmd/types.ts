/**
 * Generate types command module
 *
 * This command will create 3 register files that import all the atom
 * definitions in the `/src/atoms` folder.
 * The 3 files are:
 * - `/.uranio/generate/src/register.ts`
 * - `/.uranio/server/src/__urn_register.ts`
 * - `/.uranio/client/src/__urn_register.ts`
 *
 * NOTE:
 * Atoms must be defined with the following structure:
 * `/src/atoms/[atom_name]/index.ts`
 *
 * It will then transpile with `esbuild` the `/.uranio/generate/src/generate.ts`
 * file that is importing the `register.ts` file created.
 *
 * NOTE:
 * The file `/.uranio/generate/src/generate.ts` is created by the `init` command.
 *
 * After the transpilation it will run with Node the transpiled file:
 * ```
 * node /.uranio/generate/dist/generate.js
 * ```
 * This will create the declaration file with the Atom Types.
 *
 * NOTE:
 * In order for the script to run it needs the schema file:
 * ```
 * /.uranio/generate/src/schema/index.d.ts
 * ```
 * that is creted by the `init` command.
 *
 * @packageDocumentation
 */

import * as esbuild from 'esbuild';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params} from '../types';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let types_params = default_params as Params;

export async function types(params:Params, is_included=false)
		:Promise<void>{
	
	_init_types(params);
	
	output_instance.start_loading(`Generating types...`);
	
	_create_register_files();
	await _generate_types();
	_copy_generated_types();
	
	if(!is_included){
		output_instance.end_log('Generating types completed.');
	}
	
}

function _create_register_files(){
	_create_generate_register();
	_copy_server_client_registers();
}

function _copy_generated_types(){
	const dot_dir = `${types_params.root}/${defaults.folder}`;
	const generated_types = `${dot_dir}/generate/src/schema/index.d.ts`;
	const dest_server = `${dot_dir}/server/src/schema/index.d.ts`;
	const dest_client = `${dot_dir}/client/src/schema/index.d.ts`;
	util_instance.fs.copy_file(generated_types, dest_server);
	util_instance.fs.copy_file(generated_types, dest_client);
}

async function _generate_types(){
	output_instance.verbose_log(`Started generating types.`, 'types');
	await _promise_generate_types();
	output_instance.done_log(`Generated types.`, 'types');
}

function _esbuild_types(){
	output_instance.verbose_log(`Started transpiling generate script.`, 'types');
	esbuild.buildSync({
		entryPoints: [`${types_params.root}/${defaults.folder}/generate/src/generate.ts`],
		outfile: `${types_params.root}/${defaults.folder}/generate/dist/generate.js`,
		bundle: true,
		platform: 'node',
		sourcemap: false,
		minify: true
	});
	output_instance.done_log(`Transpiled generate script.`, 'types');
}

function _promise_generate_types(){
	
	_esbuild_types();
	
	return new Promise((resolve, reject) => {
		const generate_arg1 = ` urn_generate_base_schema=${types_params.root}/${defaults.folder}/generate/src/schema/index.d.ts`;
		const generate_arg2 = ` urn_generate_output=${types_params.root}/${defaults.folder}/generate/src/schema/index.d.ts`;
		const generate_path_js = `${types_params.root}/${defaults.folder}/generate/dist/generate.js${generate_arg1}${generate_arg2}`;
		const flags = ``;
		const tsn_cmd = `node ${generate_path_js} ${flags}`;
		util_instance.spawn.spin_and_verbose_log(
			tsn_cmd, 'tsnode', 'running transpiled generate.js file', undefined, resolve, reject
		);
	});
	
}

function _register_text(){
	
	let text = '';
	text += '/**\n';
	text += ' * Auto-generated uranio generate register file.\n';
	text += ' *\n';
	text += ' */\n\n';
	const atom_dir = `${types_params.root}/src/atoms`;
	const atom_folders = util_instance.fs.read_dir(atom_dir);
	for(const folder of atom_folders){
		if(!util_instance.fs.exists(`${atom_dir}/${folder}/index.ts`)){
			continue;
		}
		text += `export * from './atoms/${folder}/index';\n`;
		output_instance.verbose_log(`Exported atom [${folder}].`, `atms`);
	}
	text += `export {};\n`;
	
	return text;
	
}

function _create_generate_register(){
	output_instance.verbose_log(`Started creating register.ts for generate.ts file.`, 'types');
	
	const text = _register_text();
	
	const dot_dir = `${types_params.root}/${defaults.folder}`;
	const register_path_root = `${dot_dir}/generate/src/register.ts`;
	if(util_instance.fs.exists(register_path_root)){
		util_instance.fs.remove_file(register_path_root);
	}
	util_instance.fs.write_file(register_path_root, text);
	
	output_instance.done_log(`Created register.ts for generate.ts file.`, 'types');
}

function _copy_server_client_registers(){
	output_instance.verbose_log(`Started copying server client register files.`, 'types');
	
	const dot_dir = `${types_params.root}/${defaults.folder}`;
	const register_path_generate = `${dot_dir}/generate/src/register.ts`;
	const register_path_server = `${dot_dir}/server/src/__urn_register.ts`;
	const register_path_client = `${dot_dir}/client/src/__urn_register.ts`;
	if(util_instance.fs.exists(register_path_server)){
		util_instance.fs.remove_file(register_path_server);
	}
	if(util_instance.fs.exists(register_path_client)){
		util_instance.fs.remove_file(register_path_client);
	}
	util_instance.fs.copy_file(register_path_generate, register_path_server);
	util_instance.fs.copy_file(register_path_generate, register_path_client);
	
	output_instance.done_log(`Copied server client register files.`, 'types');
}


function _init_types(params:Partial<Params>)
		:void{
	
	types_params = merge_params(params);
	
	output_instance = output.create(types_params);
	
	util_instance = util.create(types_params, output_instance);
	
	util_instance.must_be_initialized();
	
}

