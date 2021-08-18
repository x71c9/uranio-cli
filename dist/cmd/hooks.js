"use strict";
/**
 * Hooks command module
 *
 * This command will generate Hooks for Uranio TRX.
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hooks = void 0;
const fs_1 = __importDefault(require("fs"));
const tsm = __importStar(require("ts-morph"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const default_routes = {
    find: { url: '/' },
    find_id: { url: '/:id' },
    find_one: { url: '/' },
    insert: { url: '/' },
    update: { url: '/:id' },
    delete: { url: '/:id' }
};
exports.hooks = {
    run: (options) => {
        common.init_run(options);
        exports.hooks.command();
    },
    include: () => {
        const is_hidden = defaults_1.conf.hide;
        defaults_1.conf.hide = true;
        exports.hooks.command();
        defaults_1.conf.hide = is_hidden;
        output.done_log('hooks', `TRX Hooks generated.`);
    },
    command: () => {
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
function _get_book_atom_def(book_name) {
    const atom_book_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/books/${book_name}.ts`;
    const _project = new tsm.Project(_project_option);
    const sourceFile = _project.addSourceFileAtPath(atom_book_path);
    const syntax_list = sourceFile.getLastChildByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const var_states = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_state of var_states) {
        const decl_list = var_state.getFirstChildByKindOrThrow(tsm.SyntaxKind.VariableDeclarationList);
        const identifier = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
        const id_name = identifier.getText();
        if (id_name === `${book_name}_book`) {
            const obj_lit_exp = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const book_syntax_list = obj_lit_exp.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const prop_ass = book_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            return prop_ass;
        }
    }
}
function _get_atom_name_from_book(book_name) {
    const atom_names = [];
    const atom_def_with_atom_name = _get_book_atom_def(book_name);
    if (!atom_def_with_atom_name) {
        return atom_names;
    }
    for (const prop of atom_def_with_atom_name) { // atom def with atom name [tsm PropertyAssignment]
        const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        const atom_name = prop_id.getText();
        atom_names.push(atom_name);
    }
    return atom_names;
}
function _get_book_atom_def_props(book_name) {
    const atom_def_by_atom = {};
    const atom_def_with_atom_name = _get_book_atom_def(book_name);
    if (!atom_def_with_atom_name) {
        return atom_def_by_atom;
    }
    for (const prop of atom_def_with_atom_name) { // atom def with atom name
        const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        const atom_name = prop_id.getText();
        const prop_obj = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
        const prop_syntax = prop_obj.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
        const atom_props = prop_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
        atom_def_by_atom[atom_name] = atom_props; // atom def properties [plural, properties, connection, ...]
    }
    return atom_def_by_atom;
}
function _get_atom_def_plural() {
    const plural_by_atom = {};
    const atom_def_props = _get_book_atom_def_props('atom');
    if (!atom_def_props) {
        return plural_by_atom;
    }
    for (const atom_name in atom_def_props) {
        for (const atom_prop of atom_def_props[atom_name]) {
            const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
            const atom_prop_name = atom_prop_id.getText();
            if (atom_prop_name === 'plural') {
                let atom_prop_value = undefined;
                const string_lits = atom_prop.getChildrenOfKind(tsm.SyntaxKind.StringLiteral);
                if (string_lits.length > 0) {
                    atom_prop_value = string_lits[0].getText();
                }
                plural_by_atom[atom_name] = atom_prop_value;
            }
        }
    }
    return plural_by_atom;
}
function _get_custom_routes() {
    const routes_by_atom = {};
    const atom_def_props = _get_book_atom_def_props('dock');
    if (!atom_def_props) {
        return routes_by_atom;
    }
    for (const atom_name in atom_def_props) {
        for (const atom_prop of atom_def_props[atom_name]) {
            const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
            const atom_prop_name = atom_prop_id.getText();
            if (atom_prop_name === 'dock') {
                const dock_syntax_list = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const dock_props = dock_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                for (const dock_prop of dock_props) {
                    const dock_prop_id = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                    const dock_prop_name = dock_prop_id.getText();
                    if (dock_prop_name === 'routes') {
                        const routes_syntax_list = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                        const routes_props = routes_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                        for (const routes_prop of routes_props) {
                            const routes_prop_id = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                            const routes_prop_name = routes_prop_id.getText(); // routes name
                            if (!routes_by_atom[atom_name]) {
                                routes_by_atom[atom_name] = {};
                            }
                            routes_by_atom[atom_name][routes_prop_name] = {};
                            const route_syntax = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                            const route_props = route_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                            for (const route_prop of route_props) { // [url, query, action, method, call]
                                const route_prop_id = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                                const route_prop_name = route_prop_id.getText();
                                if (route_prop_name === 'url') {
                                    const url_string_lit = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
                                    const url_string = url_string_lit.getText();
                                    routes_by_atom[atom_name][routes_prop_name].url = url_string.replace(/"/g, '');
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
function _get_atom_routes() {
    const full_routes_by_atom = {};
    const atom_names = _get_atom_name_from_book('atom');
    const routes_by_atom = _get_custom_routes();
    for (const atom_name of atom_names) {
        full_routes_by_atom[atom_name] = {};
        let default_route_name;
        for (default_route_name in default_routes) {
            full_routes_by_atom[atom_name][default_route_name] = default_routes[default_route_name];
            if (routes_by_atom[atom_name]) {
                for (const custom_route_name in routes_by_atom[atom_name]) {
                    full_routes_by_atom[atom_name][custom_route_name] = routes_by_atom[atom_name][custom_route_name];
                }
            }
        }
    }
    return full_routes_by_atom;
}
function _get_parameters_from_url(url) {
    const url_params = [];
    const splitted_url = url.split('/');
    for (const split_url of splitted_url) {
        if (split_url.includes(':')) {
            const splitted_split = split_url.split(':');
            if (splitted_split.length > 1) {
                url_params.push(splitted_split[1]);
            }
        }
    }
    return url_params;
}
function _generate_args(params) {
    const param_text = [];
    for (const p of params) {
        param_text.push(`${p}:string, `);
    }
    return param_text.join('');
}
function _text_args_for_url(url) {
    const params = _get_parameters_from_url(url);
    return _generate_args(params);
}
function _text_lines_in_args_params(url) {
    const lines = [];
    const url_params = _get_parameters_from_url(url);
    for (const p of url_params) {
        lines.push(`${p}: ${p},`);
    }
    return lines;
}
function _generate_text() {
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
    for (const atom_name of atom_names) {
        const plural = (typeof atom_plurals[atom_name] === 'string') ?
            atom_plurals[atom_name] : `${atom_name}s`;
        text += `\t${plural}: {\n`;
        for (const route_name in atom_routes[atom_name]) {
            const text_args = _text_args_for_url(atom_routes[atom_name][route_name].url);
            text += `\t\t${route_name}: async (${text_args}options?:uranio.types.HookArguments<'${atom_name}', '${route_name}'>) => {\n`;
            text += `\t\t\tconst args:uranio.types.HookArguments<'${atom_name}', '${route_name}'> = {\n`;
            const lines = _text_lines_in_args_params(atom_routes[atom_name][route_name].url);
            if (lines.length > 0) {
                text += `\t\t\t\tparams: {\n`;
                for (const line of lines) {
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
function _save_to_file(text) {
    const filepath = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/lib/hooks.ts`;
    fs_1.default.writeFileSync(filepath, text);
    util.pretty(filepath);
    output.done_verbose_log(`hooks`, `Created hooks file [${filepath}].`);
}
//# sourceMappingURL=hooks.js.map