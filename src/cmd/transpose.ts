/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {
	ts,
	Project,
	Node,
	VariableDeclaration,
	PropertyAssignment
} from 'ts-morph';

import {Arguments} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

export const transpose = {
	
	run: async (args:Arguments):Promise<void> => {
		
		const src_path = (args.s || args['src-path']) || defaults.book_src_path;
		
		output.log(`star`, `Started manipulating.`);
		
		const project = new Project();
		const sourceFile = project.addSourceFileAtPath(src_path);
		
		sourceFile.forEachChild((node:Node) => {
			switch(node.getKind()){
				case ts.SyntaxKind.ImportDeclaration:{
					_change_realtive_import(node);
					break;
				}
				case ts.SyntaxKind.VariableStatement:{
					let book_decl = _find_atom_book_declaration(node);
					if(book_decl){
						book_decl = _remove_type_reference(book_decl);
						book_decl = _remove_bll_prop_and_imports(book_decl);
						book_decl = _add_as_const(book_decl);
						return false;
					}
					break;
				}
				case ts.SyntaxKind.EndOfFileToken:{
					break;
				}
				default:{
					// console.log(node.getKindName());
				}
			}
		});
		
		const modified = sourceFile.print();
		
		const destination = args.d || args.destination || defaults.book_dest_path;
		
		_copy_modified_file_to_dest(destination, modified);
		
		output.end_log(`Transpose completed.`);
		// process.exit(1);
		
	}
	
};

function _copy_modified_file_to_dest(dest:string, text:string){
	fs.writeFileSync(dest, text);
	output.log(`tran`, `Book manipulated and moved.`);
}

function _add_as_const(book_decl:VariableDeclaration){
	book_decl.replaceWithText(book_decl.getText() + ' as const');
	output.verbose_log(`asco`, `Added as const.`);
	return book_decl;
}

function _change_realtive_import(node:Node)
		:Node{
	const str_lit = node.getFirstChildByKind(ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		if(text.includes('./')){
			const replace = text.replace('./','../src/');
			str_lit.replaceWithText(replace);
			output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
		}
	}
	return node;
}

function _remove_bll_import(prop:PropertyAssignment){
	const bll_value = prop.getLastChildByKind(ts.SyntaxKind.Identifier);
	if(bll_value){
		const symbol = bll_value.getSymbol();
		if(symbol){
			const declarations = symbol.getDeclarations();
			for(const decl of declarations){
				const import_decl = decl.getFirstAncestorByKind(ts.SyntaxKind.ImportDeclaration);
				if(import_decl){
					import_decl.replaceWithText('');
				}
			}
		}
	}
}

function _remove_bll_prop_and_imports(book_decl:VariableDeclaration){
	output.verbose_log(`bll_`, `Look for bll property assignments.`);
	const book_expr = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
	if(book_expr){
		const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
		for(const atom_name of atom_names){
			const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
			if(atom_def){
				const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
				for(const atom_def_prop of atom_def_props){
					if(atom_def_prop.getName() === 'bll'){
						_remove_bll_import(atom_def_prop);
						atom_def_prop.remove();
						output.verbose_log(`bll_`, `Removed bll for [${atom_name.getName()}].`);
					}
				}
			}
		}
	}
	return book_decl;
}

function _remove_type_reference(book_decl:VariableDeclaration){
	output.verbose_log(`type`, `Look for type reference.`);
	const type_ref = book_decl.getFirstChildByKind(ts.SyntaxKind.TypeReference);
	if(type_ref){
		book_decl.removeType();
		output.verbose_log(`type`, `Type reference removed.`);
	}
	return book_decl;
}

function _find_atom_book_declaration(node:Node){
	output.verbose_log(`book`, `Look for atom_book declaration.`);
	const var_decl_list = node.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
	if(var_decl_list){
		const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
		if(var_decl){
			const name = var_decl.getName();
			if(name === 'atom_book'){
				output.verbose_log(`book`, `Declaration of atom_book found.`);
				return var_decl;
			}
		}
	}
	return undefined;
}
