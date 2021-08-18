/**
 * Alias command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import * as tsm from 'ts-morph';

import {urn_util} from 'urn-lib';

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

export const alias = {
	
	run: (options?:Partial<Options>):void => {
		
		common.init_run(options);
		
		alias.command();
		
	},
	
	command: ():void => {
		
		output.start_loading('Updating aliases...');
		
		util.read_rc_file();
		
		const aliases = get_aliases();
		
		_replace_aliases(aliases);
		
		output.end_log(`Aliases updated.`);
		
	},
	
	include: ():void => {
		
		const is_hidden = conf.hide;
		
		conf.hide = true;
		
		alias.command();
		
		conf.hide = is_hidden;
		
		output.done_log('alias', `Aliases updated.`);
		
	}
	
};

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
		newLineKind: tsm.NewLineKind.LineFeed
	}
};

export type Aliases = {
	[key:string]: string[]
}

export function get_aliases():Aliases{
	const tsconfig_path = `${conf.root}/tsconfig.json`;
	const data = fs.readFileSync(tsconfig_path, 'utf8');
	try{
		const tsconf_data = urn_util.json.clean_parse(data);
		return tsconf_data['compilerOptions']['paths'];
	}catch(ex){
		output.wrong_end_log(`Error parsing ${tsconfig_path}. ${ex.message}`);
		process.exit(1);
	}
}

function _replace_modified_file(text:string, filename:string){
	output.start_loading(`Writing manipulated file...`);
	fs.writeFileSync(filename, text);
	output.done_verbose_log(`alias`, `File replaced [${filename}].`);
}

function _replace_aliases(aliases:Aliases){
	_traverse_ts_aliases(`${conf.root}/.uranio/`, aliases);
}

export function replace_file_aliases(filepath:string, aliases:Aliases):void{
	const _project = new tsm.Project(_project_option);
	let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	const {found, source} = _change_to_relative_statements(sourceFile, aliases);
	sourceFile = source;
	if(found === true){
		const modified = sourceFile.print();
		_replace_modified_file(modified, filepath);
		util.pretty(filepath);
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
			output.start_loading(`Changing relative imports...`);
			const node_file_path = node.getSourceFile().getFilePath();
			const node_file_dir = path.parse(node_file_path).dir;
			let module_append = '';
			if(splitted_module.length > 1){
				module_append = '/' + splitted_module.slice(1).join('/');
				module_name = splitted_module[0];
			}
			const alias = aliases[module_name][0];
			let relative_path = path.relative(node_file_dir, `${conf.root}/${alias}`);
			if(relative_path === ''){
				relative_path = './index';
			}
			const append = (alias.slice(-1) === '/' && relative_path !== './index') ? '/' : '';
			const prepend = (relative_path.charAt(0) !== '.') ? './' : '';
			const replace = `${prepend}${relative_path}${module_append}${append}`;
			str_lit.replaceWithText(`'${replace}'`);
			output.verbose_log(`alias`, `Changed [${full_module_name}] to [${replace}].`);
		}
	}
	return found;
}

function _traverse_ts_aliases(directory:string, aliases:Aliases) {
	fs.readdirSync(directory).forEach((filename) => {
		const full_path = path.resolve(directory, filename);
		if (fs.statSync(full_path).isDirectory() && filename != '.git') {
			return _traverse_ts_aliases(full_path, aliases);
		}else if(filename.split('.').pop() === 'ts'){
			replace_file_aliases(full_path, aliases);
		}
	});
}

