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
	PropertyAssignment,
	SourceFile
} from 'ts-morph';

import {Arguments} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

export const transpose = {
	
	run: async (args:Arguments):Promise<void> => {
		
		output.start_loading('Transposing...');
		
		const src_path = args.s || args['src-path'] || defaults.book_src_path;
		
		const destination = args.d || args.destination || defaults.book_dest_path;
		
		const modified = _manipulate_file(src_path);
		
		_copy_modified_file_to_dest(destination, modified);
		
		output.end_log(`Transpose completed.`);
		
		// process.exit(1);
		
	}
	
};

function _manipulate_file(src_path:string){
	
	const action = `manipulating [${src_path}]`;
	output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
	
	output.verbose_log(`mnpl`, `Started ${action}.`);
	
	const project = new Project();
	let sourceFile = project.addSourceFileAtPath(src_path);
	
	sourceFile = _change_realtive_imports(sourceFile);
	sourceFile = _manipulate_atom_book(sourceFile);

	output.done_log('mnpl', `Done ${action}`);
	
	return sourceFile.print();
}

function _manipulate_atom_book(sourceFile:SourceFile)
		:SourceFile{
	output.start_loading(`Manipulating atom_book...`);
	const var_states = sourceFile.getChildrenOfKind(ts.SyntaxKind.VariableStatement);
	for(const var_state of var_states){
		let book_decl = _find_atom_book_declaration(var_state);
		if(book_decl){
			book_decl = _remove_type_reference(book_decl);
			book_decl = _remove_bll_prop_and_imports(book_decl);
			book_decl = _add_as_const(book_decl);
			break;
		}
	}
	output.done_log('mnpl', 'Done manipulating atom_book.');
	return sourceFile;
}

function _change_realtive_imports(sourceFile:SourceFile)
		:SourceFile{
	output.start_loading(`Changing relative imports...`);
	const import_decls = sourceFile.getChildrenOfKind(ts.SyntaxKind.ImportDeclaration);
	for(const import_decl of import_decls){
		_change_realtive_import(import_decl);
	}
	output.done_log('impr', 'Changed relative imports.');
	return sourceFile;
}


function _copy_modified_file_to_dest(dest:string, text:string){
	output.start_loading(`Copying manipulated book...`);
	fs.writeFileSync(dest, text);
	output.done_log(`trns`, `Book manipulated and moved to [${dest}].`);
}

function _add_as_const(book_decl:VariableDeclaration){
	output.start_loading(`Adding as const...`);
	book_decl.replaceWithText(book_decl.getText() + ' as const');
	output.done_log(`asco`, `Added as const.`);
	return book_decl;
}

function _change_realtive_import(node:Node)
		:Node{
	output.start_loading(`Changing relative imports...`);
	const str_lit = node.getFirstChildByKind(ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		if(text.includes('./')){
			const replace = text.replace('./','../src/');
			str_lit.replaceWithText(replace);
			output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
		}
	}
	output.done_log('impo', `Changed relative import.`);
	return node;
}

function _remove_bll_import(prop:PropertyAssignment){
	output.start_loading(`Removing bll import...`);
	const bll_value = prop.getLastChildByKind(ts.SyntaxKind.Identifier);
	if(bll_value){
		const symbol = bll_value.getSymbol();
		if(symbol){
			const declarations = symbol.getDeclarations();
			for(const decl of declarations){
				const import_decl = decl.getFirstAncestorByKind(ts.SyntaxKind.ImportDeclaration);
				if(import_decl){
					const import_text = import_decl.getText();
					import_decl.replaceWithText('');
					output.verbose_log('blls', `Removed import declaration [${import_text}].`);
				}
			}
		}
	}
	output.done_log('blls', `Removed bll import.`);
}

function _remove_bll_prop_and_imports(book_decl:VariableDeclaration){
	output.start_loading(`Removing bll prop and imports...`);
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
	output.done_log('blls', `Removed blls.`);
	return book_decl;
}

function _remove_type_reference(book_decl:VariableDeclaration){
	output.start_loading(`Removing type reference...`);
	output.verbose_log(`type`, `Look for type reference.`);
	const type_ref = book_decl.getFirstChildByKind(ts.SyntaxKind.TypeReference);
	if(type_ref){
		book_decl.removeType();
		output.verbose_log(`type`, `Type reference removed.`);
	}
	output.done_log('type', `Type reference removed.`);
	return book_decl;
}

function _find_atom_book_declaration(node:Node){
	output.start_loading(`Looking for atom_book declaration...`);
	output.verbose_log(`book`, `Look for atom_book declaration.`);
	const var_decl_list = node.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
	if(var_decl_list){
		const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
		if(var_decl){
			const name = var_decl.getName();
			if(name === 'atom_book'){
				output.done_log(`book`, `Declaration of atom_book found.`);
				return var_decl;
			}
		}
	}
	output.done_log('book', `Cannot find atom_book`);
	return undefined;
}
