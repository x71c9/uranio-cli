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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alias = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const tsm = __importStar(require("ts-morph"));
exports.alias = {
    run: (options) => {
        common.init_run(options);
        exports.alias.command();
    },
    command: () => {
        output.start_loading('Updating aliases...');
        util.read_rc_file();
        const aliases = _get_aliases();
        _replace_aliases(aliases);
        output.end_log(`Aliases updated.`);
    },
    include: () => {
        const is_hidden = defaults_1.conf.hide;
        defaults_1.conf.hide = true;
        exports.alias.command();
        defaults_1.conf.hide = is_hidden;
        output.done_log('alias', `Aliases updated.`);
    }
};
const _project_option = {
    manipulationSettings: {
        indentationText: tsm.IndentationText.Tab,
        quoteKind: tsm.QuoteKind.Single,
        newLineKind: tsm.NewLineKind.LineFeed
    }
};
function _get_aliases() {
    const data = fs_1.default.readFileSync(`${defaults_1.conf.root}/tsconfig.json`, 'utf8');
    const tsconf_data = JSON.parse(data);
    return tsconf_data['compilerOptions']['paths'];
}
function _replace_modified_file(text, filename) {
    output.start_loading(`Writing manipulated file...`);
    fs_1.default.writeFileSync(filename, text);
    output.done_verbose_log(`alias`, `File replaced [${filename}].`);
}
function _replace_aliases(aliases) {
    _traverse_ts(`${defaults_1.conf.root}/.uranio/`, aliases);
}
function _replace_file_aliases(filepath, aliases) {
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
    const { found, source } = _change_to_relative_imports(sourceFile, aliases);
    sourceFile = source;
    if (found === true) {
        const modified = sourceFile.print();
        _replace_modified_file(modified, filepath);
        util.pretty(filepath);
    }
}
function _change_to_relative_imports(sourceFile, aliases) {
    let found = false;
    const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
    for (const import_decl of import_decls) {
        if (_change_to_realtive_import(import_decl, aliases)) {
            found = true;
        }
    }
    return { found, source: sourceFile };
}
function _change_to_realtive_import(node, aliases) {
    let found = false;
    const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
    if (str_lit) {
        const text = str_lit.getText();
        const module_name = text.substr(1, text.length - 2);
        if (module_name in aliases) {
            found = true;
            output.start_loading(`Changing relative imports...`);
            const node_file_path = node.getSourceFile().getFilePath();
            const node_file_dir = path_1.default.parse(node_file_path).dir;
            const alias = aliases[module_name][0];
            let relative_path = path_1.default.relative(node_file_dir, `${defaults_1.conf.root}/${alias}`);
            if (relative_path === '') {
                relative_path = './index';
            }
            const append = (alias.slice(-1) === '/' && relative_path !== './index') ? '/' : '';
            const prepend = (relative_path.charAt(0) !== '.') ? './' : '';
            const replace = `${prepend}${relative_path}${append}`;
            str_lit.replaceWithText(`'${replace}'`);
            output.verbose_log(`alias`, `Changed [${module_name}] to [${replace}].`);
        }
    }
    return found;
}
function _traverse_ts(directory, aliases) {
    fs_1.default.readdirSync(directory).forEach((filename) => {
        const full_path = path_1.default.resolve(directory, filename);
        if (fs_1.default.statSync(full_path).isDirectory() && filename != '.git') {
            return _traverse_ts(full_path, aliases);
        }
        else if (filename.split('.').pop() === 'ts') {
            _replace_file_aliases(full_path, aliases);
        }
    });
}
//# sourceMappingURL=alias.js.map