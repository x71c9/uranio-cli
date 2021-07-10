/**
 * Alias command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import {Options} from '../types';

import {conf} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import * as tsm from 'ts-morph';

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

type Aliases = {
	[key:string]: string[]
}

export function get_aliases():Aliases{
	const data = fs.readFileSync(`${conf.root}/tsconfig.json`, 'utf8');
	const tsconf_data = JSON.parse(data);
	return tsconf_data['compilerOptions']['paths'];
}

function _replace_modified_file(text:string, filename:string){
	output.start_loading(`Writing manipulated file...`);
	fs.writeFileSync(filename, text);
	output.done_verbose_log(`alias`, `File replaced [${filename}].`);
}

function _replace_aliases(aliases:Aliases){
	_traverse_ts(`${conf.root}/.uranio/`, aliases);
}

export function replace_file_aliases(filepath:string, aliases:Aliases):void{
	const _project = new tsm.Project(_project_option);
	let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	const {found, source} = _change_to_relative_imports(sourceFile, aliases);
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

function _change_to_relative_imports(sourceFile:tsm.SourceFile, aliases:Aliases)
		:FoundSource{
	let found = false;
	const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
	for(const import_decl of import_decls){
		if(_change_to_realtive_import(import_decl, aliases)){
			found = true;
		}
	}
	return {found, source: sourceFile};
}

function _change_to_realtive_import(node:tsm.Node, aliases:Aliases)
		:boolean{
	let found = false;
	const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		const module_name = text.substr(1, text.length - 2);
		if(module_name in aliases){
			found = true;
			output.start_loading(`Changing relative imports...`);
			const node_file_path = node.getSourceFile().getFilePath();
			const node_file_dir = path.parse(node_file_path).dir;
			const alias = aliases[module_name][0];
			let relative_path = path.relative(node_file_dir, `${conf.root}/${alias}`);
			if(relative_path === ''){
				relative_path = './index';
			}
			const append = (alias.slice(-1) === '/' && relative_path !== './index') ? '/' : '';
			const prepend = (relative_path.charAt(0) !== '.') ? './' : '';
			const replace = `${prepend}${relative_path}${append}`;
			str_lit.replaceWithText(`'${replace}'`);
			output.verbose_log(`alias`, `Changed [${module_name}] to [${replace}].`);
		}
	}
	return found;
}

function _traverse_ts(directory:string, aliases:Aliases) {
	fs.readdirSync(directory).forEach((filename) => {
		const full_path = path.resolve(directory, filename);
		if (fs.statSync(full_path).isDirectory() && filename != '.git') {
			return _traverse_ts(full_path, aliases);
		}else if(filename.split('.').pop() === 'ts'){
			replace_file_aliases(full_path, aliases);
		}
	});
}

