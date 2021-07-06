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
exports.alias = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common = __importStar(require("./common"));
const tsm = __importStar(require("ts-morph"));
exports.alias = {
    run: (options) => __awaiter(void 0, void 0, void 0, function* () {
        common.init_run(options);
        yield exports.alias.command();
    }),
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.start_loading('Updating aliases...');
        util.read_rc_file();
        const aliases = _get_aliases();
        // _replace_aliases(aliases);
        const filename = `${defaults_1.conf.root}/.uranio/lib/service/express/new.ts`;
        const modified = _replace_file_aliases(filename, aliases);
        console.log(modified);
        // _replace_modified_file(modified, filename);
        output.end_log(`Aliases updated.`);
    })
};
const _project_option = {
    manipulationSettings: {
        indentationText: tsm.IndentationText.Tab,
        quoteKind: tsm.QuoteKind.Single,
    }
};
function _get_aliases() {
    const data = fs_1.default.readFileSync(`${defaults_1.conf.root}/tsconfig.json`, 'utf8');
    const tsconf_data = JSON.parse(data);
    return tsconf_data['compilerOptions']['paths'];
}
// function _replace_modified_file(text:string, filename:string){
//   output.start_loading(`Writing manipulated file...`);
//   fs.writeFileSync(filename, text);
//   output.done_log(`alias`, `File replaced to [].`);
// }
// function _replace_aliases(aliases:Aliases){
//   _traverse_ts(`${conf.root}/.uranio/`, aliases);
// }
function _replace_file_aliases(filepath, aliases) {
    const _project = new tsm.Project(_project_option);
    let sourceFile = _project.addSourceFileAtPath(`${filepath}`);
    sourceFile = _change_to_relative_imports(sourceFile, aliases);
    return sourceFile.print();
    // console.log(sourceFile);
}
function _change_to_relative_imports(sourceFile, aliases) {
    output.start_loading(`Changing relative imports...`);
    const import_decls = sourceFile.getChildrenOfKind(tsm.ts.SyntaxKind.ImportDeclaration);
    for (const import_decl of import_decls) {
        _change_to_realtive_import(import_decl, aliases);
    }
    output.done_log('impr', 'Changed relative imports.');
    return sourceFile;
}
function _change_to_realtive_import(node, aliases) {
    output.start_loading(`Changing relative imports...`);
    const str_lit = node.getFirstChildByKind(tsm.ts.SyntaxKind.StringLiteral);
    if (str_lit) {
        const text = str_lit.getText();
        const module_name = text.substr(1, text.length - 2);
        if (module_name in aliases) {
            const realtive_path = path_1.default.relative(node.getSourceFile().getFilePath(), `${defaults_1.conf.root}/${aliases[module_name][0]}`);
            str_lit.replaceWithText(`'${realtive_path}'`);
            output.verbose_log(`alias`, `Changed [${module_name}] to [${realtive_path}].`);
        }
    }
    return node;
}
// function _traverse_ts(directory:string, aliases:Aliases) {
//   fs.readdirSync(directory).forEach((filename) => {
//     const full_path = path.resolve(directory, filename);
//     if (fs.statSync(full_path).isDirectory() && filename != '.git') {
//       return _traverse_ts(full_path, aliases);
//     }else if(filename.split('.').pop() === 'ts'){
//       _replace_file_aliases(full_path, aliases);
//     }
//   });
// }
// function _delint(sourceFile: ts.SourceFile, aliases:Aliases, filepath:string) {
//   delintNode(sourceFile);
//   function delintNode(node: ts.Node) {
//     switch (node.kind) {
//       case ts.SyntaxKind.ImportDeclaration:{
//         const children = node.getChildren();
//         for(let i = 0; i < children.length; i++){
//           let child = children[i];
//           if(children[i].kind === ts.SyntaxKind.StringLiteral){
//             const string_literal = child.getText();
//             const module_name = string_literal.substr(1, string_literal.length - 2);
//             if(module_name in aliases){
//               const realtive_path = path.relative(filepath, `${conf.root}/${aliases[module_name][0]}`);
//               const new_string_literal = ts.factory.createStringLiteral(`'${realtive_path}'`);
//               child = new_string_literal;
//             }
//           }
//         }
//         break;
//       }
//     }
//     ts.forEachChild(node, delintNode);
//   }
//   // function report(node: ts.Node, message: string) {
//   //   const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
//   //   console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
//   // }
//   return sourceFile;
// }
//# sourceMappingURL=alias.js.map