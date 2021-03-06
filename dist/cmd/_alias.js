"use strict";
/**
 * Alias command module
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
exports.replace_file_aliases = exports.get_aliases = exports.alias = void 0;
const path_1 = __importDefault(require("path"));
const tsm = __importStar(require("ts-morph"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let alias_params = defaults_1.default_params;
const _project_option = {
    manipulationSettings: {
        indentationText: tsm.IndentationText.Tab,
        quoteKind: tsm.QuoteKind.Single,
        newLineKind: tsm.NewLineKind.LineFeed
    }
};
async function alias(params, included = false) {
    _init_alias(params);
    output_instance.start_loading(`Updating aliases...`);
    const tsconfig_path_server = `${alias_params.root}/${defaults_1.defaults.folder}/server/tsconfig.json`;
    const tsconfig_path_client = `${alias_params.root}/${defaults_1.defaults.folder}/client/tsconfig.json`;
    const aliases_server = get_aliases(tsconfig_path_server);
    const aliases_client = get_aliases(tsconfig_path_client);
    const srv_promise = _replace_aliases_server(aliases_server);
    const cln_promise = _replace_aliases_client(aliases_client);
    await Promise.all([srv_promise, cln_promise]);
    if (!included) {
        output_instance.end_log(`Aliases updated.`);
    }
    else {
        output_instance.done_log(`Alias updated.`, 'alis');
    }
}
exports.alias = alias;
function get_aliases(tsconfig_path, params) {
    if (typeof params !== 'undefined') {
        _init_alias(params);
    }
    const data = util_instance.fs.read_file(tsconfig_path, 'utf8');
    try {
        const tsconf_data = urn_lib_1.urn_util.json.clean_parse(data);
        return tsconf_data['compilerOptions']['paths'];
    }
    catch (ex) {
        const e = ex;
        output_instance.wrong_end_log(`Error parsing ${tsconfig_path}. ${e.message}`);
        process.exit(1);
    }
}
exports.get_aliases = get_aliases;
async function replace_file_aliases(filepath, aliases, params) {
    return new Promise((resolve, _reject) => {
        if (typeof params !== 'undefined') {
            _init_alias(params);
        }
        const _project = new tsm.Project(_project_option);
        let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
        const { found, source } = _change_to_relative_statements(sourceFile, aliases);
        sourceFile = source;
        if (found === true) {
            const modified = sourceFile.print();
            _replace_modified_file(modified, filepath);
            // util_instance.pretty(filepath);
        }
        resolve();
    });
}
exports.replace_file_aliases = replace_file_aliases;
function _init_alias(params) {
    alias_params = (0, common_1.merge_params)(params);
    output_instance = output.create(alias_params);
    util_instance = util.create(alias_params, output_instance);
    util_instance.must_be_initialized();
}
async function _replace_aliases_server(aliases) {
    await _traverse_ts_aliases(`${alias_params.root}/${defaults_1.defaults.folder}/server/src/`, aliases);
}
async function _replace_aliases_client(aliases) {
    await _traverse_ts_aliases(`${alias_params.root}/${defaults_1.defaults.folder}/client/src/`, aliases);
}
async function _traverse_ts_aliases(directory, aliases) {
    const entries = util_instance.fs.read_dir(directory);
    const promises = [];
    for (const filename of entries) {
        const full_path = path_1.default.resolve(directory, filename);
        const def_folder = `${alias_params.root}/${defaults_1.defaults.folder}`;
        if (full_path.indexOf(`${def_folder}/server/src/uranio/nuxt/static/`) !== -1) {
            continue;
        }
        if (full_path.indexOf(`${def_folder}/client/src/uranio/nuxt/static/`) !== -1) {
            continue;
        }
        if (util_instance.fs.is_directory(full_path) && filename != '.git') {
            const traverse_promise = _traverse_ts_aliases(full_path, aliases);
            promises.push(traverse_promise);
        }
        else if (filename.split('.').pop() === 'ts') {
            const file_promise = replace_file_aliases(full_path, aliases);
            promises.push(file_promise);
        }
        await Promise.all(promises);
    }
}
function _change_to_relative_statements(sourceFile, aliases) {
    let found = false;
    const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
    const export_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ExportDeclaration);
    for (const import_decl of import_decls) {
        if (_change_to_relative(import_decl, aliases)) {
            found = true;
        }
    }
    for (const export_decl of export_decls) {
        if (_change_to_relative(export_decl, aliases)) {
            found = true;
        }
    }
    return { found, source: sourceFile };
}
function _change_to_relative(node, aliases) {
    let found = false;
    const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
    if (str_lit) {
        const text = str_lit.getText();
        const full_module_name = text.substr(1, text.length - 2);
        let module_name = full_module_name;
        const splitted_module = module_name.split('/');
        if (module_name in aliases || splitted_module[0] in aliases) {
            found = true;
            // output_instance.start_loading(`Changing relative imports...`);
            const node_file_path = node.getSourceFile().getFilePath();
            const node_file_dir = path_1.default.parse(node_file_path).dir;
            let parent_folder = 'server';
            if (node_file_dir.includes(`${alias_params.root}/${defaults_1.defaults.folder}/client`)) {
                parent_folder = 'client';
            }
            let module_append = '';
            if (splitted_module.length > 1) {
                module_append = '/' + splitted_module.slice(1).join('/');
                module_name = splitted_module[0];
            }
            const alias = aliases[module_name][0];
            let relative_path = path_1.default.relative(node_file_dir, `${alias_params.root}/${defaults_1.defaults.folder}/${parent_folder}/${alias}`);
            if (relative_path === '') {
                relative_path = './index';
            }
            const append = (alias.slice(-1) === '/' && relative_path !== './index') ? '/' : '';
            const prepend = (relative_path.charAt(0) !== '.') ? './' : '';
            const replace = `${prepend}${relative_path}${module_append}${append}`;
            str_lit.replaceWithText(`'${replace}'`);
            output_instance.done_verbose_log(`Changed [${full_module_name}] to [${replace}].`, 'alias');
        }
    }
    return found;
}
function _replace_modified_file(text, filename) {
    output_instance.start_loading(`Writing manipulated file...`);
    util_instance.fs.write_file(filename, text);
    output_instance.done_verbose_log(`File replaced [${filename}].`, 'alias');
}
//# sourceMappingURL=_alias.js.map