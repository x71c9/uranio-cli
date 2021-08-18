/**
 * Hooks command module
 *
 * This command will generate Hooks for Uranio TRX.
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as tsm from 'ts-morph';

import {Options} from '../types';

import {conf, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import * as common from './common';

const default_routes = {
	find: {url: '/'},
	find_id: {url: '/:id'},
	find_one: {url: '/'},
	insert: {url: '/'},
	update: {url: '/:id'},
	delete: {url: '/:id'}
};

export const hooks = {
	
	run: (options?:Partial<Options>):void => {
		
		common.init_run(options);
		
		hooks.command();
		
	},
	
	include: ():void => {
		
		const is_hidden = conf.hide;
		
		conf.hide = true;
		
		hooks.command();
		
		conf.hide = is_hidden;
		
		output.done_log('hooks', `TRX Hooks generated.`);
		
	},
	
	command: ():void => {
		
		output.start_loading('Generating TRX Hooks...');
		
		util.read_rc_file();
		
		const text = _generate_text();
		
		_save_to_file(text);
		
		output.end_log(`TRX Hooks generated.`);
		
	},
	
};

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
		newLineKind: tsm.NewLineKind.LineFeed
	}
};


function _get_book_atom_def(book_name:string){
	const atom_book_path = `${conf.root}/${defaults.folder}/client/books/${book_name}.ts`;
	const _project = new tsm.Project(_project_option);
	const sourceFile = _project.addSourceFileAtPath(atom_book_path);
	const syntax_list = sourceFile.getLastChildByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const var_states = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_state of var_states){
		const decl_list = var_state.getFirstChildByKindOrThrow(tsm.SyntaxKind.VariableDeclarationList);
		const identifier = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
		const id_name = identifier.getText();
		if(id_name === `${book_name}_book`){
			const obj_lit_exp = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const book_syntax_list = obj_lit_exp.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const prop_ass = book_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			return prop_ass;
		}
	}
}

function _get_atom_name_from_book(book_name:string){
	const atom_names:string[] = [];
	const atom_def_with_atom_name = _get_book_atom_def(book_name);
	if(!atom_def_with_atom_name){
		return atom_names;
	}
	for(const prop of atom_def_with_atom_name){ // atom def with atom name [tsm PropertyAssignment]
		const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		const atom_name = prop_id.getText();
		atom_names.push(atom_name);
	}
	return atom_names;
}

type AnyByAtom = {
	[k:string]: any
}

function _get_book_atom_def_props(book_name:string){
	const atom_def_by_atom:AnyByAtom = {};
	const atom_def_with_atom_name = _get_book_atom_def(book_name);
	if(!atom_def_with_atom_name){
		return atom_def_by_atom;
	}
	for(const prop of atom_def_with_atom_name){ // atom def with atom name
		const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		const atom_name = prop_id.getText();
		const prop_obj = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
		const prop_syntax = prop_obj.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
		const atom_props = prop_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
		atom_def_by_atom[atom_name] = atom_props; // atom def properties [plural, properties, connection, ...]
	}
	return atom_def_by_atom;
}

function _get_atom_def_plural(){
	const plural_by_atom:AnyByAtom = {};
	const atom_def_props = _get_book_atom_def_props('atom');
	if(!atom_def_props){
		return plural_by_atom;
	}
	for(const atom_name in atom_def_props){
		for(const atom_prop of atom_def_props[atom_name]){
			const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			const atom_prop_name = atom_prop_id.getText();
			if(atom_prop_name === 'plural'){
				let atom_prop_value = undefined;
				const string_lits = atom_prop.getChildrenOfKind(tsm.SyntaxKind.StringLiteral);
				if(string_lits.length > 0){
					atom_prop_value = string_lits[0].getText();
				}
				plural_by_atom[atom_name] = atom_prop_value;
			}
		}
	}
	return plural_by_atom;
}

function _get_custom_routes(){
	const routes_by_atom:AnyByAtom = {};
	const atom_def_props = _get_book_atom_def_props('dock');
	if(!atom_def_props){
		return routes_by_atom;
	}
	for(const atom_name in atom_def_props){
		for(const atom_prop of atom_def_props[atom_name]){
			const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			const atom_prop_name = atom_prop_id.getText();
			if(atom_prop_name === 'dock'){
				const dock_syntax_list = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const dock_props = dock_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
				for(const dock_prop of dock_props){
					const dock_prop_id = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
					const dock_prop_name = dock_prop_id.getText();
					if(dock_prop_name === 'routes'){
						const routes_syntax_list = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
						const routes_props = routes_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
						for(const routes_prop of routes_props){
							const routes_prop_id = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
							const routes_prop_name = routes_prop_id.getText(); // routes name
							if(!routes_by_atom[atom_name]){
								routes_by_atom[atom_name] = {};
							}
							routes_by_atom[atom_name][routes_prop_name] = {};
							const route_syntax = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
							const route_props = route_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
							for(const route_prop of route_props){ // [url, query, action, method, call]
								const route_prop_id = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
								const route_prop_name = route_prop_id.getText();
								if(route_prop_name === 'url'){
									const url_string_lit = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
									const url_string = url_string_lit.getText();
									routes_by_atom[atom_name][routes_prop_name].url = url_string.replace(/"/g,'');
								}
							}
						}
					}
				}
			}
		}
	}
	return routes_by_atom;
}

function _get_atom_routes(){
	const full_routes_by_atom:AnyByAtom = {};
	const atom_names = _get_atom_name_from_book('atom');
	const routes_by_atom = _get_custom_routes();
	for(const atom_name of atom_names){
		full_routes_by_atom[atom_name] = {};
		let default_route_name:keyof typeof default_routes;
		for(default_route_name in default_routes){
			full_routes_by_atom[atom_name][default_route_name] = default_routes[default_route_name];
			if(routes_by_atom[atom_name]){
				for(const custom_route_name in routes_by_atom[atom_name]){
					full_routes_by_atom[atom_name][custom_route_name] = routes_by_atom[atom_name][custom_route_name];
				}
			}
		}
	}
	return full_routes_by_atom;
}

function _get_parameters_from_url(url:string){
	const url_params:string[] = [];
	const splitted_url = url.split('/');
	for(const split_url of splitted_url){
		if(split_url.includes(':')){
			const splitted_split = split_url.split(':');
			if(splitted_split.length > 1){
				url_params.push(splitted_split[1]);
			}
		}
	}
	return url_params;
}

function _generate_args(params:string[]){
	const param_text:string[] = [];
	for(const p of params){
		param_text.push(`${p}:string, `);
	}
	return param_text.join('');
}

function _text_args_for_url(url:string){
	const params = _get_parameters_from_url(url);
	return _generate_args(params);
}

function _text_lines_in_args_params(url:string){
	const lines:string[] = [];
	const url_params = _get_parameters_from_url(url);
	for(const p of url_params){
		lines.push(`${p}: ${p},`);
	}
	return lines;
}

function _generate_text(){
	
	const atom_names = _get_atom_name_from_book('atom');
	const atom_plurals = _get_atom_def_plural();
	const atom_routes = _get_atom_routes();
	
	let text = '';
	text += `/**\n`;
	text += ` * Autogenerated TRX Hooks module from urn-cli\n`;
	text += ` *\n`;
	text += ` * @packageDocumentation\n`;
	text += ` */\n`;
	text += `\n`;
	text += `import * as uranio from './cln/main';\n`;
	text += `\n`;
	text += `export const trx = {\n`;
	for(const atom_name of atom_names){
		const plural = (typeof atom_plurals[atom_name] === 'string') ?
			atom_plurals[atom_name] : `${atom_name}s`;
		text += `\t${plural}: {\n`;
		for(const route_name in atom_routes[atom_name]){
			const text_args = _text_args_for_url(atom_routes[atom_name][route_name].url);
			text += `\t\t${route_name}: async (${text_args}options?:uranio.types.HookArguments<'${atom_name}', '${route_name}'>) => {\n`;
			text += `\t\t\tconst args:uranio.types.HookArguments<'${atom_name}', '${route_name}'> = {\n`;
			const lines = _text_lines_in_args_params(atom_routes[atom_name][route_name].url);
			if(lines.length > 0){
				text += `\t\t\t\tparams: {\n`;
				for(const line of lines){
					text += `\t\t\t\t\t${line}\n`;
				}
				text += `\t\t\t\t},\n`;
			}
			text += `\t\t\t\t...options\n`;
			text += `\t\t\t};\n`;
			text += `\t\t\treturn await uranio.trx.create('${atom_name}').hook('${route_name}')(args);\n`;
			text += `\t\t},\n`;
		}
		text += `\t},\n`;
	}
	text += `} as const;\n`;
	output.done_verbose_log(`hooks`, `Generated text.`);
	return text;
}

function _save_to_file(text:string){
	const filepath = `${conf.root}/${defaults.folder}/lib/hooks.ts`;
	fs.writeFileSync(filepath, text);
	util.pretty(filepath);
	output.done_verbose_log(`hooks`, `Created hooks file [${filepath}].`);
}


