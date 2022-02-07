"use strict";
/**
 * Generate command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const esbuild = __importStar(require("esbuild"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let generate_params = defaults_1.default_params;
function generate(params, is_included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_generate(params);
        output_instance.start_loading(`Generating types...`);
        yield _generate_types();
        if (!is_included) {
            output_instance.end_log('Generating types completed.');
        }
    });
}
exports.generate = generate;
function _generate_types() {
    return __awaiter(this, void 0, void 0, function* () {
        _create_register();
        output_instance.verbose_log(`Started generating types.`, 'types');
        yield _promise_generate_types();
        output_instance.done_log(`Generated types.`, 'types');
    });
}
function _esbuild_types() {
    output_instance.verbose_log(`Started transpiling generate script.`, 'types');
    esbuild.buildSync({
        entryPoints: [`${generate_params.root}/${defaults_1.defaults.folder}/generate.ts`],
        outfile: `${generate_params.root}/${defaults_1.defaults.folder}/generate.js`,
        bundle: true,
        platform: 'node',
        sourcemap: false,
        minify: true
    });
    output_instance.done_log(`Transpiled generate script.`, 'types');
}
function _promise_generate_types() {
    _esbuild_types();
    return new Promise((resolve, reject) => {
        const generate_path_js = `${generate_params.root}/${defaults_1.defaults.folder}/generate.js`;
        const flags = ``;
        const tsn_cmd = `node ${generate_path_js} ${flags}`;
        util_instance.spawn.spin_and_verbose_log(tsn_cmd, 'tsnode', 'running trinspiled generate file', undefined, resolve, reject);
    });
    // return new Promise((resolve, reject) => {
    //   const generate_path = `${generate_params.root}/${defaults.folder}/generate.ts`;
    //   const flags = `--bundle --platform=node `;
    //   const tsn_cmd = `npx esbuild ${generate_path} ${flags}`;
    //   util_instance.spawn.spin_and_verbose_log(
    //     tsn_cmd, 'tsnode', 'generating types', undefined, resolve, reject
    //   );
    // });
    // return new Promise((resolve, reject) => {
    //   const generate_path = `${generate_params.root}/${defaults.folder}/generate.ts`;
    //   const flags = `--skip-project --transpile-only`;
    //   const tsn_cmd = `npx ts-node ${generate_path} ${flags}`;
    //   util_instance.spawn.spin_and_verbose_log(
    //     tsn_cmd, 'tsnode', 'generating types', undefined, resolve, reject
    //   );
    // })
}
function _create_register() {
    let text = '';
    text += '/**\n';
    text += ' * Auto-generated uranio register file.\n';
    text += ' *\n';
    text += ' */\n\n';
    const atom_dir = `${generate_params.root}/src/atoms`;
    const atom_folders = util_instance.fs.read_dir(atom_dir);
    for (const folder of atom_folders) {
        text += `export * from '../src/atoms/${folder}/';\n`;
        output_instance.verbose_log(`Exported atom [${folder}].`, `atms`);
    }
    text += `export {};\n`;
    const register_path = `${generate_params.root}/${defaults_1.defaults.folder}/register.ts`;
    if (util_instance.fs.exists(register_path)) {
        util_instance.fs.remove_file(register_path);
    }
    util_instance.fs.write_file(register_path, text);
}
function _init_generate(params) {
    generate_params = (0, common_1.merge_params)(params);
    output_instance = output.create(generate_params);
    util_instance = util.create(generate_params, output_instance);
    util_instance.must_be_initialized();
}
//# sourceMappingURL=generate.js.map