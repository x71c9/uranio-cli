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
	
	run: async (options?:Partial<Options>):Promise<void> => {
		
		common.init_run(options);
		
		await alias.command();
		
	},
	
	command: async ():Promise<void> => {
		
		output.start_loading('Updating aliases...');
		
		util.read_rc_file();
		
		const aliases = _get_aliases();
		
		// _replace_aliases(aliases);
		
		const filename = `${conf.root}/.uranio/lib/service/express/new.ts`;
		
		const modified = _replace_file_aliases(filename, aliases);
		
		console.log(modified);
		
		// _replace_modified_file(modified, filename);
		
		output.end_log(`Aliases updated.`);
		
	}
	
};

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
	}
};

type Aliases = {
	[key:string]: string[]
}

function _get_aliases():Aliases{
	const data = fs.readFileSync(`${conf.root}/tsconfig.json`, 'utf8');
	const tsconf_data = JSON.parse(data);
	return tsconf_data['compilerOptions']['paths'];
}

// function _replace_modified_file(text:string, filename:string){
//   output.start_loading(`Writing manipulated file...`);
//   fs.writeFileSync(filename, text);
//   output.done_log(`alias`, `File replaced to [].`);
// }

// function _replace_aliases(aliases:Aliases){
//   _traverse_ts(`${conf.root}/.uranio/`, aliases);
// }

function _replace_file_aliases(filepath:string, aliases:Aliases){
	
	const _project = new tsm.Project(_project_option);
	let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	sourceFile = _change_to_relative_imports(sourceFile, aliases);
	return sourceFile.print();
	// console.log(sourceFile);
}

function _change_to_relative_imports(sourceFile:tsm.SourceFile, aliases:Aliases)
		:tsm.SourceFile{
	output.start_loading(`Changing relative imports...`);
	const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
	for(const import_decl of import_decls){
		_change_to_realtive_import(import_decl, aliases);
	}
	output.done_log('impr', 'Changed relative imports.');
	return sourceFile;
}

function _change_to_realtive_import(node:tsm.Node, aliases:Aliases)
		:tsm.Node{
	output.start_loading(`Changing relative imports...`);
	const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		const module_name = text.substr(1, text.length - 2);
		if(module_name in aliases){
			const realtive_path = path.relative(node.getSourceFile().getFilePath(), `${conf.root}/${aliases[module_name][0]}`);
			str_lit.replaceWithText(`'${realtive_path}'`);
			output.verbose_log(`alias`, `Changed [${module_name}] to [${realtive_path}].`);
		}
	}
	return node;
}

// function _traverse_ts(directory:string, aliases:Aliases) {
//   fs.readdirSync(directory).forEach((filename) => {
//     const full_path = path.resolve(directory, filename);
//     if (fs.statSync(full_path).isDirectory() && filename != '.git') {
//       return _traverse_ts(full_path, aliases);
//     }else if(filename.split('.').pop() === 'ts'){
//       _replace_file_aliases(full_path, aliases);
//     }
//   });
// }

// function _delint(sourceFile: ts.SourceFile, aliases:Aliases, filepath:string) {
	
//   delintNode(sourceFile);
	
//   function delintNode(node: ts.Node) {
//     switch (node.kind) {
//       case ts.SyntaxKind.ImportDeclaration:{
//         const children = node.getChildren();
//         for(let i = 0; i < children.length; i++){
//           let child = children[i];
//           if(children[i].kind === ts.SyntaxKind.StringLiteral){
//             const string_literal = child.getText();
//             const module_name = string_literal.substr(1, string_literal.length - 2);
//             if(module_name in aliases){
//               const realtive_path = path.relative(filepath, `${conf.root}/${aliases[module_name][0]}`);
//               const new_string_literal = ts.factory.createStringLiteral(`'${realtive_path}'`);
//               child = new_string_literal;
//             }
//           }
//         }
//         break;
//       }
//     }
//     ts.forEachChild(node, delintNode);
//   }
	
//   // function report(node: ts.Node, message: string) {
//   //   const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
//   //   console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
//   // }
	
//   return sourceFile;
	
// }

