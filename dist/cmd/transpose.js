"use strict";
/**
 * Transpose command module
 *
 * Method `transpose` copies files from the project `src` folder into
 * uranio node_modules folders:
 * - node_modules/uranio
 *
 * Depending from which folder is copying it will do different things.
 *
 * 1) SRC Atom Folder
 * It copies and process/compile all file from src/atoms to:
 * -- node_modules/uranio/src/atoms/server
 * -- node_modules/uranio/src/atoms/client
 *
 * 2) SRC Server Folder
 * It copies and compile all file from src/server to:
 * -- node_modules/uranio/src/aroms/server
 *
 * 2) SRC Admin Folder
 * TODO
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.transpose = void 0;
const path_1 = __importDefault(require("path"));
const esbuild = __importStar(require("esbuild"));
const recast = __importStar(require("recast"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let transpose_params = defaults_1.default_params;
async function transpose(params, path, event) {
    _init_transpose(params);
    try {
        if (typeof path === 'undefined') {
            await _transpose_all();
            return;
        }
        switch (event) {
            case 'addDir': {
                break;
            }
            case 'unlink': {
                await _transpose_unlink_file(path);
                break;
            }
            case 'unlinkDir': {
                await _transpose_unlink_dir(path);
                break;
            }
            default: {
                await _transpose_one(path);
                break;
            }
        }
    }
    catch (ex) {
        const err = ex;
        if (path) {
            output_instance.error_log(path);
        }
        output_instance.error_log(err.toString());
        output_instance.error_log(err.message);
    }
    output_instance.done_log(`Transpose completed.`);
}
exports.transpose = transpose;
async function _transpose_one(full_path) {
    // _init_transpose(params);
    if (util_instance.fs.is_directory(full_path)) {
        await _transpose_folder(full_path);
    }
    else {
        await _transpose_file(full_path);
    }
}
async function _transpose_unlink_dir(full_path) {
    // _init_transpose(params);
    if (!_validate_path(full_path)) {
        return;
    }
    await _unlink_dir(full_path);
    output_instance.done_debug_log(`Transpose unlink dir completed.`);
}
async function _transpose_unlink_file(full_path) {
    // _init_transpose(params);
    if (!_validate_path(full_path)) {
        return;
    }
    await _unlink_file(full_path);
    output_instance.done_debug_log(`Transpose unlink file completed.`);
}
function _init_transpose(params) {
    transpose_params = (0, common_1.merge_params)(params);
    output_instance = output.create(transpose_params);
    util_instance = util.create(transpose_params, output_instance);
}
async function _transpose_all() {
    await _transpose_folder(path_1.default.join(transpose_params.root, 'src'), true);
    output_instance.done_debug_log(`Transpose all completed.`);
}
async function _transpose_file(file_path) {
    output_instance.fndebug_log(`Transposing [${file_path}]...`);
    if (!_validate_exists_path(file_path)) {
        return;
    }
    const src_path = `${transpose_params.root}/src`;
    const atoms_src_dir = `${src_path}/atoms`;
    const server_src_dir = `${src_path}/server`;
    const admin_src_dir = `${src_path}/admin`;
    if (file_path.includes(atoms_src_dir)) {
        _transpose_atom_dir_file(file_path);
    }
    else if ((0, types_1.valid_deploy_repos)().includes(transpose_params.repo)
        && file_path.includes(server_src_dir)) {
        _transpose_server_dir_file(file_path);
    }
    else if ((0, types_1.valid_admin_repos)().includes(transpose_params.repo)
        && file_path.includes(admin_src_dir)) {
        _transpose_admin_dir_file(file_path);
    }
    output_instance.done_debug_log(`Transpose file completed. [${file_path}]`);
}
function _validate_exists_path(full_path) {
    if (!_validate_path(full_path)) {
        return false;
    }
    if (!full_path || !util_instance.fs.exists(full_path)) {
        let err_msg = '';
        err_msg += `Invalid file path [${full_path}].`;
        output_instance.error_log(err_msg);
        return false;
    }
    return true;
}
function _validate_path(full_path) {
    if (typeof full_path !== 'string' || full_path === '') {
        output_instance.error_log('Invalid path.');
        process.exit(1);
    }
    const basename = path_1.default.basename(full_path);
    const extension = path_1.default.extname(basename);
    if (basename.match(/^\.git/) !== null) {
        return false;
    }
    const not_valid_extensions = ['.swp', '.swo'];
    if (not_valid_extensions.includes(extension)) {
        return false;
    }
    const src_path = `${transpose_params.root}/src`;
    if (!full_path.includes(src_path)) {
        let err_msg = '';
        err_msg += `Invalid file path [${full_path}].`;
        err_msg += ` File must be in [${transpose_params.root}/src/].`;
        output_instance.error_log(err_msg);
        return false;
    }
    return true;
}
async function _unlink_dir(full_path) {
    const src_path = `${transpose_params.root}/src`;
    const atoms_src_dir = `${src_path}/atoms`;
    const server_src_dir = `${src_path}/server`;
    const admin_src_dir = `${src_path}/admin`;
    if (full_path.includes(atoms_src_dir)) {
        const relative_to_atom_dir_path = full_path.replace(atoms_src_dir, '');
        const node_uranio_dir = `${transpose_params.root}/node_modules/uranio`;
        const node_atoms_src = `${node_uranio_dir}/src/atoms`;
        const node_atoms_dist = `${node_uranio_dir}/dist/atoms`;
        util_instance.fs.remove_directory(`${node_atoms_src}/server${relative_to_atom_dir_path}`);
        util_instance.fs.remove_directory(`${node_atoms_src}/client${relative_to_atom_dir_path}`);
        util_instance.fs.remove_directory(`${node_atoms_dist}/server${relative_to_atom_dir_path}`);
        util_instance.fs.remove_directory(`${node_atoms_dist}/client${relative_to_atom_dir_path}`);
    }
    else if ((0, types_1.valid_deploy_repos)().includes(transpose_params.repo)
        && full_path.includes(server_src_dir)) {
        // TODO
    }
    else if ((0, types_1.valid_admin_repos)().includes(transpose_params.repo)
        && full_path.includes(admin_src_dir)) {
        // TODO
    }
}
async function _unlink_file(file_path) {
    const src_path = `${transpose_params.root}/src`;
    const atoms_src_dir = `${src_path}/atoms`;
    const server_src_dir = `${src_path}/server`;
    const admin_src_dir = `${src_path}/admin`;
    if (file_path.includes(atoms_src_dir)) {
        const relative_to_atom_dir_path = file_path.replace(atoms_src_dir, '');
        const node_uranio_dir = `${transpose_params.root}/node_modules/uranio`;
        const node_atoms_src = `${node_uranio_dir}/src/atoms`;
        const node_atoms_dist = `${node_uranio_dir}/dist/atoms`;
        util_instance.fs.remove_file(`${node_atoms_src}/server${relative_to_atom_dir_path}`);
        util_instance.fs.remove_file(`${node_atoms_src}/client${relative_to_atom_dir_path}`);
        util_instance.fs.remove_file(`${node_atoms_dist}/server${relative_to_atom_dir_path}`);
        util_instance.fs.remove_file(`${node_atoms_dist}/client${relative_to_atom_dir_path}`);
    }
    else if ((0, types_1.valid_deploy_repos)().includes(transpose_params.repo)
        && file_path.includes(server_src_dir)) {
        // TODO
    }
    else if ((0, types_1.valid_admin_repos)().includes(transpose_params.repo)
        && file_path.includes(admin_src_dir)) {
        // TODO
    }
}
function _transpose_atom_dir_file(file_path) {
    output_instance.debug_log(`Transpose atom dir file [${file_path}].`);
    const atoms_dir = `${transpose_params.root}/src/atoms/`;
    const relative_path = file_path.replace(atoms_dir, '');
    const text = util_instance.fs.read_file(file_path);
    let text_server = _replace_import_server(text, file_path);
    let text_client = _replace_import_client(text, file_path);
    if (_is_atom_register_definition(file_path)) {
        const atom_name = _get_atom_name_from_path(file_path);
        text_server = _process_atom_register_definition_server(text_server, atom_name);
        text_client = _process_atom_register_definition_client(text_client, atom_name);
    }
    else if ((0, types_1.valid_deploy_repos)().includes(transpose_params.repo)
        && _is_route_register_definition(file_path)) {
        const atom_name = _get_atom_name_from_path(file_path);
        const route_name = _get_route_name_from_path(file_path);
        text_server = _process_route_register_definition_server(text_server, atom_name, route_name);
        text_client = _process_route_register_definition_client(text_client, atom_name, route_name);
    }
    const node_atoms = `${transpose_params.root}/node_modules/uranio/src/atoms`;
    const node_dest_server = `${node_atoms}/server/${relative_path}`;
    const node_dest_client = `${node_atoms}/client/${relative_path}`;
    util_instance.fs.write_file(node_dest_server, text_server);
    util_instance.fs.write_file(node_dest_client, text_client);
    const node_dist_path_server = _dest_dist_path(node_dest_server);
    const node_dist_path_client = _dest_dist_path(node_dest_client);
    _compile(node_dest_server, node_dist_path_server);
    _compile(node_dest_client, node_dist_path_client);
}
function _dest_dist_path(filepath) {
    const file_name = path_1.default.parse(filepath).name;
    let dir_name = path_1.default.dirname(filepath);
    dir_name = dir_name.replace(`${transpose_params.root}/node_modules/uranio/src/`, `${transpose_params.root}/node_modules/uranio/dist/`);
    return `${dir_name}/${file_name}.js`;
}
function _compile(src_path, dest_path) {
    if (path_1.default.extname(src_path) === '.json') {
        const dest_dirname = path_1.default.dirname(dest_path);
        const dest_basename = path_1.default.basename(dest_path, '.js');
        const dest_json = path_1.default.join(dest_dirname, `${dest_basename}.json`);
        util_instance.fs.copy_file(src_path, dest_json);
    }
    else {
        esbuild.buildSync({
            entryPoints: [src_path],
            outfile: dest_path,
            platform: 'node',
            format: 'cjs',
            // sourcemap: true,
            // minify: true
        });
    }
}
function _process_route_register_definition_client(text, atom_name, route_name) {
    let updated_text = text;
    updated_text = _route_definition_without_call_paramter(updated_text);
    updated_text = _route_with_atom_and_name_argument(updated_text, atom_name, route_name);
    return updated_text;
}
function _process_route_register_definition_server(text, atom_name, route_name) {
    let updated_text = text;
    updated_text = _route_with_atom_and_name_argument(updated_text, atom_name, route_name);
    return updated_text;
}
function _route_definition_without_call_paramter(source) {
    const parsed_ast = recast.parse(source, {
        parser: require("recast/parsers/typescript")
    });
    const all = parsed_ast.program.body;
    for (const node of all) {
        if (node.type === 'ExportDefaultDeclaration') {
            const obj_declaration = node.declaration;
            if (obj_declaration.type === 'CallExpression') {
                if (obj_declaration.arguments.length === 0) {
                    break;
                }
                const definition = obj_declaration.arguments[0];
                if (definition.properties.length === 0) {
                    break;
                }
                for (let i = 0; i < definition.properties.length; i++) {
                    const obj_prop = definition.properties[i];
                    const key = obj_prop.key;
                    if (key && key.name === 'call') {
                        delete definition.properties[i];
                        break;
                    }
                }
            }
            break;
        }
    }
    const printed = recast.print(parsed_ast, { useTabs: true }).code;
    return printed;
}
function _route_with_atom_and_name_argument(source, atom_name, route_name) {
    const parsed_ast = recast.parse(source, {
        parser: require("recast/parsers/typescript")
    });
    const all = parsed_ast.program.body;
    for (const node of all) {
        if (node.type === 'ExportDefaultDeclaration') {
            const obj_declaration = node.declaration;
            if (obj_declaration.type === 'CallExpression') {
                const atom_arg = _create_atom_name_argument(atom_name);
                const route_arg = _create_route_name_argument(route_name);
                if (obj_declaration.arguments.length === 1) {
                    obj_declaration.arguments.push(atom_arg);
                    obj_declaration.arguments.push(route_arg);
                }
                else if (obj_declaration.arguments.length === 2) {
                    obj_declaration.arguments[1] = atom_arg;
                    obj_declaration.arguments.push(route_arg);
                }
                else if (obj_declaration.arguments.length === 3) {
                    obj_declaration.arguments[1] = atom_arg;
                    obj_declaration.arguments[2] = route_arg;
                }
            }
            break;
        }
    }
    const printed = recast.print(parsed_ast, { useTabs: true }).code;
    return printed;
}
function _get_route_name_from_path(file_path) {
    return path_1.default.parse(file_path).name;
}
function _get_atom_name_from_path(file_path) {
    const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
    const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
    const relative_splitted = relative_to_atom_dir_path.split('/');
    const atom_name = relative_splitted[0];
    return atom_name;
}
function _process_atom_register_definition_server(text, atom_name) {
    let updated_text = text;
    updated_text = _atom_with_name_argument(updated_text, atom_name);
    return updated_text;
}
function _process_atom_register_definition_client(text, atom_name) {
    let updated_text = text;
    updated_text = _atom_with_name_argument(updated_text, atom_name);
    return updated_text;
}
function _is_route_register_definition(file_path) {
    const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
    const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
    const relative_splitted = relative_to_atom_dir_path.split('/');
    return (relative_splitted.length === 3 && relative_splitted[1] === 'routes');
}
function _is_atom_register_definition(file_path) {
    const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
    const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
    const relative_splitted = relative_to_atom_dir_path.split('/');
    return (relative_splitted.length === 2 && path_1.default.basename(file_path) === 'index.ts');
}
function _replace_import_server(text, file_path) {
    return _replace_import(text, file_path, 'server');
}
function _replace_import_client(text, file_path) {
    return _replace_import(text, file_path, 'client');
}
function _replace_import(text, file_path, parent_folder) {
    const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
    const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
    const relative_splitted = relative_to_atom_dir_path.split('/');
    const depth = relative_splitted.length;
    const up = Array(depth + 1).fill('..').join('/');
    const source = `${up}/${parent_folder}/main`;
    const parsed_ast = recast.parse(text, {
        parser: require("recast/parsers/typescript")
    });
    const all = parsed_ast.program.body;
    for (const node of all) {
        if (node.type === 'ImportDeclaration') {
            if (node.source.value === 'uranio') {
                const b = recast.types.builders;
                const all_uranio_id = b.identifier('uranio');
                const import_namespace = b.importNamespaceSpecifier(all_uranio_id); // * as uranio
                node.specifiers[0] = import_namespace; // replace default "uranio" to "* as uranio"
                node.source.value = source; // replace "uranio" with "../../../server/main"
                break;
            }
        }
    }
    const printed = recast.print(parsed_ast, { useTabs: true }).code;
    return printed;
}
function _transpose_server_dir_file(file_path) {
    output_instance.debug_log(`Transpose server dir file [${file_path}].`);
    const server_dir = `${transpose_params.root}/src/server/`;
    const relative_path = file_path.replace(server_dir, '');
    const node_delta_server = `${transpose_params.root}/node_modules/uranio/src/server/delta`;
    const node_dest_path = `${node_delta_server}/${relative_path}`;
    util_instance.fs.copy_file(file_path, node_dest_path);
    const node_dist_path = _dest_dist_path(node_dest_path);
    _compile(node_dest_path, node_dist_path);
}
function _transpose_admin_dir_file(_file_path) {
    output_instance.debug_log(`Transpose admin dir file [${_file_path}].`);
    //TODO
}
function _atom_with_name_argument(source, atom_name) {
    const parsed_ast = recast.parse(source, {
        parser: require("recast/parsers/typescript")
    });
    const all = parsed_ast.program.body;
    for (const node of all) {
        if (node.type === 'ExportDefaultDeclaration') {
            const obj_declaration = node.declaration;
            if (obj_declaration.type === 'CallExpression') {
                const atom_arg = _create_atom_name_argument(atom_name);
                if (obj_declaration.arguments.length === 1) {
                    obj_declaration.arguments.push(atom_arg);
                }
                else if (obj_declaration.arguments.length === 2) {
                    obj_declaration.arguments[1] = atom_arg;
                }
            }
            break;
        }
    }
    const printed = recast.print(parsed_ast, { useTabs: true }).code;
    return printed;
}
function _create_atom_name_argument(atom_name) {
    const b = recast.types.builders;
    const arg_node = b.stringLiteral(atom_name);
    return arg_node;
}
function _create_route_name_argument(route_name) {
    const b = recast.types.builders;
    const arg_node = b.stringLiteral(route_name);
    return arg_node;
}
async function _transpose_folder(dir_path, included = false) {
    const entries = util_instance.fs.read_dir(dir_path);
    const promises = [];
    for (const filename of entries) {
        const full_path = path_1.default.resolve(dir_path, filename);
        if (util_instance.fs.is_directory(full_path) && filename !== '.git') {
            const folder_promise = _transpose_folder(full_path, true);
            promises.push(folder_promise);
        }
        else {
            const file_promise = _transpose_file(full_path);
            promises.push(file_promise);
        }
    }
    await Promise.all(promises);
    if (!included) {
        output_instance.done_log(`Transpose folder completed.`);
    }
}
//# sourceMappingURL=transpose.js.map