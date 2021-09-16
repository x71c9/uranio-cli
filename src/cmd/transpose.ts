/**
 * Transpose command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import * as tsm from 'ts-morph';

import {Options, Arguments} from '../types';

import {conf, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

import * as alias from './alias';

type BookName = 'atom' | 'dock' | 'bll' | 'routes';

const atom_book_required_properties = ['properties', 'security', 'connection', 'plural'];
const dock_book_required_properties = ['dock'];
const bll_book_required_properties = ['bll'];

const atom_book_required_client_first_props = ['properties', 'plural', 'connection'];
const dock_book_required_client_second_props = ['url', 'routes'];

const submodules = ['core', 'api'];

type TransposeOptions = {
	file?:string;
}

const transpose_options:TransposeOptions = {};

export const transpose = {
	
	run: (root:string, filepath?:string, options?:Partial<Options>):void => {
		
		conf.root = root;
		
		if(typeof filepath === 'string'){
			transpose_options.file = util.relative_to_absolute_path(filepath);
		}
		
		common.init_run(options);
		
		transpose.command();
		
	},
	
	command: (args?:Arguments):void => {
		
		output.start_loading('Transposing...');
		
		util.read_rc_file();
		
		if(args && args.file){
			const filepath = args.file;
			if(typeof filepath === 'string' && filepath !== ''){
				transpose_options.file = util.relative_to_absolute_path(filepath);
			}
		}
		
		if(typeof transpose_options.file === 'string'){
			
			const parsed_path = path.parse(transpose_options.file);
			if(typeof parsed_path.ext === 'string' && parsed_path.ext !== ''){
				
				_transpose_file(transpose_options.file);
				
			}else{
				
				_transpose_folder(transpose_options.file);
				
			}
			
		}else{
			
			_transpose_all();
			
		}
		// output.stop_loading();
		// process.exit(0);
	}
	
};

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
	}
};

function _transpose_file(file_path:string){
	
	if(transpose_options.file === `${conf.root}/src/book.ts`){
		
		_transpose_book();
		
	}else{
			
		const src_path = `${conf.root}/src/`;
		
		if(fs.existsSync(file_path) && file_path.includes(`${conf.root}/src/`)){
			
			const base_folder = `${conf.root}/${defaults.folder}`;
			const new_path_server = file_path.replace(src_path, `${base_folder}/server/src/`);
			const new_path_client = file_path.replace(src_path, `${base_folder}/client/src/`);
			util.copy_file(`trsp`, file_path, new_path_server);
			util.copy_file(`trsp`, file_path, new_path_client);
			
			if(path.extname(file_path) === '.ts'){
				alias.replace_file_aliases(new_path_server, alias.get_aliases(`${base_folder}/server/tsconfig.json`));
				alias.replace_file_aliases(new_path_client, alias.get_aliases(`${base_folder}/client/tsconfig.json`));
				_avoid_import_loop(new_path_server);
				_avoid_import_loop(new_path_client);
				output.done_verbose_log('trsp', `Transposed file [${file_path}].`);
			}
			
		}else{
			output.error_log(`trsp`, `Invalid file path [${file_path}]. File must be in [${conf.root}/src/].`);
		}
		
	}
	
}

function _transpose_folder(dir_path:string){
	fs.readdirSync(dir_path).forEach((filename) => {
		const full_path = path.resolve(dir_path, filename);
		if (fs.statSync(full_path).isDirectory() && filename !== '.git'){
			return _transpose_folder(full_path);
		}else{
			return _transpose_file(full_path);
		}
	});
}

function _transpose_book(){

	const tmp_book_folder = `${conf.root}/${defaults.folder}/.tmp`;
	
	util.remove_folder_if_exists('tmp', tmp_book_folder);
	util.create_folder_if_doesnt_exists('tmp', tmp_book_folder);
	
	util.copy_file(
		'bkp',
		`${conf.root}/src/book.ts`,
		`${tmp_book_folder}/book.ts`
	);
	
	_manipulate_and_create_files(`${tmp_book_folder}/book.ts`);
	
	_generate_client_books();
	
	_resolve_aliases_in_books();
	
	_replace_imports_to_avoid_loops_in_books();
	
	util.remove_folder_if_exists('tmp', tmp_book_folder);
	
}

function _transpose_all(){
	
	_transpose_book();
	
	_copy_from_src_into_uranio_folder();
	
	_resolve_aliases();
	
	_replace_import_to_avoid_loops();
	
	// output.end_log(`Transpose completed.`);
	
	output.stop_loading();
	output.done_log(`end`,`Transpose completed.`);
}

function _replace_import_to_avoid_loops(){
	const server_dir = `${conf.root}/${defaults.folder}/server/`;
	if(fs.existsSync(server_dir)){
		_traverse_ts_avoid_import_loop(server_dir);
	}
	const client_dir = `${conf.root}/${defaults.folder}/client/`;
	if(fs.existsSync(client_dir)){
		_traverse_ts_avoid_import_loop(client_dir);
	}
}

function _replace_imports_to_avoid_loops_in_books(){
	const server_dir = `${conf.root}/${defaults.folder}/server/src/books/`;
	if(fs.existsSync(server_dir)){
		_traverse_ts_avoid_import_loop(server_dir);
	}
	const client_dir = `${conf.root}/${defaults.folder}/client/src/books/`;
	if(fs.existsSync(client_dir)){
		_traverse_ts_avoid_import_loop(client_dir);
	}
}

function _traverse_ts_avoid_import_loop(directory:string) {
	fs.readdirSync(directory).forEach((filename) => {
		const full_path = path.resolve(directory, filename);
		if (fs.statSync(full_path).isDirectory() && filename !== '.git'){
			return _traverse_ts_avoid_import_loop(full_path);
		}else if(filename.split('.').pop() === 'ts'){
			_avoid_import_loop(full_path);
		}
	});
}

function _traverse_ts_resolve_aliases(directory:string, aliases:alias.Aliases) {
	fs.readdirSync(directory).forEach((filename) => {
		const full_path = path.resolve(directory, filename);
		if (fs.statSync(full_path).isDirectory() && filename !== '.git' && filename !== 'books' && filename !== 'uranio'){
			return _traverse_ts_resolve_aliases(full_path, aliases);
		}else if(filename.split('.').pop() === 'ts'){
			alias.replace_file_aliases(full_path, aliases);
		}
	});
}

type ModuleList = {
	[k:string]: string[]
}

type ExpressionList = {
	[k:string]: string[]
}

function _avoid_import_loop(filepath:string){
	
	const modules:ModuleList = {};
	const expressions:ExpressionList = {};
	
	let uranio_import_state = '';
	
	const _project = new tsm.Project(_project_option);
	const sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	const import_decls = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
	let uranio_var_name = '';
	
	let is_file_importing_uranio = false;
	
	for(const import_decl of import_decls){
		const str_lit = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
		const module_name = str_lit.getText();
		const repo_length = defaults.repo_folder.length;
		
		let is_importing_uranio = false;
		
		if(module_name.substr(-1 * (repo_length + 3)) === `/${defaults.repo_folder}/"`){
			is_importing_uranio = true;
		}
		if(module_name.substr(-1 * (repo_length + 2)) === `/${defaults.repo_folder}"`){
			is_importing_uranio = true;
		}
		if(module_name.substr(-1 * (repo_length + 9)) === `/${defaults.repo_folder}/client"`){
			is_importing_uranio = true;
		}
		if(is_importing_uranio){
			is_file_importing_uranio = true;
			uranio_import_state = import_decl.getText();
			const identif = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			uranio_var_name = identif.getText();
			const prop_access_exps = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression) as tsm.Node[];
			const qualified_name = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.QualifiedName) as tsm.Node[];
			const nodes_to_check:tsm.Node[] = prop_access_exps.concat(qualified_name);
			for(const prop_access_exp of nodes_to_check){
				const prop_text = prop_access_exp.getText();
				const exploded_text = prop_text.split('.');
				if(exploded_text[0] !== uranio_var_name){
					continue;
				}
				exploded_text.shift();
				let parent_module = uranio_var_name;
				while(submodules.includes(exploded_text[0])){
					parent_module = exploded_text[0];
					exploded_text.shift();
				}
				if(exploded_text.length !== 1){
					continue;
				}
				const module_name = exploded_text[0];
				if(!modules[parent_module]){
					modules[parent_module] = [];
				}
				if(!modules[parent_module].includes(module_name)){
					modules[parent_module].push(module_name);
				}
				if(!expressions[module_name]){
					expressions[module_name] = [];
				}
				if(!expressions[module_name].includes(prop_text)){
					expressions[module_name].push(prop_text);
				}
			}
		}
	}
	
	const import_states:string[] = [];
	
	const is_server_folder = (filepath.includes(`${conf.root}/${defaults.folder}/server/`));
	// const is_client_folder = (filepath.includes(`${conf.root}/${defaults.folder}/client/`));
	
	const parent_folder = (is_server_folder) ? 'server' : 'client';
	
	const folderpath = path.parse(filepath).dir;
	const lib_path = `${conf.root}/${defaults.folder}/${parent_folder}/src/${defaults.repo_folder}/`;
	const relative_root = path.relative(folderpath, lib_path);

	const clnsrv_folder = (is_server_folder) ? 'srv' : 'cln';
	
	let relative_path = '';
	for(const submodule_name in modules){
		for(const module_name of modules[submodule_name]){
			if(module_name === 'types'){
				relative_path = `${relative_root}/${clnsrv_folder}/types`;
			}else{
				const submod_tree = _resolve_path_tree(submodule_name);
				relative_path = `${relative_root}/${submod_tree}${module_name}`;
			}
			const import_state = `import * as ${_generate_variable_name(module_name)} from '${relative_path}'`;
			import_states.push(import_state);
		}
	}
	
	const file_content = sourceFile.print();
	
	if(uranio_import_state !== ''){
		const regex = new RegExp(`${uranio_import_state}`);
		const with_imports = file_content.replace(regex, import_states.join('\n'));
		
		let with_imports_and_variables = with_imports;
		for(const module_name in expressions){
			for(const expression of expressions[module_name]){
				const regex = new RegExp(`\\b${expression.replace(".","\\.")}\\b`,'g');
				with_imports_and_variables = with_imports_and_variables.replace(regex, _generate_variable_name(module_name));
			}
		}
		
		if(is_file_importing_uranio){
			fs.writeFileSync(filepath, with_imports_and_variables);
			util.pretty(filepath);
		}
	}
	
}

function _generate_variable_name(str:string){
	let num = "";
	for(let i = 0; i < str.length; i++){
		const code = str.toUpperCase().charCodeAt(i);
		if (code > 64 && code < 91){
			num += (code - 64);
		}
	}
	return `${str}_${num}`;
}

function _resolve_path_tree(submodule_name:string){
	switch(conf.repo){
		case 'trx':{
			switch(submodule_name){
				case 'core': return 'api/core/';
				case 'api': return 'api/';
			}
			break;
		}
		case 'api':{
			switch(submodule_name){
				case 'core': return 'core/';
			}
			break;
		}
		case 'core':{
			return '';
		}
	}
	return '';
}

function _copy_from_src_into_uranio_folder(){
	
	util.copy_files(
		`trsp`,
		`${conf.root}/src/.`,
		`${conf.root}/${defaults.folder}/client/src/`
	);
	
	util.copy_files(
		`trsp`,
		`${conf.root}/src/.`,
		`${conf.root}/${defaults.folder}/server/src/`
	);
	
	util.remove_file_if_exists(`book`, `${conf.root}/${defaults.folder}/server/src/book.ts`);
	util.remove_file_if_exists(`book`, `${conf.root}/${defaults.folder}/client/src/book.ts`);
	
	// if(fs.existsSync(`${conf.root}/src/server/`)){
	//   util.copy_files('copy', `${conf.root}/src/server/*`, `${conf.root}/${defaults.folder}/server/src/`);
	// }
	// if(fs.existsSync(`${conf.root}/src/client/`)){
	//   util.copy_files('copy', `${conf.root}/src/client/*`, `${conf.root}/${defaults.folder}/client/src/`);
	// }
	
}

function _manipulate_and_create_files(filepath:string){
	const action = `manipulating [src/book.ts]`;
	
	output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
	
	output.verbose_log(`mnpl`, `Started ${action}.`);
	
	// let sourceFile = _project.addSourceFileAtPath(`${conf.root}/src/book.ts`);
	
	const _project = new tsm.Project(_project_option);
	
	let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
	
	sourceFile = _replace_comments(sourceFile);
	// sourceFile = _change_realtive_imports(sourceFile);
	
	let import_statements = _copy_imports(sourceFile);
	import_statements = _change_import_statements_relative_path(import_statements);
	
	_create_atom_book(sourceFile, import_statements);
	_create_bll_book(sourceFile, import_statements);
	_create_dock_book(sourceFile, import_statements);
	_create_routes_book(sourceFile, import_statements);
	
	// sourceFile = _manipulate_atom_book(sourceFile);
	
	// const modified = sourceFile.print();
	
	// _create_manipulated_file(modified);
	
	// _pretty_books();
	
	// _type_check_books();
}

function _change_import_statements_relative_path(import_statements:string[])
		:string[]{
	const modified_import_statements:string[] = [];
	for(const import_statement of import_statements){
		const _project = new tsm.Project(_project_option);
		const node = _project.createSourceFile(
			`${conf.root}/${defaults.folder}/server/src/books/imports.ts`,
			import_statement,
			{ overwrite: true }
		);
		const str_lit = node.getFirstDescendantByKind(tsm.ts.SyntaxKind.StringLiteral);
		if(str_lit){
			const text = str_lit.getText();
			if(text.slice(1,3) === './'){
				str_lit.replaceWithText(`'.${text.slice(1, text.length-1)}'`);
			}
			modified_import_statements.push(node.getText());
		}
	}
	return modified_import_statements;
}

function _replace_comments(sourceFile:tsm.SourceFile)
		:tsm.SourceFile{
	const node = sourceFile.getFirstChild();
	if(node){
		const comments = node.getLeadingCommentRanges();
		if(comments.length > 0){
			let new_comment = '';
			new_comment += `/**\n`;
			new_comment += ` *\n`;
			new_comment += ` * Autogenerated books from urn-cli\n`;
			new_comment += ` *\n`;
			new_comment += ` */\n`;
			const node_text = node.getText(true);
			const end = comments[0].getEnd();
			const no_comments = node_text.substr(end);
			node.replaceWithText(`${new_comment}${no_comments}`);
		}
	}
	return sourceFile;
}

function _create_a_book(
	sourceFile:tsm.SourceFile,
	import_statements:string[],
	book_name:BookName,
	keep_properties:string[],
	required_book_name:BookName
):tsm.SourceFile{
	output.start_loading(`Creating ${book_name}_book...`);
	const book_state = _find_atom_book_statement(sourceFile);
	if(book_state){
		const atom_book_state_text = book_state.getText();
		const _project = new tsm.Project(_project_option);
		const cloned_book_source = _project.createSourceFile(
			`${conf.root}/${defaults.folder}/server/src/books/${book_name}.ts`,
			atom_book_state_text,
			{ overwrite: true }
		);
		let cloned_book_decl = cloned_book_source
			.getFirstDescendantByKind(tsm.ts.SyntaxKind.VariableDeclaration);
		if(cloned_book_decl){
			cloned_book_decl = _remove_type_reference(cloned_book_decl);
			cloned_book_decl = _rename_book(book_name, cloned_book_decl);
			cloned_book_decl = _clean_all_but(keep_properties, cloned_book_decl);
			cloned_book_decl = _append_required_book(cloned_book_decl, required_book_name);
			cloned_book_decl = _add_as_const(cloned_book_decl);
		}
		const required_imports = _get_required_imports(import_statements, cloned_book_source.getText());
		const filepath = `${conf.root}/${defaults.folder}/server/src/books/${book_name}.ts`;
		const text = required_imports.join('\n') + cloned_book_source.getText();
		_create_a_book_file(filepath, text);
		output.done_log(book_name, `Generated server book [${book_name}].`);
		cloned_book_source.replaceWithText(text);
		return cloned_book_source;
	}
	return sourceFile;
}

/**
 *
 * This function check if the identifiers in the import statements are used in `text`.
 * Return an Array of the import statements required for that `text`.
 *
 */
function _get_required_imports(import_statements:string[], text:string){
	const required_import_statements:string[] = [];
	
	const str_project = new tsm.Project({
		tsConfigFilePath: `${conf.root}/${defaults.folder}/server/tsconfig.json`,
		skipFileDependencyResolution: true
	});
	for(let i = 0; i < import_statements.length; i++){
		const imp_state = import_statements[i];
		const str_source_file = str_project.createSourceFile(`file${i}.ts`, imp_state);
		const import_decls = str_source_file.getDescendantsOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
		for(const decl of import_decls){
			const identifiers = decl.getDescendantsOfKind(tsm.ts.SyntaxKind.Identifier);
			for(const idf of identifiers){
				const idf_text = idf.getText();
				const regex = new RegExp(`\\b${idf_text}\\b`);
				if(regex.test(text)){
					required_import_statements.push(decl.getText());
				}
			}
		}
	}
	
	return required_import_statements;
}

function _create_atom_book(sourceFile:tsm.SourceFile, import_statements:string[])
		:tsm.SourceFile{
	return _create_a_book(sourceFile, import_statements, 'atom', atom_book_required_properties, 'atom');
}

function _create_bll_book(sourceFile:tsm.SourceFile, import_statements:string[])
		:tsm.SourceFile{
	return _create_a_book(sourceFile, import_statements, 'bll', bll_book_required_properties, 'bll');
}

function _create_dock_book(sourceFile:tsm.SourceFile, import_statements:string[])
		:tsm.SourceFile{
	let source_file = _create_a_book(sourceFile, import_statements, 'dock', dock_book_required_properties, 'dock');
	source_file = _fill_empty_docks(source_file);
	
	const filepath = `${conf.root}/${defaults.folder}/server/src/books/dock.ts`;
	_create_a_book_file(filepath, source_file.getText());
	
	return source_file;
}

function _create_routes_book(sourceFile:tsm.SourceFile, import_statements:string[])
		:tsm.SourceFile{
	let source_file = _create_a_book(sourceFile, import_statements, 'routes', dock_book_required_properties, 'dock');
	source_file = _fill_empty_docks(source_file);
	source_file = _remove_dock_route_call_implementation(source_file);
	
	const filepath = `${conf.root}/${defaults.folder}/server/src/books/routes.ts`;
	_create_a_book_file(filepath, source_file.getText());
	
	return source_file;
}


function _clean_all_but(but:string[], var_decl:tsm.VariableDeclaration)
		:tsm.VariableDeclaration{
	output.start_loading(`Cleaning all properties but [${but}]...`);
	const book_expr = var_decl.getFirstChildByKind(tsm.ts.SyntaxKind.ObjectLiteralExpression);
	if(book_expr){
		const atom_names = book_expr.getChildrenOfKind(tsm.ts.SyntaxKind.PropertyAssignment);
		for(const atom_name of atom_names){
			const atom_def = atom_name.getFirstChildByKind(tsm.ts.SyntaxKind.ObjectLiteralExpression);
			if(atom_def){
				const atom_def_props = atom_def.getChildrenOfKind(tsm.ts.SyntaxKind.PropertyAssignment);
				for(const atom_def_prop of atom_def_props){
					if(!but.includes(atom_def_prop.getName())){
						atom_def_prop.remove();
					}
				}
			}
		}
	}
	output.done_verbose_log('props', `Removed all properties but [${but}].`);
	return var_decl;
}

function _rename_book(book_name:BookName, var_decl:tsm.VariableDeclaration)
		:tsm.VariableDeclaration{
	const identifier = var_decl.getFirstChildByKind(tsm.ts.SyntaxKind.Identifier);
	if(identifier){
		identifier.replaceWithText(`${book_name}_book`);
	}
	return var_decl;
}

function _get_variable_content(source:tsm.SourceFile, variable_name:string)
		:string{
	const states = source.getChildrenOfKind(tsm.ts.SyntaxKind.VariableStatement);
	for(const state of states){
		const var_decl = state.getFirstDescendantByKind(tsm.ts.SyntaxKind.VariableDeclaration);
		if(var_decl){
			if(var_decl.getName() === variable_name){
				const syntax_list = var_decl.getFirstDescendantByKind(tsm.ts.SyntaxKind.SyntaxList);
				if(syntax_list){
					return syntax_list.getText();
				}
			}
		}
	}
	return '';
}

function _add_book_from_file(
	book_decl:tsm.VariableDeclaration,
	required_book_name:BookName,
	books_file_path:string
){
	const book_content = fs.readFileSync(books_file_path, 'utf8');
	
	const _project = new tsm.Project(_project_option);
	
	const core_books_source = _project.createSourceFile(
		`${conf.root}/${defaults.folder}/cloned_${required_book_name}.ts`,
		book_content,
		{ overwrite: true }
	);
	let core_var_content = _get_variable_content(core_books_source, required_book_name);
	const syntax_list = book_decl.getFirstDescendantByKind(tsm.ts.SyntaxKind.SyntaxList);
	if(syntax_list && core_var_content.length > 0){
		if(core_var_content[core_var_content.length - 1] !== ','){
			core_var_content += ',';
		}
		syntax_list.replaceWithText(core_var_content + syntax_list.getText());
	}
}

function _add_core_books(book_decl:tsm.VariableDeclaration, required_book_name:BookName){
	let core_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}`;
	switch(conf.repo){
		case 'core':{
			break;
		}
		case 'api':{
			core_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}/core`;
			break;
		}
		case 'trx':{
			core_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}/api/core`;
			break;
		}
	}
	const required_books_path = `${conf.root}/${core_repo_path}/books.ts`;
	_add_book_from_file(book_decl, required_book_name, required_books_path);
}

function _add_api_book(book_decl:tsm.VariableDeclaration, required_book_name:BookName){
	let api_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}`;
	switch(conf.repo){
		case 'core':
		case 'api':{
			break;
		}
		case 'trx':{
			api_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}/api`;
			break;
		}
	}
	const required_books_path = `${conf.root}/${api_repo_path}/books.ts`;
	_add_book_from_file(book_decl, required_book_name, required_books_path);
}

function _add_trx_book(book_decl:tsm.VariableDeclaration, required_book_name:BookName){
	const trx_repo_path = `${defaults.folder}/server/src/${defaults.repo_folder}`;
	switch(conf.repo){
		case 'core':
		case 'api':
		case 'trx':{
			break;
		}
	}
	const required_books_path = `${conf.root}/${trx_repo_path}/books.ts`;
	_add_book_from_file(book_decl, required_book_name, required_books_path);
}

function _append_required_book(book_decl:tsm.VariableDeclaration, required_book_name:BookName)
		:tsm.VariableDeclaration{
	output.start_loading(`Adding required books...`);
	switch(conf.repo){
		case 'api':{
			_add_api_book(book_decl, required_book_name);
			break;
		}
		case 'trx':{
			_add_api_book(book_decl, required_book_name);
			_add_trx_book(book_decl, required_book_name);
			break;
		}
	}
	_add_core_books(book_decl, required_book_name);
	output.done_verbose_log(`requ`, `Added required books.`);
	return book_decl;
}

// function _change_realtive_imports(sourceFile:tsm.SourceFile)
//     :tsm.SourceFile{
//   output.start_loading(`Changing relative imports...`);
//   const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
//   for(const import_decl of import_decls){
//     _change_realtive_import(import_decl);
//   }
//   output.done_log('impr', 'Changed relative imports.');
//   return sourceFile;
// }

function _add_as_const(book_decl:tsm.VariableDeclaration){
	output.start_loading(`Adding as const...`);
	book_decl.replaceWithText(book_decl.getText() + ' as const');
	output.done_verbose_log(`asco`, `Added as const.`);
	return book_decl;
}

// function _change_realtive_import(node:tsm.Node)
//     :tsm.Node{
//   output.start_loading(`Changing relative imports...`);
//   const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
//   if(str_lit){
//     const text = str_lit.getText();
//     if(text.includes('./')){
//       const replace = text.replace('./','../../');
//       str_lit.replaceWithText(replace);
//       output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
//     }
//   }
//   return node;
// }

function _remove_type_reference(book_decl:tsm.VariableDeclaration){
	output.start_loading(`Removing type reference...`);
	const type_ref = book_decl.getFirstChildByKind(tsm.ts.SyntaxKind.TypeReference);
	if(type_ref){
		book_decl.removeType();
	}
	output.done_verbose_log('type', `Type reference removed.`);
	return book_decl;
}

function _find_atom_book_statement(sourceFile:tsm.SourceFile)
		:tsm.VariableStatement | undefined{
	return _find_book_statement(sourceFile, 'atom_book');
}

function _find_book_statement(sourceFile:tsm.SourceFile, book_name:string)
		:tsm.VariableStatement | undefined{
	output.start_loading(`Looking for atom_book statement...`);
	const var_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.VariableStatement);
	for(const state of var_states){
		const var_decl_list = state.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclarationList);
		if(var_decl_list){
			const var_decl = var_decl_list.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclaration);
			if(var_decl){
				const name = var_decl.getName();
				if(name === book_name){
					output.verbose_log(`book`, `Statement of ${book_name} found.`);
					return state;
				}
			}
		}
	}
	output.verbose_log('book', `Cannot find ${book_name}`);
	return undefined;
}

function _create_a_book_file(filepath:string, text:string){
	output.start_loading(`Creating book file [${filepath}]...`);
	util.sync_exec(`rm -f ${filepath}`);
	util.sync_exec(`touch ${filepath}`);
	let comment = '';
	comment += `/**\n`;
	comment += ` *\n`;
	comment += ` * Autogenerated book from urn-cli\n`;
	comment += ` *\n`;
	comment += ` */\n`;
	const content = comment + text;
	fs.writeFileSync(filepath, content);
	util.pretty(filepath);
	output.done_verbose_log(`book`, `Created book file [${filepath}].`);
}

function _copy_imports(sourceFile:tsm.SourceFile){
	output.start_loading(`Copying import statements...`);
	const import_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
	const states:string[] = [];
	for(const state of import_states){
		states.push(state.getText());
	}
	output.verbose_log('book', `Copied import statements.`);
	return states;
}

// function _resolve_aliases_books(){
//   output.start_loading(`Replacing aliases with relative paths in books folders...`);
//   const base_folder = `${conf.root}/${defaults.folder}`;
	
//   const books_dir_server = `${base_folder}/server/books/`;
//   const tsconfig_server = `${base_folder}/server/tsconfig.json`;
//   const aliases_server = alias.get_aliases(tsconfig_server);
//   _traverse_ts_resolve_aliases(books_dir_server, aliases_server);
	
//   const books_dir_client = `${base_folder}/client/books/`;
//   const tsconfig_client = `${base_folder}/client/tsconfig.json`;
//   const aliases_client = alias.get_aliases(tsconfig_client);
//   _traverse_ts_resolve_aliases(books_dir_client, aliases_client);
// }

function _resolve_aliases(){
	output.start_loading(`Replacing aliases with relative paths...`);
	const base_folder = `${conf.root}/${defaults.folder}`;
	
	const tsconfig_server = `${base_folder}/server/tsconfig.json`;
	const aliases_server = alias.get_aliases(tsconfig_server);
	const server_dir = `${conf.root}/${defaults.folder}/server/src/`;
	_traverse_ts_resolve_aliases(server_dir, aliases_server);
	output.done_log('alias', `Server aliases replaced.`);
	
	const tsconfig_client = `${base_folder}/client/tsconfig.json`;
	const aliases_client = alias.get_aliases(tsconfig_client);
	const client_dir = `${conf.root}/${defaults.folder}/client/src/`;
	_traverse_ts_resolve_aliases(client_dir, aliases_client);
	output.done_log('alias', `Client aliases replaced.`);
}

function _resolve_aliases_in_books(){
	output.start_loading(`Replacing book aliases...`);
	const base_folder = `${conf.root}/${defaults.folder}`;
	
	const books_dir_server = `${base_folder}/server/src/books`;
	const tsconfig_server = `${base_folder}/server/tsconfig.json`;
	const aliases_server = alias.get_aliases(tsconfig_server);
	alias.replace_file_aliases(`${books_dir_server}/atom.ts`,aliases_server);
	alias.replace_file_aliases(`${books_dir_server}/dock.ts`,aliases_server);
	alias.replace_file_aliases(`${books_dir_server}/routes.ts`,aliases_server);
	alias.replace_file_aliases(`${books_dir_server}/bll.ts`,aliases_server);
	output.done_log('alias', `Server books aliases replaced.`);
	
	const books_dir_client = `${base_folder}/client/src/books`;
	const tsconfig_client = `${base_folder}/client/tsconfig.json`;
	const aliases_client = alias.get_aliases(tsconfig_client);
	alias.replace_file_aliases(`${books_dir_client}/atom.ts`,aliases_client);
	alias.replace_file_aliases(`${books_dir_client}/dock.ts`,aliases_client);
	alias.replace_file_aliases(`${books_dir_client}/routes.ts`,aliases_client);
	output.done_log('alias', `Client books aliases replaced.`);
	
}

function _generate_client_books(){
	output.start_loading(`Generating client books...`);
	
	_generate_client_book('dock', dock_book_required_client_second_props);
	_generate_client_book('atom', atom_book_required_client_first_props);
	
	_copy_routes_book();
	
	// output.done_log('client', `Client books generated.`);
}

function _copy_routes_book(){
	const base_folder = `${conf.root}/${defaults.folder}`;
	const routes_server = `${base_folder}/server/src/books/routes.ts`;
	const routes_client = `${base_folder}/client/src/books/routes.ts`;
	util.copy_file(
		'rout',
		routes_server,
		routes_client
	);
	output.done_verbose_log('rout', `Copied [${routes_server}] to [${routes_client}]`);
}

function _fill_empty_docks(sourceFile:tsm.SourceFile){
	const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_stat of variable_stats){
		const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
		const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		if(identifier.getText() === `dock_book` || identifier.getText() === `routes_book`){
			const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			for(const atom_def of atom_defs){
				const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const text = atom_syntax_list.getText();
				if(text === ''){
					const identif = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
					const obj_lit_ex = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
					const atom_name = identif.getText();
					const dock_def = `{dock: {url: '/${atom_name}s'}}`;
					obj_lit_ex.replaceWithText(dock_def);
				}
			}
		}
	}
	
	output.done_log('clnt', `Filled empty docks in dock book.`);
	
	return sourceFile;
}

function _remove_dock_route_call_implementation(sourceFile:tsm.SourceFile){
	const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_stat of variable_stats){
		const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
		const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		if(identifier.getText() === `dock_book` || identifier.getText() === `routes_book`){
			const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			for(const atom_def of atom_defs){
				const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const dock_key_list = atom_syntax_list.getFirstDescendantByKind(tsm.SyntaxKind.SyntaxList);
				if(dock_key_list){
					const dock_keys = dock_key_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
					const atom_id = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
					const atom_name = atom_id.getText();
					for(const dock_key of dock_keys){
						const key_name_identifier = dock_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
						const key_name = key_name_identifier.getText();
						if(key_name === 'routes'){
							const routes_syntax = dock_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
							const routes_props = routes_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
							for(const route of routes_props){
								const route_syntax = route.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
								const route_props = route_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
								for(const prop of route_props){
									const comma = prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
									const prop_id = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
									const prop_id_name = prop_id.getText();
									if(prop_id_name === 'call'){
										if(comma){
											comma.replaceWithText('');
										}
										prop.replaceWithText('');
										output.verbose_log('clnt', `Removed route implementation [${atom_name}][${prop_id_name}]`);
										break;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	output.done_log('clnt', `Removed call implementation in dock book.`);
	
	return sourceFile;
}

function _generate_client_book(book_name:BookName, required_props:string[]){
	const folder_path = `${conf.root}/${defaults.folder}`;
	const server_books_dir = `${folder_path}/server/src/books`;
	const client_books_dir = `${folder_path}/client/src/books`;
	
	const _project = new tsm.Project(_project_option);
	let sourceFile = _project.addSourceFileAtPath(`${server_books_dir}/${book_name}.ts`);
	
	sourceFile = _replace_uranio_client_dependecy(sourceFile);
	
	if(book_name === 'atom'){
		sourceFile = _keep_only_client_first_level_properties(sourceFile, book_name, required_props);
	}else{
		sourceFile = _keep_only_client_second_level_properties(sourceFile, book_name, required_props);
	}
	if(book_name === 'dock'){
		sourceFile = _remove_dock_route_call_implementation(sourceFile);
	}
	
	const book_state = _find_book_statement(sourceFile, `${book_name}_book`);
	
	if(book_state){
		
		const atom_book_state_text = book_state.getText();
		const _project = new tsm.Project(_project_option);
		const cloned_book_source = _project.createSourceFile(
			`${conf.root}/${defaults.folder}/client/src/books/tmp_${book_name}.ts`,
			atom_book_state_text,
			{ overwrite: true }
		);
		const text_without_imports = cloned_book_source.getText();
		const imports = _copy_imports(sourceFile);
		const required_imports = _get_required_imports(imports, text_without_imports);
		const text = required_imports.join('\n') + text_without_imports;
		const filepath = `${client_books_dir}/${book_name}.ts`;
		fs.writeFileSync(filepath, text);
		util.pretty(filepath);
		output.done_log('clnt', `Generated client book [${book_name}].`);
	
	}else{
		
		output.error_log(`err`, `Cannot find client book statements for [${book_name}]`);
		
	}
}

function _replace_uranio_client_dependecy(sourceFile:tsm.SourceFile){
	const imports = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
	for(const decl of imports){
		const str_lit = decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
		const module_name = str_lit.getText();
		let is_importing_uranio = false;
		const repo_length = defaults.repo_folder.length;
		if(module_name.substr(-1 * (repo_length + 3)) === `/${defaults.repo_folder}/"`){
			is_importing_uranio = true;
		}
		if(module_name.substr(-1 * (repo_length + 2)) === `/${defaults.repo_folder}"`){
			is_importing_uranio = true;
		}
		
		if(is_importing_uranio){
			const slash = (module_name[module_name.length - 2] === '/') ? '' : '/';
			const replace_with = `"${module_name.substr(1, module_name.length -2)}${slash}client"`;
			str_lit.replaceWithText(replace_with);
			output.verbose_log('clnt', `Replaced [${module_name}] to [${replace_with}]`);
		}
	}
	return sourceFile;
}

function _keep_only_client_first_level_properties(sourceFile:tsm.SourceFile, book_name:BookName, required_props:string[]){
	const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_stat of variable_stats){
		const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
		const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		if(identifier.getText() === `${book_name}_book`){
			const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			for(const atom_def of atom_defs){
				const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const atom_props = atom_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
				const atom_name_identif = atom_def.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
				const atom_name = atom_name_identif.getText();
				for(const prop of atom_props){
					const comma = prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
					const identif = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
					const ide_text = identif.getText();
					if(!required_props.includes(ide_text)){
						if(comma){
							comma.replaceWithText('');
						}
						prop.replaceWithText('');
						output.verbose_log('clnt', `Removed property [${atom_name}][${ide_text}]`);
					}
				}
			}
		}
	}
	return sourceFile;
}

function _keep_only_client_second_level_properties(sourceFile:tsm.SourceFile, book_name:BookName, required_props:string[]){
	const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_stat of variable_stats){
		const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
		const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		if(identifier.getText() === `${book_name}_book`){
			const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			for(const atom_def of atom_defs){
				const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const atom_props = atom_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
				const atom_name_identif = atom_def.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
				const atom_name = atom_name_identif.getText();
				for(const prop of atom_props){
					const second_syntax_list = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
					const second_prop_list = second_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
					for(const sec_prop of second_prop_list){
						const comma = sec_prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
						const identif = sec_prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
						const ide_text = identif.getText();
						if(!required_props.includes(identif.getText())){
							if(comma){
								comma.replaceWithText('');
							}
							sec_prop.replaceWithText('');
							output.verbose_log('clnt', `Removed property [${atom_name}][${ide_text}]`);
						}
					}
				}
			}
		}
	}
	return sourceFile;
}


