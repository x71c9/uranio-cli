/**
 * Generate command module
 *
 * @packageDocumentation
 */

import * as esbuild from 'esbuild';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {Params} from '../types';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let generate_params = default_params as Params;

export async function generate(params:Params, is_included=false)
		:Promise<void>{
	
	_init_generate(params);
	
	output_instance.start_loading(`Generating types...`);
	
	await _generate_types();
	
	if(!is_included){
		output_instance.end_log('Generating types completed.');
	}
	
}

async function _generate_types(){
	
	_create_register();
	
	output_instance.verbose_log(`Started generating types.`, 'types');
	await _promise_generate_types();
	output_instance.done_log(`Generated types.`, 'types');
}

function _esbuild_types(){
	output_instance.verbose_log(`Started transpiling generate script.`, 'types');
	esbuild.buildSync({
		entryPoints: [`${generate_params.root}/${defaults.folder}/generate.ts`],
		outfile: `${generate_params.root}/${defaults.folder}/generate.js`,
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
		const generate_path_js = `${generate_params.root}/${defaults.folder}/generate.js`;
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

function _create_register(){
	let text = '';
	text += '/**\n';
	text += ' * Auto-generated uranio register file.\n';
	text += ' *\n';
	text += ' */\n\n';
	const atom_dir = `${generate_params.root}/src/atoms`;
	const atom_folders = util_instance.fs.read_dir(atom_dir);
	for(const folder of atom_folders){
		text += `export * from '../src/atoms/${folder}/';\n`;
		output_instance.verbose_log(`Exported atom [${folder}].`, `atms`);
	}
	text += `export {};\n`;
	const register_path = `${generate_params.root}/${defaults.folder}/register.ts`;
	if(util_instance.fs.exists(register_path)){
		util_instance.fs.remove_file(register_path);
	}
	util_instance.fs.write_file(register_path, text);
}


function _init_generate(params:Partial<Params>)
		:void{
	
	generate_params = merge_params(params);
	
	output_instance = output.create(generate_params);
	
	util_instance = util.create(generate_params, output_instance);
	
	util_instance.must_be_initialized();
	
}

