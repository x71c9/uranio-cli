"use strict";
/**
 * Alias command module
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
exports.replace_file_aliases = exports.get_aliases = exports.alias = void 0;
const path_1 = __importDefault(require("path"));
const tsm = __importStar(require("ts-morph"));
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
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
function alias(params, included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_alias(params);
        const tsconfig_path_server = `${alias_params.root}/${defaults_1.defaults.folder}/server/tsconfig.json`;
        const tsconfig_path_client = `${alias_params.root}/${defaults_1.defaults.folder}/client/tsconfig.json`;
        const aliases_server = get_aliases(tsconfig_path_server);
        const aliases_client = get_aliases(tsconfig_path_client);
        _replace_aliases_server(aliases_server);
        _replace_aliases_client(aliases_client);
        if (!included) {
            output_instance.end_log(`Aliases updated.`);
        }
        else {
            output_instance.done_log(`Alias updated.`, 'alis');
        }
    });
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
        output_instance.wrong_end_log(`Error parsing ${tsconfig_path}. ${ex.message}`);
        process.exit(1);
    }
}
exports.get_aliases = get_aliases;
function replace_file_aliases(filepath, aliases, params) {
    if (typeof params !== 'undefined') {
        _init_alias(params);
    }
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
    // const {found, source} = _change_to_relative_statements(sourceFile, aliases);
    const { source } = _change_to_relative_statements(sourceFile, aliases);
    sourceFile = source;
    // if(found === true){
    //   const modified = sourceFile.print();
    //   _replace_modified_file(modified, filepath);
    //   util_instance.pretty(filepath);
    // }
}
exports.replace_file_aliases = replace_file_aliases;
function _init_alias(params) {
    alias_params = common_1.merge_params(params);
    output_instance = output.create(params);
    util_instance = util.create(params, output_instance);
    util_instance.must_be_initialized();
}
function _replace_aliases_server(aliases) {
    _traverse_ts_aliases(`${alias_params.root}/${defaults_1.defaults.folder}/server/src/`, aliases);
}
function _replace_aliases_client(aliases) {
    _traverse_ts_aliases(`${alias_params.root}/${defaults_1.defaults.folder}/client/src/`, aliases);
}
function _traverse_ts_aliases(directory, aliases) {
    util_instance.fs.read_dir(directory).forEach((filename) => {
        const full_path = path_1.default.resolve(directory, filename);
        if (util_instance.fs.is_directory(full_path) && filename != '.git') {
            return _traverse_ts_aliases(full_path, aliases);
        }
        else if (filename.split('.').pop() === 'ts') {
            replace_file_aliases(full_path, aliases);
        }
    });
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
// function _replace_modified_file(text:string, filename:string){
//   output_instance.start_loading(`Writing manipulated file...`);
//   util_instance.fs.write_file(filename, text);
//   output_instance.done_verbose_log(`File replaced [${filename}].`, 'alias');
// }
// export const alias = {
//   run: (options?:Partial<Options>):void => {
//     common.init_run(options);
//     alias.command();
//   },
//   command: ():void => {
//     output_instance.start_loading('Updating aliases...');
//     util.read_rc_file();
//     const tsconfig_path_server = `${conf.root}/.uranio/server/tsconfig.json`;
//     const tsconfig_path_client = `${conf.root}/.uranio/client/tsconfig.json`;
//     const aliases_server = get_aliases(tsconfig_path_server);
//     const aliases_client = get_aliases(tsconfig_path_client);
//     _replace_aliases_server(aliases_server);
//     _replace_aliases_client(aliases_client);
//     output_instance.end_log(`Aliases updated.`);
//   },
//   include: ():void => {
//     const is_hidden = conf.hide;
//     conf.hide = true;
//     alias.command();
//     conf.hide = is_hidden;
//     output_instance.done_log(`Aliases updated.`, 'alias');
//   }
// };
//# sourceMappingURL=alias.js.map