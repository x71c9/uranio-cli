/**
 * Generate command module
 *
 * NOTE:
 * Atoms must be defined with the following structure:
 * `/src/atoms/[atom_name]/index.ts`
 *
 * This command do the following:
 *
 * 1) Generate a register.ts file for generate.ts script
 * - `/.uranio/generate/src/register.ts`
 *
 * 2) Copy the register.ts file also to server and client folder
 * - `/.uranio/server/src/__urn_register.ts`
 * - `/.uranio/client/src/__urn_register.ts`
 *
 * 3) Compile with `esbuild` the `/.uranio/generate/src/generate.ts`
 * file that is importing the `register.ts` file created.
 *
 * NOTE:
 * The file `/.uranio/generate/src/generate.ts` is created by the `init` command.
 *
 * 4) Run with Node the transpiled file:
 * ```
 * node /.uranio/generate/dist/generate.js
 * ```
 * Running the script will do:
 *
 * a) Generate the schema types with all the AtomName, AtomShape, Molecule, etc.
 * - /.uranio/generate/schema.d.ts
 *
 * If the repository is using uranio-trx or an uranio repo that includes it:
 *
 * b) Generate the types for uranio with the custom Hooks
 * - /.uranio/geneate/uranio.d.ts
 *
 * c) Generate the hooks file:
 * - /.uranio/generate/__urn_hooks.ts
 *
 * NOTE:
 * In order for the script to run it needs the base schema files:
 * ```
 * /.uranio/generate/types/schema.d.ts
 * /.uranio/generate/types/uranio.d.ts (if uranio-trx or above)
 * ```
 * that are creted by the `init` command.
 * 
 * 5) Copy the genrated files in the correct folders:
 * - /.uranio/generate/schema.d.ts -> /.uranio/server/types/, /.uranio/client/types/, /.uranio/generate/types/
 * - /.uranio/generate/uranio.d.ts -> /.uranio/server/types/, /.uranio/client/types/
 * - /.uranio/generate/hooks.ts -> /.uranio/server/src/__urn_hooks.ts, /.uranio/client/src/__urn_hooks.ts
 *
 * @packageDocumentation
 */

import * as esbuild from 'esbuild';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {Params} from '../types';

import {merge_params} from './common';

import {valid_hooks_repos} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let generate_params = default_params as Params;

let urn_optput_dir = `.uranio/generate`;
let urn_schema_base_path = `.uranio/generate/base/schema.d.ts`;
let urn_types_base_path = `.uranio/generate/base/uranio.d.ts`;

let register_path_generate = `.uranio/generate/src/register.ts`;
let register_path_server = `.uranio/server/src/__urn_register.ts`;
let register_path_client = `.uranio/client/src/__urn_register.ts`;

// const urn_register_divider = `// --urn-register-divider\n`;

export async function generate(params:Params, is_included=false)
		:Promise<void>{
	
	_init_types(params);
	
	const dot_dir = `${generate_params.root}/${defaults.folder}`;
	urn_schema_base_path = `${dot_dir}/generate/base/schema.d.ts`;
	urn_types_base_path = `${dot_dir}/generate/base/uranio.d.ts`;
	urn_optput_dir = `${dot_dir}/generate`;
	
	register_path_generate = `${dot_dir}/generate/src/register.ts`;
	register_path_server = `${dot_dir}/server/src/__urn_register.ts`;
	register_path_client = `${dot_dir}/client/src/__urn_register.ts`;
	
	output_instance.start_loading(`Generating types...`);
	
	_create_register_for_generate();
	
	_copy_register_files();
	
	_compile_generate();
	
	await _run_generate();
	
	_copy_generated_files();
	
	if(!is_included){
		output_instance.end_log('Generating types completed.');
	}
	
}

export async function generate_uranio(params:Params)
		:Promise<void>{
	
	_init_types(params, false);
	
	// output_instance.start_loading(`Generating types for uranio repo...`);
	
	// await _generate_uranio_types();
	
	// output_instance.end_log('Generating types for uranio repo completed.');
	
}

function _copy_generated_files(){
	output_instance.verbose_log(`Started copying generated files.`, 'generate');
	const dot_dir = `${generate_params.root}/${defaults.folder}`;
	
	// util_instance.fs.copy_file(`${urn_optput_dir}/schema.d.ts`, `${generate_params.root}/types/schema.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/schema.d.ts`, `${dot_dir}/generate/types/schema.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/schema.d.ts`, `${dot_dir}/server/types/schema.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/schema.d.ts`, `${dot_dir}/client/types/schema.d.ts`);
	
	// util_instance.fs.copy_file(`${urn_optput_dir}/uranio.d.ts`, `${generate_params.root}/types/uranio.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/uranio.d.ts`, `${dot_dir}/generate/types/uranio.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/uranio.d.ts`, `${dot_dir}/server/types/uranio.d.ts`);
	util_instance.fs.copy_file(`${urn_optput_dir}/uranio.d.ts`, `${dot_dir}/client/types/uranio.d.ts`);
	
	if(valid_hooks_repos().includes(generate_params.repo)){
		util_instance.fs.copy_file(`${urn_optput_dir}/__urn_hooks.ts`, `${dot_dir}/server/src/__urn_hooks.ts`);
		util_instance.fs.copy_file(`${urn_optput_dir}/__urn_hooks.ts`, `${dot_dir}/client/src/__urn_hooks.ts`);
	}
	output_instance.done_log(`Copied generated files.`, 'generate');
}

function _copy_register_files(){
	output_instance.verbose_log(`Started copying server client register files.`, 'generate');
	// if(util_instance.fs.exists(register_path_server)){
	//   util_instance.fs.remove_file(register_path_server);
	// }
	// if(util_instance.fs.exists(register_path_client)){
	//   util_instance.fs.remove_file(register_path_client);
	// }
	util_instance.fs.copy_file(register_path_generate, register_path_server);
	util_instance.fs.copy_file(register_path_generate, register_path_client);
	output_instance.done_log(`Copied server client register files.`, 'generate');
}

async function _run_generate(){
	output_instance.verbose_log(`Started running compiled file.`, 'generate');
	return await new Promise((resolve, reject) => {
		// this 3 arguments are defined in uranio-trx/util/generate.ts
		const generate_arg1 = ` urn_base_schema=${urn_schema_base_path}`;
		// const generate_arg2 = ` urn_generate_output=${urn_schema_output}`;
		// const generate_arg3 = ` urn_generate_hooks_output=${urn_hooks_text_path}`;
		const generate_arg4 = ` urn_output_dir=${urn_optput_dir}`;
		let generate_arg5 = '';
		let generate_arg6 = '';
		if(valid_hooks_repos().includes(generate_params.repo)){
			generate_arg5 = ` urn_base_types=${urn_types_base_path}`;
			generate_arg5 = ` urn_repo=${generate_params.repo}`;
		}
		// const generate_path_js = `${generate_params.root}/${defaults.folder}/generate/dist/generate.js${generate_arg1}${generate_arg2}${generate_arg3}`;
		const generate_path_js = `${generate_params.root}/${defaults.folder}/generate/dist/generate.js${generate_arg1}${generate_arg4}${generate_arg5}${generate_arg6}`;
		const flags = ``;
		const tsn_cmd = `node ${generate_path_js} ${flags}`;
		util_instance.spawn.spin_and_verbose_log(
			tsn_cmd, 'tsnode', 'running transpiled generate.js file', undefined, resolve, reject
		);
	});
	output_instance.done_log(`Compiled file runned.`, 'generate');
}

function _compile_generate(){
	output_instance.verbose_log(`Started compiling generate script.`, 'types');
	esbuild.buildSync({
		entryPoints: [`${generate_params.root}/${defaults.folder}/generate/src/generate.ts`],
		outfile: `${generate_params.root}/${defaults.folder}/generate/dist/generate.js`,
		bundle: true,
		platform: 'node',
		sourcemap: false,
		// minify: true
	});
	output_instance.done_log(`Compiled generate script.`, 'types');
}

// function _esbuild_uranio_types(){
//   output_instance.verbose_log(`Started transpiling generate script for uranio repo.`, 'types');
//   esbuild.buildSync({
//     entryPoints: [`${generate_params.root}/src/generate.ts`],
//     outfile: `${generate_params.root}/dist/generate.js`,
//     bundle: true,
//     platform: 'node',
//     sourcemap: false,
//     // minify: true
//   });
//   output_instance.done_log(`Transpiled generate script for uranio repo.`, 'types');
// }

// function _promise_generate_uranio_types(){
//   _esbuild_uranio_types();
//   return new Promise((resolve, reject) => {
//     const generate_arg1 = ` urn_base_schema=${generate_params.root}/schema/index.d.ts`;
//     const generate_arg2 = ` urn_generate_output=${generate_params.root}/schema/index.d.ts`;
//     const generate_path_js = `${generate_params.root}/dist/generate.js${generate_arg1}${generate_arg2}`;
//     const flags = ``;
//     const tsn_cmd = `node ${generate_path_js} ${flags}`;
//     util_instance.spawn.spin_and_verbose_log(
//       tsn_cmd, 'tsnode', 'running transpiled generate.js file for uranio repo', undefined, resolve, reject
//     );
//   });
// }

function _register_text(){
	let text = '';
	text += '/**\n';
	text += ' * Auto-generated uranio register file.\n';
	text += ' *\n';
	text += ' */\n\n';
	const atom_dir = `${generate_params.root}/src/atoms`;
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

// function _register_last(){
//   let text = '';
//   // text += urn_register_divider;
//   text += `export {};\n`;
//   return text;
// }

function _create_register_for_generate(){
	output_instance.verbose_log(`Started creating register.ts for generate.ts file.`, 'types');
	
	let text = '';
	text += _register_text();
	// text += _register_last();
	
	if(util_instance.fs.exists(register_path_generate)){
		util_instance.fs.remove_file(register_path_generate);
	}
	util_instance.fs.write_file(register_path_generate, text);
	
	output_instance.done_log(`Created register.ts for generate.ts file.`, 'types');
}

// function _create_server_client_registers(){
//   output_instance.verbose_log(`Started creating register.ts for server and client.`, 'types');
//   let text = '';
//   text += _register_text();
//   if(valid_hooks_repos().includes(generate_params.repo)){
//     text += _register_hooks();
//   }
//   text += _register_last();
//   if(util_instance.fs.exists(register_path_server)){
//     util_instance.fs.remove_file(register_path_server);
//   }
//   util_instance.fs.write_file(register_path_server, text);
//   if(util_instance.fs.exists(register_path_client)){
//     util_instance.fs.remove_file(register_path_client);
//   }
//   util_instance.fs.write_file(register_path_client, text);
//   output_instance.done_log(`Created register.ts for server and client.`, 'types');
// }

// function _copy_server_client_registers(){
//   output_instance.verbose_log(`Started copying server client register files.`, 'types');
//   const dot_dir = `${generate_params.root}/${defaults.folder}`;
//   const register_path_generate = `${dot_dir}/generate/src/register.ts`;
//   const register_path_server = `${dot_dir}/server/src/__urn_register.ts`;
//   const register_path_client = `${dot_dir}/client/src/__urn_register.ts`;
//   if(util_instance.fs.exists(register_path_server)){
//     util_instance.fs.remove_file(register_path_server);
//   }
//   if(util_instance.fs.exists(register_path_client)){
//     util_instance.fs.remove_file(register_path_client);
//   }
//   util_instance.fs.copy_file(register_path_generate, register_path_server);
//   util_instance.fs.copy_file(register_path_generate, register_path_client);
	
//   output_instance.done_log(`Copied server client register files.`, 'types');
// }


function _init_types(params:Partial<Params>, must_init=true)
		:void{
	
	generate_params = merge_params(params);
	
	output_instance = output.create(generate_params);
	
	util_instance = util.create(generate_params, output_instance);
	
	if(must_init){
		util_instance.must_be_initialized();
	}
	
}

