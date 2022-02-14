/**
 * Generate command module
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

let generate_params = default_params as Params;

export async function generate(params:Params, is_included=false)
		:Promise<void>{
	
	_init_generate(params);
	
	output_instance.start_loading(`Generating types...`);
	
	_create_generate_register();
	_create_registers();
	await _generate_types();
	_copy_generated_types();
	
	if(!is_included){
		output_instance.end_log('Generating types completed.');
	}
	
}

function _copy_generated_types(){
	const dot_dir = `${generate_params.root}/${defaults.folder}`;
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
		entryPoints: [`${generate_params.root}/${defaults.folder}/generate/src/generate.ts`],
		outfile: `${generate_params.root}/${defaults.folder}/generate/dist/generate.js`,
		bundle: true,
		platform: 'node',
		sourcemap: false,
		// minify: true
	});
	output_instance.done_log(`Transpiled generate script.`, 'types');
}

function _promise_generate_types(){
	
	_esbuild_types();
	
	return new Promise((resolve, reject) => {
		const generate_arg1 = ` urn_generate_base_schema=${generate_params.root}/${defaults.folder}/generate/src/schema/index.d.ts`;
		const generate_arg2 = ` urn_generate_output=${generate_params.root}/${defaults.folder}/generate/src/schema/index.d.ts`;
		const generate_path_js = `${generate_params.root}/${defaults.folder}/generate/dist/generate.js${generate_arg1}${generate_arg2}`;
		const flags = ``;
		const tsn_cmd = `node ${generate_path_js} ${flags}`;
		util_instance.spawn.spin_and_verbose_log(
			tsn_cmd, 'tsnode', 'running trinspiled generate file', undefined, resolve, reject
		);
	});
	
	// return new Promise((resolve, reject) => {
	//   const generate_path = `${generate_params.root}/${defaults.folder}/generate.ts`;
	//   const flags = `--bundle --platform=node `;
	//   const tsn_cmd = `npx esbuild ${generate_path} ${flags}`;
	//   util_instance.spawn.spin_and_verbose_log(
	//     tsn_cmd, 'tsnode', 'generating types', undefined, resolve, reject
	//   );
	// });
	
	// return new Promise((resolve, reject) => {
	//   const generate_path = `${generate_params.root}/${defaults.folder}/generate.ts`;
	//   const flags = `--skip-project --transpile-only`;
	//   const tsn_cmd = `npx ts-node ${generate_path} ${flags}`;
	//   util_instance.spawn.spin_and_verbose_log(
	//     tsn_cmd, 'tsnode', 'generating types', undefined, resolve, reject
	//   );
	// })
	
}

function _create_generate_register(){
	output_instance.verbose_log(`Started creating register for generate file.`, 'types');
	
	let text = '';
	text += '/**\n';
	text += ' * Auto-generated uranio generate register file.\n';
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
	
	const dot_dir = `${generate_params.root}/${defaults.folder}`;
	const register_path_root = `${dot_dir}/generate/src/register.ts`;
	if(util_instance.fs.exists(register_path_root)){
		util_instance.fs.remove_file(register_path_root);
	}
	util_instance.fs.write_file(register_path_root, text);
	
	output_instance.done_log(`Created register for generate files.`, 'types');
}

function _create_registers(){
	output_instance.verbose_log(`Started creating register files.`, 'types');
	
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
	
	const dot_dir = `${generate_params.root}/${defaults.folder}`;
	const register_path_server = `${dot_dir}/server/src/__urn_register.ts`;
	const register_path_client = `${dot_dir}/client/src/__urn_register.ts`;
	if(util_instance.fs.exists(register_path_server)){
		util_instance.fs.remove_file(register_path_server);
	}
	if(util_instance.fs.exists(register_path_client)){
		util_instance.fs.remove_file(register_path_client);
	}
	util_instance.fs.write_file(register_path_server, text);
	util_instance.fs.write_file(register_path_client, text);
	
	output_instance.done_log(`Created register files.`, 'types');
}


function _init_generate(params:Partial<Params>)
		:void{
	
	generate_params = merge_params(params);
	
	output_instance = output.create(generate_params);
	
	util_instance = util.create(generate_params, output_instance);
	
	util_instance.must_be_initialized();
	
}

