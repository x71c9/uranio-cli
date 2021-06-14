"use strict";
/**
 * Init command module
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpose = void 0;
const fs_1 = __importDefault(require("fs"));
const ts_morph_1 = require("ts-morph");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../log/"));
const util = __importStar(require("../util/"));
exports.transpose = {
    run: () => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Transposing...');
        util.read_rc_file();
        const modified = _manipulate_file();
        _copy_manipulated_file(modified);
        _pretty_books();
        output.end_log(`Transpose completed.`);
    })
};
const _project = new ts_morph_1.Project({
    manipulationSettings: {
        indentationText: ts_morph_1.IndentationText.Tab,
        quoteKind: ts_morph_1.QuoteKind.Single,
    }
});
function _pretty_books() {
    util.pretty(`${defaults_1.defaults.folder}/books.ts`);
}
function _manipulate_file() {
    const action = `manipulating [src/book.ts]`;
    output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
    output.verbose_log(`mnpl`, `Started ${action}.`);
    let sourceFile = _project.addSourceFileAtPath(`src/book.ts`);
    sourceFile = _replace_comments(sourceFile);
    sourceFile = _change_realtive_imports(sourceFile);
    sourceFile = _create_bll_book(sourceFile);
    sourceFile = _create_api_book(sourceFile);
    sourceFile = _manipulate_atom_book(sourceFile);
    return sourceFile.print();
}
function _replace_comments(sourceFile) {
    const node = sourceFile.getFirstChild();
    if (node) {
        const comments = node.getLeadingCommentRanges();
        if (comments.length > 0) {
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
function _manipulate_atom_book(sourceFile) {
    output.start_loading(`Manipulating atom_book...`);
    let book_decl = _find_atom_book_declaration(sourceFile);
    if (book_decl) {
        book_decl = _remove_type_reference(book_decl);
        book_decl = _clean_prop('bll', book_decl);
        book_decl = _clean_prop('api', book_decl);
        book_decl = _append_requried_book(book_decl, 'atom');
        book_decl = _add_as_const(book_decl);
    }
    output.done_log('mnpl', 'Done manipulating atom_book.');
    return sourceFile;
}
function _create_a_book(sourceFile, book_name, keep_property, required_book_name) {
    output.start_loading(`Creating ${book_name}_book...`);
    const book_state = _find_atom_book_statement(sourceFile);
    if (book_state) {
        const atom_book_state_text = book_state.getText();
        const cloned_book_source = _project.createSourceFile(`./${defaults_1.defaults.folder}/${book_name}_book.ts`, atom_book_state_text, { overwrite: true });
        let cloned_book_decl = cloned_book_source
            .getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.VariableDeclaration);
        if (cloned_book_decl) {
            cloned_book_decl = _remove_type_reference(cloned_book_decl);
            cloned_book_decl = _rename_book(book_name, cloned_book_decl);
            cloned_book_decl = _clean_all_but(keep_property, cloned_book_decl);
            cloned_book_decl = _append_requried_book(cloned_book_decl, required_book_name);
            cloned_book_decl = _add_as_const(cloned_book_decl);
        }
        const last = sourceFile.getLastChildByKind(ts_morph_1.ts.SyntaxKind.VariableStatement);
        if (last) {
            last.replaceWithText(last.getText() + cloned_book_source.getText());
        }
    }
    output.done_log(book_name, `Created ${book_name}_book.`);
    return sourceFile;
}
function _create_api_book(sourceFile) {
    return _create_a_book(sourceFile, 'api', 'api', 'api');
}
function _create_bll_book(sourceFile) {
    return _create_a_book(sourceFile, 'bll', 'bll', 'bll');
}
function _clean_all_but(but, var_decl) {
    output.start_loading(`Cleaning all properties but [${but}]...`);
    const book_expr = var_decl.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.ObjectLiteralExpression);
    if (book_expr) {
        const atom_names = book_expr.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.PropertyAssignment);
        for (const atom_name of atom_names) {
            const atom_def = atom_name.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.ObjectLiteralExpression);
            if (atom_def) {
                const atom_def_props = atom_def.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.PropertyAssignment);
                for (const atom_def_prop of atom_def_props) {
                    if (atom_def_prop.getName() !== but) {
                        atom_def_prop.remove();
                    }
                }
            }
        }
    }
    output.done_verbose_log('props', `Removed all properties but [${but}].`);
    return var_decl;
}
function _clean_prop(prop, var_decl) {
    output.start_loading(`Cleaning property [${prop}]...`);
    const book_expr = var_decl.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.ObjectLiteralExpression);
    if (book_expr) {
        const atom_names = book_expr.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.PropertyAssignment);
        for (const atom_name of atom_names) {
            const atom_def = atom_name.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.ObjectLiteralExpression);
            if (atom_def) {
                const atom_def_props = atom_def.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.PropertyAssignment);
                for (const atom_def_prop of atom_def_props) {
                    if (atom_def_prop.getName() === prop) {
                        atom_def_prop.remove();
                    }
                }
            }
        }
    }
    output.done_verbose_log('prop', `Removed property [${prop}].`);
    return var_decl;
}
function _rename_book(book_name, var_decl) {
    const identifier = var_decl.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.Identifier);
    if (identifier) {
        identifier.replaceWithText(`${book_name}_book`);
    }
    return var_decl;
}
function _get_variable_content(source, variable_name) {
    const states = source.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.VariableStatement);
    for (const state of states) {
        const var_decl = state.getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.VariableDeclaration);
        if (var_decl) {
            if (var_decl.getName() === variable_name) {
                const syntax_list = var_decl.getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.SyntaxList);
                if (syntax_list) {
                    return syntax_list.getText();
                }
            }
        }
    }
    return '';
}
function _add_book_from_file(book_decl, required_book_name, books_file_path) {
    const book_content = fs_1.default.readFileSync(books_file_path, 'utf8');
    const core_books_source = _project.createSourceFile(`./${defaults_1.defaults.folder}/cloned_${required_book_name}.ts`, book_content, { overwrite: true });
    const core_var_content = _get_variable_content(core_books_source, required_book_name);
    const syntax_list = book_decl.getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.SyntaxList);
    if (syntax_list) {
        syntax_list.replaceWithText(core_var_content + syntax_list.getText());
    }
}
function _add_core_books(book_decl, required_book_name) {
    let core_repo_path = `./${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`;
    switch (global.uranio.repo) {
        case 'core': {
            break;
        }
        case 'ntl':
        case 'web': {
            core_repo_path = `./${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}/core`;
            break;
        }
    }
    const required_books_path = `${core_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_web_books(book_decl, required_book_name) {
    const web_repo_path = `./${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`;
    const required_books_path = `${web_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_ntl_books(book_decl, required_book_name) {
    const ntl_repo_path = `./${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`;
    const required_books_path = `${ntl_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _append_requried_book(book_decl, required_book_name) {
    output.start_loading(`Adding required books...`);
    switch (global.uranio.repo) {
        case 'web': {
            _add_web_books(book_decl, required_book_name);
            break;
        }
        case 'ntl': {
            _add_ntl_books(book_decl, required_book_name);
        }
    }
    _add_core_books(book_decl, required_book_name);
    output.done_verbose_log(`requ`, `Added required books.`);
    return book_decl;
}
function _change_realtive_imports(sourceFile) {
    output.start_loading(`Changing relative imports...`);
    const import_decls = sourceFile.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.ImportDeclaration);
    for (const import_decl of import_decls) {
        _change_realtive_import(import_decl);
    }
    output.done_log('impr', 'Changed relative imports.');
    return sourceFile;
}
function _add_as_const(book_decl) {
    output.start_loading(`Adding as const...`);
    book_decl.replaceWithText(book_decl.getText() + ' as const');
    output.done_verbose_log(`asco`, `Added as const.`);
    return book_decl;
}
function _change_realtive_import(node) {
    output.start_loading(`Changing relative imports...`);
    const str_lit = node.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.StringLiteral);
    if (str_lit) {
        const text = str_lit.getText();
        if (text.includes('./')) {
            const replace = text.replace('./', '../src/');
            str_lit.replaceWithText(replace);
            output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
        }
    }
    return node;
}
function _copy_manipulated_file(text) {
    output.start_loading(`Writing manipulated book...`);
    fs_1.default.writeFileSync(`${defaults_1.defaults.folder}/books.ts`, text);
    output.done_log(`trns`, `Manipulated books copied to [${defaults_1.defaults.folder}/books.ts].`);
}
function _remove_type_reference(book_decl) {
    output.start_loading(`Removing type reference...`);
    const type_ref = book_decl.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.TypeReference);
    if (type_ref) {
        book_decl.removeType();
    }
    output.done_verbose_log('type', `Type reference removed.`);
    return book_decl;
}
function _find_atom_book_declaration(sourceFile) {
    output.start_loading(`Looking for atom_book declaration...`);
    const var_states = sourceFile.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.VariableStatement);
    for (const state of var_states) {
        const var_decl_list = state.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.VariableDeclarationList);
        if (var_decl_list) {
            const var_decl = var_decl_list.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.VariableDeclaration);
            if (var_decl) {
                const name = var_decl.getName();
                if (name === 'atom_book') {
                    output.verbose_log(`book`, `Declaration of atom_book found.`);
                    return var_decl;
                }
            }
        }
    }
    output.verbose_log('book', `Cannot find atom_book`);
    return undefined;
}
function _find_atom_book_statement(sourceFile) {
    output.start_loading(`Looking for atom_book statement...`);
    const var_states = sourceFile.getChildrenOfKind(ts_morph_1.ts.SyntaxKind.VariableStatement);
    for (const state of var_states) {
        const var_decl_list = state.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.VariableDeclarationList);
        if (var_decl_list) {
            const var_decl = var_decl_list.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.VariableDeclaration);
            if (var_decl) {
                const name = var_decl.getName();
                if (name === 'atom_book') {
                    output.verbose_log(`book`, `Statement of atom_book found.`);
                    return state;
                }
            }
        }
    }
    output.verbose_log('book', `Cannot find atom_book`);
    return undefined;
}
//# sourceMappingURL=transpose.js.map