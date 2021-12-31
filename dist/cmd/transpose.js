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
exports.transpose_one = exports.transpose = void 0;
const path_1 = __importDefault(require("path"));
const tsm = __importStar(require("ts-morph"));
const urn_lib_1 = require("urn-lib");
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const alias = __importStar(require("./alias"));
const common_1 = require("./common");
const atom_book_required_properties = ['properties', 'plural', 'connection', 'security'];
const dock_book_required_properties = ['dock', 'plural'];
const bll_book_required_properties = ['bll'];
const atom_book_required_client_first_props = ['properties', 'plural', 'connection', 'authenticate'];
const dock_book_required_client_second_props = ['url', 'routes', 'auth_url'];
const submodules = ['core', 'api', 'trx'];
let output_instance;
let util_instance;
let transpose_params = defaults_1.default_params;
const _project_option = {
    manipulationSettings: {
        indentationText: tsm.IndentationText.Tab,
        quoteKind: tsm.QuoteKind.Single,
    }
};
function transpose(params, included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_tranpose(params);
        _transpose_all(included);
    });
}
exports.transpose = transpose;
function transpose_one(full_path, params, included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_tranpose(params);
        if (typeof full_path !== 'string' || full_path === '') {
            output_instance.error_log('Invalid path.', 'trsp');
            process.exit(1);
        }
        if (util_instance.fs.is_directory(full_path)) {
            _transpose_folder(full_path, included);
        }
        else {
            _transpose_file(full_path, included);
        }
    });
}
exports.transpose_one = transpose_one;
function _init_tranpose(params) {
    transpose_params = common_1.merge_params(params);
    output_instance = output.create(transpose_params);
    util_instance = util.create(transpose_params, output_instance);
    util_instance.must_be_initialized();
}
function _transpose_all(included = false) {
    // _copy_from_src_into_uranio_folder();
    // _transpose_book();
    // _resolve_aliases();
    // _replace_import_to_avoid_loops();
    _transpose_folder(path_1.default.join(transpose_params.root, 'src'), true);
    if (included) {
        output_instance.done_log(`Transpose completed.`);
    }
    else {
        output_instance.end_log(`Transpose completed.`);
    }
}
function _transpose_file(file_path, included = false) {
    const basename = path_1.default.basename(file_path);
    const extension = path_1.default.extname(basename);
    if (basename.match(/^\.git/) !== null) {
        return;
    }
    const not_valid_extensions = ['.swp', '.swo'];
    if (not_valid_extensions.includes(extension)) {
        return;
    }
    const dot_book_dir = `${transpose_params.root}/src/books`;
    if (transpose_params.is_dot && file_path.includes(dot_book_dir)) {
        return false;
    }
    if (file_path === `${transpose_params.root}/src/book.ts`) {
        _transpose_book();
        if (!included) {
            output_instance.done_log(`Transpose book completed.`);
        }
        return;
    }
    const src_path = `${transpose_params.root}/src/`;
    if (file_path &&
        util_instance.fs.exists(file_path) &&
        file_path.includes(src_path)) {
        const base_folder = `${transpose_params.root}/${defaults_1.defaults.folder}`;
        const frontend_src_path = `${transpose_params.root}/src/frontend`;
        const uranio_src_path = `${transpose_params.root}/src/uranio`;
        if (file_path.includes(uranio_src_path)) {
            const uranio_server_target = file_path.replace(uranio_src_path, path_1.default.join(base_folder, 'server/src', defaults_1.defaults.repo_folder));
            util_instance.fs.copy_file(file_path, uranio_server_target, 'trsp');
            if (path_1.default.extname(file_path) === '.ts') {
                alias.replace_file_aliases(uranio_server_target, alias.get_aliases(`${base_folder}/server/tsconfig.json`, transpose_params));
                _avoid_import_loop(uranio_server_target);
                output_instance.done_verbose_log(`Transposed uranio server file [${file_path}] [${uranio_server_target}].`, 'trsp');
            }
            const uranio_client_target = file_path.replace(uranio_src_path, path_1.default.join(base_folder, 'client/src', defaults_1.defaults.repo_folder));
            util_instance.fs.copy_file(file_path, uranio_client_target, 'trsp');
            if (path_1.default.extname(file_path) === '.ts') {
                alias.replace_file_aliases(uranio_client_target, alias.get_aliases(`${base_folder}/client/tsconfig.json`, transpose_params));
                _avoid_import_loop(uranio_client_target);
                output_instance.done_verbose_log(`Transposed uranio client file [${file_path}] [${uranio_client_target}].`, 'trsp');
            }
        }
        else if (types_1.valid_admin_repos().includes(transpose_params.repo)
            && file_path.includes(frontend_src_path)) {
            const frontend_target = file_path.replace(frontend_src_path, path_1.default.join(base_folder, 'client/src', defaults_1.defaults.repo_folder, 'nuxt'));
            util_instance.fs.copy_file(file_path, frontend_target, 'trsp');
            if (path_1.default.extname(file_path) === '.ts') {
                alias.replace_file_aliases(frontend_target, alias.get_aliases(`${base_folder}/client/tsconfig.json`, transpose_params));
                _avoid_import_loop(frontend_target);
                output_instance.done_verbose_log(`Transposed frontend file [${file_path}] [${frontend_target}].`, 'trsp');
            }
        }
        else if (types_1.valid_client_repos().includes(transpose_params.repo)
            && file_path.includes(frontend_src_path)) {
            const frontend_target = file_path.replace(frontend_src_path, path_1.default.join(base_folder, 'client/src', defaults_1.defaults.repo_folder));
            util_instance.fs.copy_file(file_path, frontend_target, 'trsp');
            if (path_1.default.extname(file_path) === '.ts') {
                alias.replace_file_aliases(frontend_target, alias.get_aliases(`${base_folder}/client/tsconfig.json`, transpose_params));
                _avoid_import_loop(frontend_target);
                output_instance.done_verbose_log(`Transposed frontend file [${file_path}] [${frontend_target}].`, 'trsp');
            }
        }
        else {
            const new_path_server = file_path.replace(src_path, `${base_folder}/server/src/`);
            const new_path_client = file_path.replace(src_path, `${base_folder}/client/src/`);
            util_instance.fs.copy_file(file_path, new_path_server, 'trsp');
            util_instance.fs.copy_file(file_path, new_path_client, 'trsp');
            if (path_1.default.extname(file_path) === '.ts') {
                alias.replace_file_aliases(new_path_server, alias.get_aliases(`${base_folder}/server/tsconfig.json`, transpose_params));
                alias.replace_file_aliases(new_path_client, alias.get_aliases(`${base_folder}/client/tsconfig.json`, transpose_params));
                _avoid_import_loop(new_path_server);
                _avoid_import_loop(new_path_client);
                output_instance.done_verbose_log(`Transposed file [${file_path}].`, 'trsp');
            }
        }
    }
    else {
        let err_msg = '';
        err_msg += `Invalid file path [${file_path}].`;
        err_msg += ` File must be in [${transpose_params.root}/src/].`;
        output_instance.error_log(err_msg, 'trsp');
    }
    if (!included) {
        output_instance.done_log(`Transpose file completed. [${file_path}]`);
    }
}
function _transpose_book() {
    const tmp_book_folder = `${transpose_params.root}/${defaults_1.defaults.folder}/.tmp`;
    util_instance.fs.remove_directory(tmp_book_folder, 'trbo');
    util_instance.fs.create_directory(tmp_book_folder, 'trbo');
    util_instance.fs.copy_file(`${transpose_params.root}/src/book.ts`, `${tmp_book_folder}/book.ts`, 'bkp');
    _manipulate_and_create_files(`${tmp_book_folder}/book.ts`);
    _generate_client_books();
    _resolve_aliases_in_books();
    _replace_imports_to_avoid_loops_in_books();
    util_instance.fs.remove_directory(tmp_book_folder, 'trbo');
}
function _transpose_folder(dir_path, included = false) {
    util_instance.fs.read_dir(dir_path).forEach((filename) => {
        const full_path = path_1.default.resolve(dir_path, filename);
        if (util_instance.fs.is_directory(full_path) && filename !== '.git') {
            return _transpose_folder(full_path, true);
        }
        else {
            return _transpose_file(full_path, true);
        }
    });
    if (!included) {
        output_instance.done_log(`Transpose folder completed.`);
    }
}
function _avoid_import_loop(file_path) {
    const modules = {};
    const expressions = {};
    let uranio_import_state = '';
    const _project = new tsm.Project(_project_option);
    const sourceFile = _project.addSourceFileAtPath(`${file_path}`);
    const import_decls = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
    let uranio_var_name = '';
    let is_file_importing_uranio = false;
    for (const import_decl of import_decls) {
        const str_lit = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
        const module_name = str_lit.getText();
        const repo_length = defaults_1.defaults.repo_folder.length;
        let is_importing_uranio = false;
        const module_with_slash = module_name.substr(-1 * (repo_length + 3));
        const module_with_no_slash = module_name.substr(-1 * (repo_length + 2));
        const module_with_client = module_name.substr(-1 * (repo_length + 9));
        if (module_with_slash === `/${defaults_1.defaults.repo_folder}/"` ||
            module_with_slash === `/${defaults_1.defaults.repo_folder}/'`) {
            is_importing_uranio = true;
        }
        if (module_with_no_slash === `/${defaults_1.defaults.repo_folder}"` ||
            module_with_no_slash === `/${defaults_1.defaults.repo_folder}'`) {
            is_importing_uranio = true;
        }
        if (module_with_client === `/${defaults_1.defaults.repo_folder}/client"` ||
            module_with_client === `/${defaults_1.defaults.repo_folder}/client'`) {
            is_importing_uranio = true;
        }
        if (is_importing_uranio) {
            is_file_importing_uranio = true;
            uranio_import_state = import_decl.getText();
            const identif = import_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
            uranio_var_name = identif.getText();
            const prop_access_exps = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression);
            const qualified_name = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.QualifiedName);
            const nodes_to_check = prop_access_exps.concat(qualified_name);
            // loop all methods or variable with module.module.methods syntax
            for (const prop_access_exp of nodes_to_check) {
                const prop_text = prop_access_exp.getText();
                const exploded_text = prop_text.split('.');
                // if the first is different than `uranio` continue.
                if (exploded_text[0] !== uranio_var_name) {
                    continue;
                }
                exploded_text.shift();
                let parent_module = uranio_var_name;
                // skipping uranio submodule
                while (submodules.includes(exploded_text[0])) {
                    parent_module = exploded_text[0];
                    exploded_text.shift();
                }
                // skipping all node longer than the only module that need to be imported
                // this is because in the loop there are, for example,
                // `bll.auth.create`, `bll.auth` and `bll` from the same node
                // we want only `bll`
                if (exploded_text.length !== 1) {
                    continue;
                }
                const module_name = exploded_text[0];
                if (!modules[parent_module]) {
                    modules[parent_module] = [];
                }
                if (!modules[parent_module].includes(module_name)) {
                    modules[parent_module].push(module_name);
                }
                if (!expressions[module_name]) {
                    expressions[module_name] = [];
                }
                if (!expressions[module_name].includes(prop_text)) {
                    expressions[module_name].push(prop_text);
                }
            }
        }
    }
    const import_states = [];
    const is_server_folder = (file_path.includes(`${transpose_params.root}/${defaults_1.defaults.folder}/server/`));
    // const is_client_folder = (file_path.includes(`${transpose_params.root}/${defaults.folder}/client/`));
    const parent_folder = (is_server_folder) ? 'server' : 'client';
    const folderpath = path_1.default.parse(file_path).dir;
    const lib_path = `${transpose_params.root}/${defaults_1.defaults.folder}/${parent_folder}/src/${defaults_1.defaults.repo_folder}/`;
    let relative_root = path_1.default.relative(folderpath, lib_path);
    if (relative_root[0] !== '.') {
        relative_root = './' + relative_root;
    }
    const clnsrv_folder = (is_server_folder) ? 'srv' : 'cln';
    /**
     * NOTE:
     * This need to be updated if new first level
     * functions are defined.
     */
    const first_level_core_methods = ['init'];
    const path_by_method = {
        'init': 'init'
    };
    let relative_path = '';
    for (const submodule_name in modules) {
        for (const module_name of modules[submodule_name]) {
            if (
            // transpose_params.repo === 'core'
            first_level_core_methods.includes(module_name)
                && urn_lib_1.urn_util.object.has_key(path_by_method, module_name)) { // case for first level methods like `init`, etc.
                const submod_tree = _resolve_path_tree(submodule_name);
                relative_path = `${relative_root}/${submod_tree}${path_by_method[module_name]}`;
                const import_state = `import {${module_name} as ${_generate_variable_name(module_name)}} from '${relative_path}';`;
                import_states.push(import_state);
            }
            else {
                if (module_name === 'types') {
                    relative_path = `${relative_root}/${clnsrv_folder}/types`;
                }
                else {
                    const submod_tree = _resolve_path_tree(submodule_name);
                    relative_path = `${relative_root}/${submod_tree}${module_name}`;
                }
                const import_state = `import * as ${_generate_variable_name(module_name)} from '${relative_path}';`;
                import_states.push(import_state);
            }
        }
    }
    const file_content = sourceFile.print();
    if (uranio_import_state !== '') {
        const regex = new RegExp(`${uranio_import_state}`);
        const with_imports = file_content.replace(regex, import_states.join('\n'));
        let with_imports_and_variables = with_imports;
        for (const module_name in expressions) {
            for (const expression of expressions[module_name]) {
                const regex = new RegExp(`\\b${expression.replace(".", "\\.")}\\b`, 'g');
                with_imports_and_variables = with_imports_and_variables.replace(regex, _generate_variable_name(module_name));
            }
        }
        if (is_file_importing_uranio) {
            util_instance.fs.write_file(file_path, with_imports_and_variables);
            util_instance.pretty(file_path);
        }
    }
}
function _resolve_path_tree(submodule_name) {
    switch (transpose_params.repo) {
        case 'adm': {
            switch (submodule_name) {
                case 'core': return 'trx/api/core/';
                case 'api': return 'trx/api/';
                case 'trx': return 'trx/';
            }
            break;
        }
        case 'trx': {
            switch (submodule_name) {
                case 'core': return 'api/core/';
                case 'api': return 'api/';
            }
            break;
        }
        case 'api': {
            switch (submodule_name) {
                case 'core': return 'core/';
            }
            break;
        }
        case 'core': {
            return '';
        }
    }
    return '';
}
function _generate_variable_name(str) {
    let num = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.toUpperCase().charCodeAt(i);
        if (code > 64 && code < 91) {
            num += (code - 64);
        }
    }
    return `${str}_${num}`;
}
// function _resolve_aliases(){
//   output_instance.start_loading(`Replacing aliases with relative paths...`);
//   const base_folder = `${transpose_params.root}/${defaults.folder}`;
//   const tsconfig_server = `${base_folder}/server/tsconfig.json`;
//   const aliases_server = alias.get_aliases(tsconfig_server, transpose_params);
//   const server_dir = `${transpose_params.root}/${defaults.folder}/server/src/`;
//   _traverse_ts_resolve_aliases(server_dir, aliases_server);
//   output_instance.done_log(`Server aliases replaced.`, 'alias');
//   const tsconfig_client = `${base_folder}/client/tsconfig.json`;
//   const aliases_client = alias.get_aliases(tsconfig_client, transpose_params);
//   const client_dir = `${transpose_params.root}/${defaults.folder}/client/src/`;
//   _traverse_ts_resolve_aliases(client_dir, aliases_client);
//   output_instance.done_log(`Client aliases replaced.`, 'alias');
// }
// function _replace_import_to_avoid_loops(){
//   const server_dir = `${transpose_params.root}/${defaults.folder}/server/`;
//   if(util_instance.fs.exists(server_dir)){
//     _traverse_ts_avoid_import_loop(server_dir);
//   }
//   const client_dir = `${transpose_params.root}/${defaults.folder}/client/`;
//   if(util_instance.fs.exists(client_dir)){
//     _traverse_ts_avoid_import_loop(client_dir);
//   }
// }
// function _traverse_ts_resolve_aliases(directory:string, aliases:Aliases) {
//   util_instance.fs.read_dir(directory).forEach((filename) => {
//     const full_path = path.resolve(directory, filename);
//     if (
//       util_instance.fs.is_directory(full_path)
//       && filename !== '.git'
//       && filename !== 'books'
//       // && filename !== 'uranio'
//     ){
//       return _traverse_ts_resolve_aliases(full_path, aliases);
//     }else if(filename.split('.').pop() === 'ts'){
//       alias.replace_file_aliases(full_path, aliases, transpose_params);
//     }
//   });
// }
function _traverse_ts_avoid_import_loop(directory) {
    util_instance.fs.read_dir(directory).forEach((filename) => {
        const full_path = path_1.default.resolve(directory, filename);
        if (util_instance.fs.is_directory(full_path) && filename !== '.git') {
            return _traverse_ts_avoid_import_loop(full_path);
        }
        else if (filename.split('.').pop() === 'ts') {
            _avoid_import_loop(full_path);
        }
    });
}
function _manipulate_and_create_files(file_path) {
    const action = `manipulating [src/book.ts]`;
    output_instance.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
    output_instance.verbose_log(`Started ${action}.`, 'mnpl');
    // let sourceFile = _project.addSourceFileAtPath(`${transpose_params.root}/src/book.ts`);
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${file_path}`);
    sourceFile = _replace_comments(sourceFile);
    // sourceFile = _change_realtive_imports(sourceFile);
    let import_statements = _copy_imports(sourceFile);
    import_statements = _change_import_statements_relative_path(import_statements);
    _create_atom_book(sourceFile, import_statements);
    _create_bll_book(sourceFile, import_statements);
    _create_dock_book(sourceFile, import_statements);
    _create_routes_book(sourceFile, import_statements);
    if (transpose_params.is_dot) {
        _copy_books_to_dot_src();
    }
    // sourceFile = _manipulate_atom_book(sourceFile);
    // const modified = sourceFile.print();
    // _create_manipulated_file(modified);
    // _pretty_books();
    // _type_check_books();
    output_instance.done_log(`Manipulated book and created files.`, 'book');
}
function _copy_books_to_dot_src() {
    output_instance.start_loading(`Copying books to uranio-dot/src...`);
    const server_book_dir = `${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books`;
    const dot_book_dir = `${transpose_params.root}/src/books`;
    util_instance.fs.copy_directory(server_book_dir, dot_book_dir);
    output_instance.done_log(`Copied books to uranio-dot/src.`, 'dot');
}
function _generate_client_books() {
    output_instance.start_loading(`Generating client books...`);
    _generate_client_book('dock', dock_book_required_client_second_props);
    _generate_client_book('atom', atom_book_required_client_first_props);
    _copy_routes_book();
    output_instance.done_verbose_log(`Client books generated.`, 'client');
}
function _resolve_aliases_in_books() {
    output_instance.start_loading(`Replacing book aliases...`);
    const base_folder = `${transpose_params.root}/${defaults_1.defaults.folder}`;
    const books_dir_server = `${base_folder}/server/src/books`;
    const tsconfig_server = `${base_folder}/server/tsconfig.json`;
    const aliases_server = alias.get_aliases(tsconfig_server, transpose_params);
    alias.replace_file_aliases(`${books_dir_server}/atom.ts`, aliases_server, transpose_params);
    alias.replace_file_aliases(`${books_dir_server}/dock.ts`, aliases_server, transpose_params);
    alias.replace_file_aliases(`${books_dir_server}/routes.ts`, aliases_server, transpose_params);
    alias.replace_file_aliases(`${books_dir_server}/bll.ts`, aliases_server, transpose_params);
    output_instance.done_log(`Server books aliases replaced.`, 'alias');
    const books_dir_client = `${base_folder}/client/src/books`;
    const tsconfig_client = `${base_folder}/client/tsconfig.json`;
    const aliases_client = alias.get_aliases(tsconfig_client, transpose_params);
    alias.replace_file_aliases(`${books_dir_client}/atom.ts`, aliases_client, transpose_params);
    alias.replace_file_aliases(`${books_dir_client}/dock.ts`, aliases_client, transpose_params);
    alias.replace_file_aliases(`${books_dir_client}/routes.ts`, aliases_client, transpose_params);
    output_instance.done_log(`Client books aliases replaced.`, 'alias');
}
function _replace_imports_to_avoid_loops_in_books() {
    const server_dir = `${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/`;
    if (util_instance.fs.exists(server_dir)) {
        _traverse_ts_avoid_import_loop(server_dir);
    }
    const client_dir = `${transpose_params.root}/${defaults_1.defaults.folder}/client/src/books/`;
    if (util_instance.fs.exists(client_dir)) {
        _traverse_ts_avoid_import_loop(client_dir);
    }
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
function _copy_imports(sourceFile) {
    output_instance.start_loading(`Copying import statements...`);
    const import_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
    const states = [];
    for (const state of import_states) {
        states.push(state.getText());
    }
    output_instance.done_verbose_log(`Copied import statements.`, 'cpim');
    return states;
}
function _change_import_statements_relative_path(import_statements) {
    const modified_import_statements = [];
    for (const import_statement of import_statements) {
        const _project = new tsm.Project(_project_option);
        const node = _project.createSourceFile(`${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/imports.ts`, import_statement, { overwrite: true });
        const str_lit = node.getFirstDescendantByKind(tsm.ts.SyntaxKind.StringLiteral);
        if (str_lit) {
            const text = str_lit.getText();
            if (text.slice(1, 3) === './') {
                str_lit.replaceWithText(`'.${text.slice(1, text.length - 1)}'`);
            }
            modified_import_statements.push(node.getText());
        }
    }
    return modified_import_statements;
}
function _create_atom_book(sourceFile, import_statements) {
    return _create_a_book(sourceFile, import_statements, 'atom', atom_book_required_properties, 'atom');
}
function _create_bll_book(sourceFile, import_statements) {
    return _create_a_book(sourceFile, import_statements, 'bll', bll_book_required_properties, 'bll');
}
function _create_dock_book(sourceFile, import_statements) {
    let source_file = _create_a_book(sourceFile, import_statements, 'dock', dock_book_required_properties, 'dock');
    source_file = _fill_empty_docks(source_file);
    const file_path = `${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/dock.ts`;
    _create_a_book_file(file_path, source_file.getText());
    return source_file;
}
function _create_routes_book(sourceFile, import_statements) {
    let source_file = _create_a_book(sourceFile, import_statements, 'routes', dock_book_required_properties, 'dock');
    source_file = _fill_empty_docks(source_file);
    source_file = _remove_dock_route_call_implementation(source_file);
    const file_path = `${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/routes.ts`;
    _create_a_book_file(file_path, source_file.getText());
    return source_file;
}
function _generate_client_book(book_name, required_props) {
    const folder_path = `${transpose_params.root}/${defaults_1.defaults.folder}`;
    const server_books_dir = `${folder_path}/server/src/books`;
    const client_books_dir = `${folder_path}/client/src/books`;
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${server_books_dir}/${book_name}.ts`);
    sourceFile = _replace_uranio_client_dependecy(sourceFile);
    if (book_name === 'atom') {
        sourceFile = _keep_only_client_first_level_properties(sourceFile, book_name, required_props);
    }
    else {
        sourceFile = _keep_only_client_second_level_properties(sourceFile, book_name, required_props);
    }
    if (book_name === 'dock') {
        sourceFile = _remove_dock_route_call_implementation(sourceFile);
    }
    const book_state = _find_book_statement(sourceFile, `${book_name}_book`);
    if (book_state) {
        const atom_book_state_text = book_state.getText();
        const _project = new tsm.Project(_project_option);
        const cloned_book_source = _project.createSourceFile(`${transpose_params.root}/${defaults_1.defaults.folder}/client/src/books/tmp_${book_name}.ts`, atom_book_state_text, { overwrite: true });
        const text_without_imports = cloned_book_source.getText();
        const imports = _copy_imports(sourceFile);
        const required_imports = _get_required_imports(imports, text_without_imports);
        const text = required_imports.join('\n') + text_without_imports;
        const file_path = `${client_books_dir}/${book_name}.ts`;
        util_instance.fs.write_file(file_path, text);
        util_instance.pretty(file_path);
        output_instance.done_log(`Generated client book [${book_name}].`, 'clnt');
    }
    else {
        output_instance.error_log(`Cannot find client book statements for [${book_name}]`, 'err');
    }
}
function _create_a_book(sourceFile, import_statements, book_name, keep_properties, required_book_name) {
    output_instance.start_loading(`Creating ${book_name}_book...`);
    const book_state = _find_atom_book_statement(sourceFile);
    if (book_state) {
        const atom_book_state_text = book_state.getText();
        const _project = new tsm.Project(_project_option);
        const cloned_book_source = _project.createSourceFile(`${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/${book_name}.ts`, atom_book_state_text, { overwrite: true });
        let cloned_book_decl = cloned_book_source
            .getFirstDescendantByKind(tsm.ts.SyntaxKind.VariableDeclaration);
        if (cloned_book_decl) {
            cloned_book_decl = _remove_type_reference(cloned_book_decl);
            cloned_book_decl = _rename_book(book_name, cloned_book_decl);
            cloned_book_decl = _clean_all_but(keep_properties, cloned_book_decl);
            cloned_book_decl = _append_required_book(cloned_book_decl, required_book_name);
            cloned_book_decl = _add_as_const(cloned_book_decl);
        }
        const required_imports = _get_required_imports(import_statements, cloned_book_source.getText());
        const file_path = `${transpose_params.root}/${defaults_1.defaults.folder}/server/src/books/${book_name}.ts`;
        const text = `\n` + required_imports.join('\n') + cloned_book_source.getText();
        _create_a_book_file(file_path, text);
        output_instance.done_log(`Generated server book [${book_name}].`, book_name);
        cloned_book_source.replaceWithText(text);
        return cloned_book_source;
    }
    output_instance.done_verbose_log(`Created ${book_name}_book.`, 'book');
    return sourceFile;
}
function _copy_routes_book() {
    const base_folder = `${transpose_params.root}/${defaults_1.defaults.folder}`;
    const routes_server = `${base_folder}/server/src/books/routes.ts`;
    const routes_client = `${base_folder}/client/src/books/routes.ts`;
    util_instance.fs.copy_file(routes_server, routes_client, 'rout');
    output_instance.done_verbose_log(`Copied [${routes_server}] to [${routes_client}]`, 'rout');
}
/**
 *
 * This function check if the identifiers in the import statements are used in `text`.
 * Return an Array of the import statements required for that `text`.
 *
 */
function _get_required_imports(import_statements, text) {
    const required_import_statements = [];
    const str_project = new tsm.Project({
        tsConfigFilePath: `${transpose_params.root}/${defaults_1.defaults.folder}/server/tsconfig.json`,
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
function _clean_all_but(but, var_decl) {
    output_instance.start_loading(`Cleaning all properties but [${but}]...`);
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
    output_instance.done_verbose_log(`Removed all properties but [${but}].`, 'props');
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
    const book_content = util_instance.fs.read_file(books_file_path, 'utf8');
    const _project = new tsm.Project(_project_option);
    const core_books_source = _project.createSourceFile(`${transpose_params.root}/${defaults_1.defaults.folder}/cloned_${required_book_name}.ts`, book_content, { overwrite: true });
    let core_var_content = _get_variable_content(core_books_source, required_book_name);
    const syntax_list = book_decl.getFirstDescendantByKind(tsm.ts.SyntaxKind.SyntaxList);
    if (syntax_list && core_var_content.length > 0) {
        if (core_var_content[core_var_content.length - 1] !== ',') {
            core_var_content += ',';
        }
        syntax_list.replaceWithText(core_var_content + syntax_list.getText());
    }
}
function _add_core_books(book_decl, required_book_name) {
    let core_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`;
    switch (transpose_params.repo) {
        case 'core': {
            break;
        }
        case 'api': {
            core_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/core`;
            break;
        }
        case 'trx': {
            core_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/api/core`;
            break;
        }
        case 'adm': {
            core_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx/api/core`;
            break;
        }
    }
    const required_books_path = `${transpose_params.root}/${core_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_api_book(book_decl, required_book_name) {
    let api_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`;
    switch (transpose_params.repo) {
        case 'core':
        case 'api': {
            break;
        }
        case 'trx': {
            api_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/api`;
            break;
        }
        case 'adm': {
            api_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx/api`;
            break;
        }
    }
    const required_books_path = `${transpose_params.root}/${api_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_trx_book(book_decl, required_book_name) {
    let trx_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`;
    switch (transpose_params.repo) {
        case 'core':
        case 'api':
        case 'trx': {
            break;
        }
        case 'adm': {
            trx_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}/trx`;
            break;
        }
    }
    const required_books_path = `${transpose_params.root}/${trx_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _add_adm_book(book_decl, required_book_name) {
    const adm_repo_path = `${defaults_1.defaults.folder}/server/src/${defaults_1.defaults.repo_folder}`;
    switch (transpose_params.repo) {
        case 'core':
        case 'api':
        case 'trx':
        case 'adm': {
            break;
        }
    }
    const required_books_path = `${transpose_params.root}/${adm_repo_path}/books.ts`;
    _add_book_from_file(book_decl, required_book_name, required_books_path);
}
function _append_required_book(book_decl, required_book_name) {
    output_instance.start_loading(`Adding required books...`);
    switch (transpose_params.repo) {
        case 'api': {
            _add_api_book(book_decl, required_book_name);
            break;
        }
        case 'trx': {
            _add_api_book(book_decl, required_book_name);
            _add_trx_book(book_decl, required_book_name);
            break;
        }
        case 'adm': {
            _add_api_book(book_decl, required_book_name);
            _add_trx_book(book_decl, required_book_name);
            _add_adm_book(book_decl, required_book_name);
            break;
        }
    }
    _add_core_books(book_decl, required_book_name);
    output_instance.done_verbose_log(`Added required books.`, 'requ');
    return book_decl;
}
// function _change_realtive_imports(sourceFile:tsm.SourceFile)
//     :tsm.SourceFile{
//   output_instance.start_loading(`Changing relative imports...`);
//   const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
//   for(const import_decl of import_decls){
//     _change_realtive_import(import_decl);
//   }
//   output_instance.done_log('impr', 'Changed relative imports.');
//   return sourceFile;
// }
function _add_as_const(book_decl) {
    output_instance.start_loading(`Adding as const...`);
    book_decl.replaceWithText(book_decl.getText() + ' as const');
    output_instance.done_verbose_log(`Added as const.`, 'asco');
    return book_decl;
}
// function _change_realtive_import(node:tsm.Node)
//     :tsm.Node{
//   output_instance.start_loading(`Changing relative imports...`);
//   const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
//   if(str_lit){
//     const text = str_lit.getText();
//     if(text.includes('./')){
//       const replace = text.replace('./','../../');
//       str_lit.replaceWithText(replace);
//       output_instance.verbose_log(`Changed [${text}] to [${replace}].`, 'impo');
//     }
//   }
//   output_instance.done_verbose_log(`Changed relative imports.`, 'impo');
//   return node;
// }
function _remove_type_reference(book_decl) {
    output_instance.start_loading(`Removing type reference...`);
    const type_ref = book_decl.getFirstChildByKind(tsm.ts.SyntaxKind.TypeReference);
    if (type_ref) {
        book_decl.removeType();
    }
    output_instance.done_verbose_log(`Type reference removed.`, 'type');
    return book_decl;
}
function _find_atom_book_statement(sourceFile) {
    return _find_book_statement(sourceFile, 'atom_book');
}
function _find_book_statement(sourceFile, book_name) {
    output_instance.start_loading(`Looking for atom_book statement...`);
    const var_states = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.VariableStatement);
    for (const state of var_states) {
        const var_decl_list = state.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclarationList);
        if (var_decl_list) {
            const var_decl = var_decl_list.getFirstChildByKind(tsm.ts.SyntaxKind.VariableDeclaration);
            if (var_decl) {
                const name = var_decl.getName();
                if (name === book_name) {
                    output_instance.done_verbose_log(`Statement of ${book_name} found.`, 'book');
                    return state;
                }
            }
        }
    }
    output_instance.verbose_log(`Cannot find ${book_name}`, 'book');
    return undefined;
}
function _create_a_book_file(file_path, text) {
    output_instance.start_loading(`Creating book file [${file_path}]...`);
    util_instance.fs.remove_file(file_path, 'book');
    util_instance.fs.create_file(file_path, 'book');
    let comment = '';
    comment += `/**\n`;
    comment += ` *\n`;
    comment += ` * Autogenerated book from urn-cli\n`;
    comment += ` *\n`;
    comment += ` */\n`;
    const content = comment + text;
    util_instance.fs.write_file(file_path, content);
    util_instance.pretty(file_path);
    output_instance.done_verbose_log(`Created book file [${file_path}].`, 'book');
}
// function _resolve_aliases_books(){
//   output_instance.start_loading(`Replacing aliases with relative paths in books folders...`);
//   const base_folder = `${transpose_params.root}/${defaults.folder}`;
//   const books_dir_server = `${base_folder}/server/books/`;
//   const tsconfig_server = `${base_folder}/server/tsconfig.json`;
//   const aliases_server = alias.get_aliases(tsconfig_server, transpose_params);
//   _traverse_ts_resolve_aliases(books_dir_server, aliases_server);
//   const books_dir_client = `${base_folder}/client/books/`;
//   const tsconfig_client = `${base_folder}/client/tsconfig.json`;
//   const aliases_client = alias.get_aliases(tsconfig_client, transpose_params);
//   _traverse_ts_resolve_aliases(books_dir_client, aliases_client);
//
//   output_instance.done_verbose_log(`Replaced aliases with relative paths.`, 'alias');
// }
function _fill_empty_docks(sourceFile) {
    const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_stat of variable_stats) {
        const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
        const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        const book_name = identifier.getText();
        if (book_name === `dock_book` || book_name === `routes_book`) {
            const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            for (const atom_def of atom_defs) {
                const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const text = atom_syntax_list.getText();
                const identif = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                const obj_lit_ex = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
                const atom_name = identif.getText();
                if (text === '') {
                    let dock_def = ``;
                    dock_def += `\t\t{\n`;
                    dock_def += `\t\t\tdock:{\n`;
                    dock_def += `\t\t\t\turl: '/${atom_name}s'\n`;
                    dock_def += `\t\t\t}\n`;
                    dock_def += `\t\t}\n`;
                    obj_lit_ex.replaceWithText(dock_def);
                }
                else {
                    const atom_props = atom_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                    let plural = atom_name;
                    let has_dock = false;
                    for (const atom_prop of atom_props) {
                        const prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                        const prop_name = prop_id.getText();
                        if (prop_name === 'plural') {
                            const plural_lit = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
                            const plural_lit_str = plural_lit.getText();
                            plural = plural_lit_str.substr(1, plural_lit_str.length - 2);
                        }
                        else if (prop_name === 'dock') {
                            has_dock = true;
                        }
                    }
                    if (has_dock === false) {
                        const current_syn_lis = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                        const syn_lis_str = current_syn_lis.getText();
                        const comma = (syn_lis_str[syn_lis_str.length - 1] === ',') ? '' : ',';
                        let new_syn_lis = syn_lis_str + `${comma}\n`;
                        new_syn_lis += `dock: {\n`;
                        new_syn_lis += `\turl: '/${plural}'\n`;
                        new_syn_lis += `}\n`;
                        current_syn_lis.replaceWithText(new_syn_lis);
                    }
                }
            }
        }
    }
    output_instance.done_log(`Filled empty docks in dock book.`, 'clnt');
    return sourceFile;
}
function _remove_dock_route_call_implementation(sourceFile) {
    const syntax_list = sourceFile.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
    const variable_stats = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
    for (const var_stat of variable_stats) {
        const var_decl = var_stat.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
        const identifier = var_decl.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
        if (identifier.getText() === `dock_book` || identifier.getText() === `routes_book`) {
            const obj_lit_ex = var_decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
            const syntax_list = obj_lit_ex.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
            const atom_defs = syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
            for (const atom_def of atom_defs) {
                const atom_syntax_list = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
                const dock_key_list = atom_syntax_list.getFirstDescendantByKind(tsm.SyntaxKind.SyntaxList);
                if (dock_key_list) {
                    const dock_keys = dock_key_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
                    const atom_id = atom_def.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                    const atom_name = atom_id.getText();
                    for (const dock_key of dock_keys) {
                        const key_name_identifier = dock_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                        const key_name = key_name_identifier.getText();
                        if (key_name === 'routes') {
                            const routes_syntax = dock_key.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
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
                                        output_instance.verbose_log(`Removed route implementation [${atom_name}][${prop_id_name}]`, 'clnt');
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
    output_instance.done_log(`Removed call implementation in dock book.`, 'clnt');
    return sourceFile;
}
function _replace_uranio_client_dependecy(sourceFile) {
    const imports = sourceFile.getDescendantsOfKind(tsm.SyntaxKind.ImportDeclaration);
    for (const decl of imports) {
        const str_lit = decl.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
        const module_name = str_lit.getText();
        let is_importing_uranio = false;
        const repo_length = defaults_1.defaults.repo_folder.length;
        if (module_name.substr(-1 * (repo_length + 3)) === `/${defaults_1.defaults.repo_folder}/"`) {
            is_importing_uranio = true;
        }
        if (module_name.substr(-1 * (repo_length + 2)) === `/${defaults_1.defaults.repo_folder}"`) {
            is_importing_uranio = true;
        }
        if (is_importing_uranio) {
            const slash = (module_name[module_name.length - 2] === '/') ? '' : '/';
            const replace_with = `"${module_name.substr(1, module_name.length - 2)}${slash}client"`;
            str_lit.replaceWithText(replace_with);
            output_instance.verbose_log(`Replaced [${module_name}] to [${replace_with}]`, 'clnt');
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
                        output_instance.verbose_log(`Removed property [${atom_name}][${ide_text}]`, 'clnt');
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
                    const prop_id = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
                    const prop_name = prop_id.getText();
                    if (book_name === 'dock' && prop_name === 'plural') {
                        continue;
                    }
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
                            output_instance.verbose_log(`Removed property [${atom_name}][${ide_text}]`, 'clnt');
                        }
                    }
                }
            }
        }
    }
    return sourceFile;
}
// export const transpose = {
//   run: (root:string, file_path?:string, options?:Partial<Options>):void => {
//     transpose_params.root = root;
//     if(typeof file_path === 'string'){
//       transpose_params.file = util_instance.relative_to_absolute_path(file_path);
//     }
//     common.init_run(options);
//     transpose.command();
//   },
//   command: (args?:Arguments):void => {
//     output_instance.start_loading('Transposing...');
//     util_instance.read_rc_file();
//     if(args && args.file){
//       const file_path = args.file;
//       if(typeof file_path === 'string' && file_path !== ''){
//         transpose_params.file = util_instance.relative_to_absolute_path(file_path);
//       }
//     }
//     if(typeof transpose_params.file === 'string'){
//       const parsed_path = path.parse(transpose_params.file);
//       if(typeof parsed_path.ext === 'string' && parsed_path.ext !== ''){
//         _transpose_file(transpose_params.file);
//       }else{
//         _transpose_folder(transpose_params.file);
//       }
//     }else{
//       _transpose_all();
//     }
//     output_instance.stop_loading();
//     // process.exit(0);
//   }
// };
//# sourceMappingURL=transpose.js.map