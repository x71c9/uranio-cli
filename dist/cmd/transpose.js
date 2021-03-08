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
    run: (args) => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Transposing...');
        util.check_if_initialized();
        let src_path = args.s || args['src-path'] || defaults_1.defaults.book_src_path;
        src_path = _relative_to_absolute_path(src_path);
        let dest_path = args.d || args['dest-path'] || defaults_1.defaults.book_dest_path;
        dest_path = _relative_to_absolute_path(dest_path);
        const modified = _manipulate_file(src_path);
        _copy_modified_file_to_dest(dest_path, modified);
        _prettier_books(dest_path);
        output.end_log(`Transpose completed.`);
    })
};
const _project = new ts_morph_1.Project({
    manipulationSettings: {
        indentationText: ts_morph_1.IndentationText.Tab,
        quoteKind: ts_morph_1.QuoteKind.Single,
    }
});
function _relative_to_absolute_path(path) {
    if (path[0] !== '/') {
        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }
        path = `${global.uranio.root}/${path}`;
    }
    return path;
}
function _prettier_books(dest_path) {
    util.prettier(dest_path);
}
function _manipulate_file(src_path) {
    const action = `manipulating [${src_path}]`;
    output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
    output.verbose_log(`mnpl`, `Started ${action}.`);
    let sourceFile = _project.addSourceFileAtPath(src_path);
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
        // book_decl = _append_requried_book(book_decl, 'uranio.types.required_books.atom');
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
        const cloned_book_source = _project.createSourceFile(`${global.uranio.root}/${defaults_1.defaults.folder}/${book_name}_book.ts`, atom_book_state_text, { overwrite: true });
        let cloned_book_decl = cloned_book_source.getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.VariableDeclaration);
        if (cloned_book_decl) {
            cloned_book_decl = _remove_type_reference(cloned_book_decl);
            cloned_book_decl = _rename_book(book_name, cloned_book_decl);
            cloned_book_decl = _clean_all_but(keep_property, cloned_book_decl);
            // cloned_book_decl = _append_requried_book(cloned_book_decl, `uranio.types.required_books.${required_book_name}`);
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
    const core_books_source = _project.createSourceFile(`${global.uranio.root}/${defaults_1.defaults.folder}/cloned_${required_book_name}.ts`, book_content, { overwrite: true });
    const core_var_content = _get_variable_content(core_books_source, required_book_name);
    const syntax_list = book_decl.getFirstDescendantByKind(ts_morph_1.ts.SyntaxKind.SyntaxList);
    if (syntax_list) {
        syntax_list.replaceWithText(core_var_content + syntax_list.getText());
    }
}
function _add_core_books(book_decl, required_book_name) {
    let core_repo_path = `${global.uranio.root}/${defaults_1.defaults.folder}/core/`;
    if (global.uranio.repo === 'web') {
        core_repo_path = `${global.uranio.root}/${defaults_1.defaults.folder}/web/core`;
    }
    const books_path = `${core_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, books_path);
}
function _add_web_books(book_decl, required_book_name) {
    const web_repo_path = `${global.uranio.root}/${defaults_1.defaults.folder}/web/`;
    const books_path = `${web_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, books_path);
}
function _append_requried_book(book_decl, required_book_name) {
    output.start_loading(`Adding required books...`);
    _add_core_books(book_decl, required_book_name);
    if (global.uranio.repo === 'web') {
        _add_web_books(book_decl, required_book_name);
    }
    output.done_verbose_log(`requ`, `Added required books.`);
    return book_decl;
}
// function _append_requried_book(book_decl:VariableDeclaration, book_string:string)
//     :VariableDeclaration{
//   output.start_loading(`Adding required_book...`);
//   const obj_lit = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(obj_lit){
//     const text = obj_lit.getText();
//     obj_lit.replaceWithText(`{...${book_string},\n` + text.slice(1,text.length));
//   }
//   output.done_verbose_log(`requ`, `Added required_book.`);
//   return book_decl;
// }
// function _append_requried_atoms(book_decl:VariableDeclaration)
//     :VariableDeclaration{
//   output.start_loading(`Adding required_book...`);
//   const obj_lit = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(obj_lit){
//     const text = obj_lit.getText();
//     obj_lit.replaceWithText(`{...uranio.types.required_book,\n` + text.slice(1,text.length));
//   }
//   output.done_log(`requ`, `Added required_book.`);
//   return book_decl;
// }
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
    // output.done_log('impo', `Changed relative import.`);
    return node;
}
function _copy_modified_file_to_dest(dest, text) {
    output.start_loading(`Writing manipulated book...`);
    fs_1.default.writeFileSync(dest, text);
    output.done_log(`trns`, `Manipulated books copied to [${dest}].`);
}
// function _remove_bll_prop(book_decl:VariableDeclaration){
//   output.start_loading(`Removing bll props...`);
//   output.verbose_log(`bll`, `Look for bll property assignments.`);
//   const book_expr = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(book_expr){
//     const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//     for(const atom_name of atom_names){
//       const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//       if(atom_def){
//         const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//         for(const atom_def_prop of atom_def_props){
//           if(atom_def_prop.getName() === 'bll'){
//             // _remove_bll_import(atom_def_prop);
//             atom_def_prop.remove();
//             output.verbose_log(`bll_`, `Removed bll for [${atom_name.getName()}].`);
//           }
//         }
//       }
//     }
//   }
//   output.done_log('blls', `Removed blls.`);
//   return book_decl;
// }
// function _remove_bll_prop_and_imports(book_decl:VariableDeclaration){
//   output.start_loading(`Removing bll prop and imports...`);
//   output.verbose_log(`bll_`, `Look for bll property assignments.`);
//   const book_expr = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(book_expr){
//     const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//     for(const atom_name of atom_names){
//       const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//       if(atom_def){
//         const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//         for(const atom_def_prop of atom_def_props){
//           if(atom_def_prop.getName() === 'bll'){
//             _remove_bll_import(atom_def_prop);
//             atom_def_prop.remove();
//             output.verbose_log(`bll_`, `Removed bll for [${atom_name.getName()}].`);
//           }
//         }
//       }
//     }
//   }
//   output.done_log('blls', `Removed blls.`);
//   return book_decl;
// }
function _remove_type_reference(book_decl) {
    output.start_loading(`Removing type reference...`);
    // output.verbose_log(`type`, `Look for type reference.`);
    const type_ref = book_decl.getFirstChildByKind(ts_morph_1.ts.SyntaxKind.TypeReference);
    if (type_ref) {
        book_decl.removeType();
    }
    output.done_verbose_log('type', `Type reference removed.`);
    return book_decl;
}
function _find_atom_book_declaration(sourceFile) {
    output.start_loading(`Looking for atom_book declaration...`);
    // output.verbose_log(`book`, `Look for atom_book declaration.`);
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
    // output.verbose_log(`book`, `Look for atom_book statement.`);
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
// function _get_object_literal(var_decl:VariableDeclaration)
//     :ObjectLiteralExpression | undefined {
//   return var_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
// }
// function _find_atom_book_declaration(node:Node){
//   output.start_loading(`Looking for atom_book declaration...`);
//   output.verbose_log(`book`, `Look for atom_book declaration.`);
//   const var_decl_list = node.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
//   if(var_decl_list){
//     const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
//     if(var_decl){
//       const name = var_decl.getName();
//       if(name === 'atom_book'){
//         output.done_log(`book`, `Declaration of atom_book found.`);
//         return var_decl;
//       }
//     }
//   }
//   output.done_log('book', `Cannot find atom_book`);
//   return undefined;
// }
//# sourceMappingURL=transpose.js.map