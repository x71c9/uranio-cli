/**
 * Alias command module
 *
 * @packageDocumentation
 */

import path from 'path';

import * as tsm from 'ts-morph';

import {urn_util} from 'urn-lib';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {Params} from '../types';

import {AliasParams, Aliases} from './types';

// import * as common from './common';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let alias_params = default_params as Params & AliasParams;

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
		newLineKind: tsm.NewLineKind.LineFeed
	}
};

export async function alias(params:AliasParams, output_params?:Partial<output.OutputParams>)
		:Promise<void>{
	
	if(!output_params){
		output_params = {};
	}
	if(!output_params.root){
		output_params.root = params.root;
	}
	output_instance = output.create(output_params);
	
	alias_params = merge_params(params);
	
	const util_params = {
		...alias_params
	};
	
	util_instance = util.create(util_params, output_instance);
	
	const tsconfig_path_server = `${alias_params.root}/${defaults.folder}/server/tsconfig.json`;
	const tsconfig_path_client = `${alias_params.root}/${defaults.folder}/client/tsconfig.json`;
	const aliases_server = get_aliases(tsconfig_path_server);
	const aliases_client = get_aliases(tsconfig_path_client);
	
	_replace_aliases_server(aliases_server);
	_replace_aliases_client(aliases_client);
	
	output_instance.end_log(`Aliases updated.`);
	
}

export function get_aliases(tsconfig_path:string)
		:Aliases{
	const data = util_instance.fs.read_file_sync(tsconfig_path, 'utf8');
	try{
		const tsconf_data = urn_util.json.clean_parse(data);
		return tsconf_data['compilerOptions']['paths'];
	}catch(ex){
		output_instance.wrong_end_log(`Error parsing ${tsconfig_path}. ${ex.message}`);
		process.exit(1);
	}
}

function _replace_aliases_server(aliases:Aliases){
	_traverse_ts_aliases(`${alias_params.root}/${defaults.folder}/server/src/`, aliases);
}

function _replace_aliases_client(aliases:Aliases){
	_traverse_ts_aliases(`${alias_params.root}/${defaults.folder}/client/src/`, aliases);
}

function _traverse_ts_aliases(directory:string, aliases:Aliases) {
	util_instance.fs.read_dir_sync(directory).forEach((filename) => {
		const full_path = path.resolve(directory, filename);
		if (util_instance.fs.is_directory(full_path) && filename != '.git') {
			return _traverse_ts_aliases(full_path, aliases);
		}else if(filename.split('.').pop() === 'ts'){
			replace_file_aliases(full_path, aliases);
		}
	});
}

export function replace_file_aliases(filepath:string, aliases:Aliases):void{
	const _project = new tsm.Project(_project_option);
	let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	const {found, source} = _change_to_relative_statements(sourceFile, aliases);
	sourceFile = source;
	if(found === true){
		const modified = sourceFile.print();
		_replace_modified_file(modified, filepath);
		util_instance.pretty(filepath);
	}
}

type FoundSource = {
	found: boolean,
	source: tsm.SourceFile
}

function _change_to_relative_statements(sourceFile:tsm.SourceFile, aliases:Aliases)
		:FoundSource{
	let found = false;
	const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
	const export_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ExportDeclaration);
	for(const import_decl of import_decls){
		if(_change_to_relative(import_decl, aliases)){
			found = true;
		}
	}
	for(const export_decl of export_decls){
		if(_change_to_relative(export_decl, aliases)){
			found = true;
		}
	}
	return {found, source: sourceFile};
}

function _change_to_relative(node:tsm.Node, aliases:Aliases)
		:boolean{
	let found = false;
	const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		const full_module_name = text.substr(1, text.length - 2);
		let module_name = full_module_name;
		const splitted_module = module_name.split('/');
		if(module_name in aliases || splitted_module[0] in aliases){
			found = true;
			output_instance.start_loading(`Changing relative imports...`);
			const node_file_path = node.getSourceFile().getFilePath();
			const node_file_dir = path.parse(node_file_path).dir;
			let parent_folder = 'server';
			if(node_file_dir.includes(`${alias_params.root}/${defaults.folder}/client`)){
				parent_folder = 'client';
			}
			let module_append = '';
			if(splitted_module.length > 1){
				module_append = '/' + splitted_module.slice(1).join('/');
				module_name = splitted_module[0];
			}
			const alias = aliases[module_name][0];
			let relative_path = path.relative(node_file_dir, `${alias_params.root}/${defaults.folder}/${parent_folder}/${alias}`);
			if(relative_path === ''){
				relative_path = './index';
			}
			const append = (alias.slice(-1) === '/' && relative_path !== './index') ? '/' : '';
			const prepend = (relative_path.charAt(0) !== '.') ? './' : '';
			const replace = `${prepend}${relative_path}${module_append}${append}`;
			str_lit.replaceWithText(`'${replace}'`);
			output_instance.verbose_log(`Changed [${full_module_name}] to [${replace}].`, 'alias');
		}
	}
	return found;
}

function _replace_modified_file(text:string, filename:string){
	output_instance.start_loading(`Writing manipulated file...`);
	util_instance.fs.write_file_sync(filename, text);
	output_instance.done_verbose_log(`File replaced [${filename}].`, 'alias');
}


// export const alias = {
	
//   run: (options?:Partial<Options>):void => {
		
//     common.init_run(options);
		
//     alias.command();
		
//   },
	
//   command: ():void => {
		
//     output_instance.start_loading('Updating aliases...');
		
//     util.read_rc_file();
		
//     const tsconfig_path_server = `${conf.root}/.uranio/server/tsconfig.json`;
//     const tsconfig_path_client = `${conf.root}/.uranio/client/tsconfig.json`;
//     const aliases_server = get_aliases(tsconfig_path_server);
//     const aliases_client = get_aliases(tsconfig_path_client);
		
//     _replace_aliases_server(aliases_server);
//     _replace_aliases_client(aliases_client);
		
//     output_instance.end_log(`Aliases updated.`);
		
//   },
	
//   include: ():void => {
		
//     const is_hidden = conf.hide;
		
//     conf.hide = true;
		
//     alias.command();
		
//     conf.hide = is_hidden;
		
//     output_instance.done_log(`Aliases updated.`, 'alias');
		
//   }
	
// };




