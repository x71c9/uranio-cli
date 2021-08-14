"use strict";
/**
 * Transpose command module
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
const path_1 = __importDefault(require("path"));
const tsm = __importStar(require("ts-morph"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const alias = __importStar(require("./alias"));
const atom_book_required_properties = ['properties', 'security', 'connection', 'plural'];
const api_book_required_properties = ['api'];
const bll_book_required_properties = ['bll'];
const atom_book_required_client_first_props = ['properties', 'plural'];
const api_book_required_client_second_props = ['url', 'routes'];
const transpose_options = {};
exports.transpose = {
    run: (root, file, options) => __awaiter(void 0, void 0, void 0, function* () {
        defaults_1.conf.root = root;
        if (typeof file === 'string') {
            transpose_options.file = util.relative_to_absolute_path(file);
        }
        common.init_run(options);
        yield exports.transpose.command();
    }),
    command: (args) => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Transposing...');
        util.read_rc_file();
        if (args && args.file) {
            const filepath = args.file;
            if (typeof filepath === 'string' && filepath !== '') {
                transpose_options.file = util.relative_to_absolute_path(filepath);
            }
        }
        if (typeof transpose_options.file === 'string') {
            const parsed_path = path_1.default.parse(transpose_options.file);
            if (typeof parsed_path.ext === 'string' && parsed_path.ext !== '') {
                _transpose_file(transpose_options.file);
            }
            else {
                _transpose_folder(transpose_options.file);
            }
        }
        else {
            _transpose_all();
        }
    })
};
const _project_option = {
    manipulationSettings: {
        indentationText: tsm.IndentationText.Tab,
        quoteKind: tsm.QuoteKind.Single,
    }
};
function _transpose_file(file_path) {
    if (transpose_options.file === `${defaults_1.conf.root}/src/book.ts`) {
        _transpose_book();
    }
    else {
        const server_path = `${defaults_1.conf.root}/src/server/`;
        const client_path = `${defaults_1.conf.root}/src/client/`;
        if (fs_1.default.existsSync(file_path) && file_path.includes(`${defaults_1.conf.root}/src/`)) {
            if (file_path.includes(server_path) || file_path.includes(client_path)) {
                let new_path = '';
                if (file_path.includes(server_path)) {
                    new_path = file_path.replace(server_path, `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/`);
                    util.copy_file(`trsp`, file_path, new_path);
                }
                else if (file_path.includes(client_path)) {
                    new_path = file_path.replace(client_path, `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/src/`);
                    util.copy_file(`trsp`, file_path, new_path);
                }
                if (new_path !== '') {
                    alias.replace_file_aliases(new_path, alias.get_aliases());
                    _avoid_import_loop(new_path);
                    output.done_verbose_log('trsp', `Transposed file [${file_path}].`);
                }
            }
            else {
                output.error_log(`trsp`, `Invalid file path [${file_path}].`);
            }
        }
        else {
            output.error_log(`trsp`, `Invalid file path [${file_path}].`);
        }
    }
}
function _transpose_folder(dir_path) {
    fs_1.default.readdirSync(dir_path).forEach((filename) => {
        const full_path = path_1.default.resolve(dir_path, filename);
        if (fs_1.default.statSync(full_path).isDirectory() && filename !== '.git') {
            return _transpose_folder(full_path);
        }
        else {
            return _transpose_file(full_path);
        }
    });
}
function _transpose_book() {
    const tmp_book_folder = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/.tmp`;
    util.remove_folder_if_exists('tmp', tmp_book_folder);
    util.create_folder_if_doesnt_exists('tmp', tmp_book_folder);
    util.copy_file('bkp', `${defaults_1.conf.root}/src/book.ts`, `${tmp_book_folder}/book.ts`);
    _manipulate_and_create_files(`${tmp_book_folder}/book.ts`);
    _resolve_book_aliases();
    _generate_client_books();
    util.remove_folder_if_exists('tmp', tmp_book_folder);
}
function _transpose_all() {
    _transpose_book();
    _copy_from_src_into_uranio_folder();
    _resolve_aliases();
    _replace_import_to_avoid_loops();
    // output.end_log(`Transpose completed.`);
    output.done_log(`end`, `Transpose completed.`);
}
function _replace_import_to_avoid_loops() {
    const server_dir = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/`;
    if (fs_1.default.existsSync(server_dir)) {
        _traverse_ts_avoid_import_loop(server_dir);
    }
}
function _traverse_ts_resolve_aliases(directory, aliases) {
    fs_1.default.readdirSync(directory).forEach((filename) => {
        const full_path = path_1.default.resolve(directory, filename);
        if (fs_1.default.statSync(full_path).isDirectory() && filename !== '.git' && filename !== 'books') {
            return _traverse_ts_resolve_aliases(full_path, aliases);
        }
        else if (filename.split('.').pop() === 'ts') {
            alias.replace_file_aliases(full_path, aliases);
        }
    });
}
function _traverse_ts_avoid_import_loop(directory) {
    fs_1.default.readdirSync(directory).forEach((filename) => {
        const full_path = path_1.default.resolve(directory, filename);
        if (fs_1.default.statSync(full_path).isDirectory() && filename !== '.git' && filename !== 'books') {
            return _traverse_ts_avoid_import_loop(full_path);
        }
        else if (filename.split('.').pop() === 'ts') {
            _avoid_import_loop(full_path);
        }
    });
}
function _avoid_import_loop(filepath) {
    const _project = new tsm.Project(_project_option);
    const sourceFile = _project.addSourceFileAtPath(`${filepath}`);
    const import_decls = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
    let uranio_var_name = '';
    for (const import_decl of import_decls) {
        const str_lit = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
        const module_name = str_lit.getText();
        if (module_name.substr(-6) === '/lib/"') {
            const identif = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
            uranio_var_name = identif.getText();
            let uranio_bll_import_var_name = `${uranio_var_name}.core.bll.BLL`;
            let append_core = 'core/';
            if (defaults_1.conf.repo === 'core') {
                uranio_bll_import_var_name = `${uranio_var_name}.bll.BLL`;
                append_core = '';
            }
            const regex = new RegExp(`\\b${uranio_bll_import_var_name}\\b`);
            const file_text = sourceFile.getText();
            if (regex.test(file_text)) {
                //eslint-disable-next-line no-useless-escape
                // const new_bll_import_var_name = `${uranio_bll_import_var_name.replace(/\./g,'_')}`;
                const new_bll_module_name = module_name.substr(1, module_name.length - 2) + `${append_core}bll/bll`;
                const old_uranio_import = import_decl.getText();
                import_decl.replaceWithText(`${old_uranio_import}\nimport {BLL} from "${new_bll_module_name}";`);
                const prop_access_exps = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression);
                const prop_to_change = [];
                for (const prop_access_exp of prop_access_exps) {
                    const prop_text = prop_access_exp.getText();
                    if (prop_text === `${uranio_bll_import_var_name}`) {
                        prop_to_change.push(prop_access_exp);
                    }
                }
                for (const prop of prop_to_change) {
                    prop.replaceWithText(`BLL`);
                }
                _project.save();
            }
            break;
        }
    }
    return sourceFile;
}
function _copy_from_src_into_uranio_folder() {
    if (fs_1.default.existsSync(`${defaults_1.conf.root}/src/server/`)) {
        util.copy_files('copy', `${defaults_1.conf.root}/src/server/*`, `${defaults_1.conf.root}/.uranio/server/`);
    }
    if (fs_1.default.existsSync(`${defaults_1.conf.root}/src/client/`)) {
        util.copy_files('copy', `${defaults_1.conf.root}/src/client/*`, `${defaults_1.conf.root}/.uranio/client/src/`);
    }
}
function _manipulate_and_create_files(filepath) {
    const action = `manipulating [src/book.ts]`;
    output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
    output.verbose_log(`mnpl`, `Started ${action}.`);
    // let sourceFile = _project.addSourceFileAtPath(`${conf.root}/src/book.ts`);
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
    sourceFile = _replace_comments(sourceFile);
    sourceFile = _change_realtive_imports(sourceFile);
    const import_statements = _copy_imports(sourceFile);
    _create_bll_book(sourceFile, import_statements);
    _create_api_book(sourceFile, import_statements);
    _create_atom_book(sourceFile, import_statements);
    // sourceFile = _manipulate_atom_book(sourceFile);
    // const modified = sourceFile.print();
    // _create_manipulated_file(modified);
    // _pretty_books();
    // _type_check_books();
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
function _create_a_book(sourceFile, import_statements, book_name, keep_properties, required_book_name) {
    output.start_loading(`Creating ${book_name}_book...`);
    const book_state = _find_atom_book_statement(sourceFile);
    if (book_state) {
        const atom_book_state_text = book_state.getText();
        const _project = new tsm.Project(_project_option);
        const cloned_book_source = _project.createSourceFile(`${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/books/${book_name}.ts`, atom_book_state_text, { overwrite: true });
        let cloned_book_decl = cloned_book_source
            .getFirstDescendantByKind(tsm.ts.SyntaxKind.VariableDeclaration);
        if (cloned_book_decl) {
            cloned_book_decl = _remove_type_reference(cloned_book_decl);
            cloned_book_decl = _rename_book(book_name, cloned_book_decl);
            cloned_book_decl = _clean_all_but(keep_properties, cloned_book_decl);
            cloned_book_decl = _append_requried_book(cloned_book_decl, required_book_name);
            cloned_book_decl = _add_as_const(cloned_book_decl);
        }
        // const last = sourceFile.getLastChildByKind(tsm.ts.SyntaxKind.VariableStatement);
        // if(last){
        //   last.replaceWithText(last.getText() + cloned_book_source.getText());
        // }
        const required_imports = _get_required_imports(import_statements, cloned_book_source.getText());
        const filepath = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/books/${book_name}.ts`;
        const text = required_imports.join('\n') + cloned_book_source.getText();
        _create_a_book_file(filepath, text);
    }
    output.done_log(book_name, `Generated server book [${book_name}].`);
    return sourceFile;
}
function _get_required_imports(import_statements, text) {
    const required_import_statements = [];
    const str_project = new tsm.Project({
        tsConfigFilePath: `${defaults_1.conf.root}/tsconfig.json`,
        skipFileDependencyResolution: true
    });
    for (let i = 0; i < import_statements.length; i++) {
        const imp_state = import_statements[i];
        const str_source_file = str_project.createSourceFile(`file${i}.ts`, imp_state);
        const import_decls = str_source_file.getDescendantsOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
        for (const decl of import_decls) {
            const identifiers = decl.getDescendantsOfKind(tsm.ts.SyntaxKind.Identifier);
            for (const idf of identifiers) {
                const idf_text = idf.getText();
                const regex = new RegExp(`\\b${idf_text}\\b`);
                if (regex.test(text)) {
                    required_import_statements.push(decl.getText());
                }
            }
        }
    }
    return required_import_statements;
}
function _create_atom_book(sourceFile, import_statements) {
    return _create_a_book(sourceFile, import_statements, 'atom', atom_book_required_properties, 'atom');
}
function _create_api_book(sourceFile, import_statements) {
    return _create_a_book(sourceFile, import_statements, 'api', api_book_required_properties, 'api');
}
function _create_bll_book(sourceFile, import_statements) {
    return _create_a_book(sourceFile, import_statements, 'bll', bll_book_required_properties, 'bll');
}
function _clean_all_but(but, var_decl) {
    output.start_loading(`Cleaning all properties but [${but}]...`);
    const book_expr = var_decl.getFirstChildByKind(tsm.ts.SyntaxKind.ObjectLiteralExpression);
    if (book_expr) {
        const atom_names = book_expr.getChildrenOfKind(tsm.ts.SyntaxKind.PropertyAssignment);
        for (const atom_name of atom_names) {
            const atom_def = atom_name.getFirstChildByKind(tsm.ts.SyntaxKind.ObjectLiteralExpression);
            if (atom_def) {
                const atom_def_props = atom_def.getChildrenOfKind(tsm.ts.SyntaxKind.PropertyAssignment);
                for (const atom_def_prop of atom_def_props) {
                    if (!but.includes(atom_def_prop.getName())) {
                        atom_def_prop.remove();
                    }
                }
            }
        }
    }
    output.done_verbose_log('props', `Removed all properties but [${but}].`);
    return var_decl;
}
function _rename_book(book_name, var_decl) {
    const identifier = var_decl.getFirstChildByKind(tsm.ts.SyntaxKind.Identifier);
    if (identifier) {
        identifier.replaceWithText(`${book_name}_book`);
    }
    return var_decl;
}
function _get_variable_content(source, variable_name) {
    const states = source.getChildrenOfKind(tsm.ts.SyntaxKind.VariableStatement);
    for (const state of states) {
        const var_decl = state.getFirstDescendantByKind(tsm.ts.SyntaxKind.VariableDeclaration);
        if (var_decl) {
            if (var_decl.getName() === variable_name) {
                const syntax_list = var_decl.getFirstDescendantByKind(tsm.ts.SyntaxKind.SyntaxList);
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
    const _project = new tsm.Project(_project_option);
    const core_books_source = _project.createSourceFile(`${defaults_1.conf.root}/${defaults_1.defaults.folder}/cloned_${required_book_name}.ts`, book_content, { overwrite: true });
    let core_var_content = _get_variable_content(core_books_source, required_book_name);
    const syntax_list = book_decl.getFirstDescendantByKind(tsm.ts.SyntaxKind.SyntaxList);
    if (syntax_list) {
        if (core_var_content[core_var_content.length - 1] !== ',') {
            core_var_content += ',';
        }
        syntax_list.replaceWithText(core_var_content + syntax_list.getText());
    }
}
function _add_core_books(book_decl, required_book_name) {
    let core_repo_path = `${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`;
    switch (defaults_1.conf.repo) {
        case 'core': {
            break;
        }
        case 'api': {
            core_repo_path = `${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}/core`;
            break;
        }
    }
    const required_books_path = `${defaults_1.conf.root}/${core_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_api_book(book_decl, required_book_name) {
    const api_repo_path = `${defaults_1.defaults.folder}/${defaults_1.defaults.repo_folder}`;
    const required_books_path = `${defaults_1.conf.root}/${api_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _append_requried_book(book_decl, required_book_name) {
    output.start_loading(`Adding required books...`);
    switch (defaults_1.conf.repo) {
        case 'api': {
            _add_api_book(book_decl, required_book_name);
            break;
        }
    }
    _add_core_books(book_decl, required_book_name);
    output.done_verbose_log(`requ`, `Added required books.`);
    return book_decl;
}
function _change_realtive_imports(sourceFile) {
    output.start_loading(`Changing relative imports...`);
    const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
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
    const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
    if (str_lit) {
        const text = str_lit.getText();
        if (text.includes('./')) {
            const replace = text.replace('./', '../../');
            str_lit.replaceWithText(replace);
            output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
        }
    }
    return node;
}
function _remove_type_reference(book_decl) {
    output.start_loading(`Removing type reference...`);
    const type_ref = book_decl.getFirstChildByKind(tsm.ts.SyntaxKind.TypeReference);
    if (type_ref) {
        book_decl.removeType();
    }
    output.done_verbose_log('type', `Type reference removed.`);
    return book_decl;
}
function _find_atom_book_statement(sourceFile) {
    output.start_loading(`Looking for atom_book statement...`);
    const var_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.VariableStatement);
    for (const state of var_states) {
        const var_decl_list = state.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclarationList);
        if (var_decl_list) {
            const var_decl = var_decl_list.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclaration);
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
function _create_a_book_file(filepath, text) {
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
    fs_1.default.writeFileSync(filepath, content);
    util.pretty(filepath);
    output.done_verbose_log(`book`, `Created book file [${filepath}].`);
}
function _copy_imports(sourceFile) {
    output.start_loading(`Copying import statements...`);
    const import_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
    const states = [];
    for (const state of import_states) {
        states.push(state.getText());
    }
    output.verbose_log('book', `Copied import statements.`);
    return states;
}
function _resolve_aliases() {
    output.start_loading(`Replacing aliases with relative paths...`);
    const aliases = alias.get_aliases();
    const server_dir = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/`;
    _traverse_ts_resolve_aliases(server_dir, aliases);
    const client_dir = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/`;
    _traverse_ts_resolve_aliases(client_dir, aliases);
    output.done_log('alias', `Aliases replaced.`);
}
function _resolve_book_aliases() {
    output.start_loading(`Replacing book aliases...`);
    const books_dir = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/books`;
    const aliases = alias.get_aliases();
    alias.replace_file_aliases(`${books_dir}/atom.ts`, aliases);
    alias.replace_file_aliases(`${books_dir}/api.ts`, aliases);
    alias.replace_file_aliases(`${books_dir}/bll.ts`, aliases);
    output.done_log('alias', `Server books aliases replaced.`);
}
function _generate_client_books() {
    output.start_loading(`Generating client books...`);
    _generate_client_book('api', api_book_required_client_second_props);
    _generate_client_book('atom', atom_book_required_client_first_props);
    // output.done_log('client', `Client books generated.`);
}
function _remove_api_route_call_implementation(sourceFile) {
    const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_stat of variable_stats) {
        const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
        const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        if (identifier.getText() === `api_book`) {
            const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            for (const atom_def of atom_defs) {
                const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const api_key_list = atom_syntax_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const api_keys = api_key_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                const atom_id = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                const atom_name = atom_id.getText();
                for (const api_key of api_keys) {
                    const key_name_identifier = api_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                    const key_name = key_name_identifier.getText();
                    if (key_name === 'routes') {
                        const routes_syntax = api_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                        const routes_props = routes_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                        for (const route of routes_props) {
                            const route_syntax = route.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                            const route_props = route_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                            for (const prop of route_props) {
                                const comma = prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
                                const prop_id = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                                const prop_id_name = prop_id.getText();
                                if (prop_id_name === 'call') {
                                    if (comma) {
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
    output.done_log('clnt', `Removed call implementation in api book.`);
    return sourceFile;
}
function _generate_client_book(book_name, required_props) {
    const folder_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}`;
    const server_books_dir = `${folder_path}/server/books`;
    const client_books_dir = `${folder_path}/client/books`;
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${server_books_dir}/${book_name}.ts`);
    sourceFile = _replace_uranio_client_dependecy(sourceFile);
    if (book_name === 'atom') {
        sourceFile = _keep_only_client_first_level_properties(sourceFile, book_name, required_props);
    }
    else {
        sourceFile = _keep_only_client_second_level_properties(sourceFile, book_name, required_props);
    }
    if (book_name === 'api') {
        sourceFile = _remove_api_route_call_implementation(sourceFile);
    }
    const filepath = `${client_books_dir}/${book_name}.ts`;
    fs_1.default.writeFileSync(filepath, sourceFile.print());
    util.pretty(filepath);
    output.done_log('clnt', `Generated client book [${book_name}].`);
}
function _replace_uranio_client_dependecy(sourceFile) {
    const imports = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
    for (const decl of imports) {
        const str_lit = decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
        const str_text = str_lit.getText();
        if (str_text.substr(-7) === './lib/"') {
            const replace_with = `${str_text.substr(0, str_text.length - 1)}client"`;
            str_lit.replaceWithText(replace_with);
            output.verbose_log('clnt', `Replaced [${str_text}] to [${replace_with}]`);
        }
    }
    return sourceFile;
}
function _keep_only_client_first_level_properties(sourceFile, book_name, required_props) {
    const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_stat of variable_stats) {
        const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
        const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        if (identifier.getText() === `${book_name}_book`) {
            const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            for (const atom_def of atom_defs) {
                const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const atom_props = atom_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                const atom_name_identif = atom_def.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
                const atom_name = atom_name_identif.getText();
                for (const prop of atom_props) {
                    const comma = prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
                    const identif = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
                    const ide_text = identif.getText();
                    if (!required_props.includes(ide_text)) {
                        if (comma) {
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
function _keep_only_client_second_level_properties(sourceFile, book_name, required_props) {
    const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_stat of variable_stats) {
        const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
        const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        if (identifier.getText() === `${book_name}_book`) {
            const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            for (const atom_def of atom_defs) {
                const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const atom_props = atom_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                const atom_name_identif = atom_def.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
                const atom_name = atom_name_identif.getText();
                for (const prop of atom_props) {
                    const second_syntax_list = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                    const second_prop_list = second_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                    for (const sec_prop of second_prop_list) {
                        const comma = sec_prop.getNextSiblingIfKind(tsm.SyntaxKind.CommaToken);
                        const identif = sec_prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
                        const ide_text = identif.getText();
                        if (!required_props.includes(identif.getText())) {
                            if (comma) {
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
//# sourceMappingURL=transpose.js.map