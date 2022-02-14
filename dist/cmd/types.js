"use strict";
/**
 * Generate types command module
 *
 * This command will create 3 register files that import all the atom
 * definitions in the `/src/atoms` folder.
 * The 3 files are:
 * - `/.uranio/generate/src/register.ts`
 * - `/.uranio/server/src/__urn_register.ts`
 * - `/.uranio/client/src/__urn_register.ts`
 *
 * NOTE:
 * Atoms must be defined with the following structure:
 * `/src/atoms/[atom_name]/index.ts`
 *
 * It will then transpile with `esbuild` the `/.uranio/generate/src/generate.ts`
 * file that is importing the `register.ts` file created.
 *
 * NOTE:
 * The file `/.uranio/generate/src/generate.ts` is created by the `init` command.
 *
 * After the transpilation it will run with Node the transpiled file:
 * ```
 * node /.uranio/generate/dist/generate.js
 * ```
 * This will create the declaration file with the Atom Types.
 *
 * NOTE:
 * In order for the script to run it needs the schema file:
 * ```
 * /.uranio/generate/src/schema/index.d.ts
 * ```
 * that is creted by the `init` command.
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
exports.types = void 0;
const esbuild = __importStar(require("esbuild"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let types_params = defaults_1.default_params;
function types(params, is_included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_types(params);
        output_instance.start_loading(`Generating types...`);
        _create_register_files();
        yield _generate_types();
        _copy_generated_types();
        if (!is_included) {
            output_instance.end_log('Generating types completed.');
        }
    });
}
exports.types = types;
function _create_register_files() {
    _create_generate_register();
    _copy_server_client_registers();
}
function _copy_generated_types() {
    const dot_dir = `${types_params.root}/${defaults_1.defaults.folder}`;
    const generated_types = `${dot_dir}/generate/src/schema/index.d.ts`;
    const dest_server = `${dot_dir}/server/src/schema/index.d.ts`;
    const dest_client = `${dot_dir}/client/src/schema/index.d.ts`;
    util_instance.fs.copy_file(generated_types, dest_server);
    util_instance.fs.copy_file(generated_types, dest_client);
}
function _generate_types() {
    return __awaiter(this, void 0, void 0, function* () {
        output_instance.verbose_log(`Started generating types.`, 'types');
        yield _promise_generate_types();
        output_instance.done_log(`Generated types.`, 'types');
    });
}
function _esbuild_types() {
    output_instance.verbose_log(`Started transpiling generate script.`, 'types');
    esbuild.buildSync({
        entryPoints: [`${types_params.root}/${defaults_1.defaults.folder}/generate/src/generate.ts`],
        outfile: `${types_params.root}/${defaults_1.defaults.folder}/generate/dist/generate.js`,
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
        const generate_arg1 = ` urn_generate_base_schema=${types_params.root}/${defaults_1.defaults.folder}/generate/src/schema/index.d.ts`;
        const generate_arg2 = ` urn_generate_output=${types_params.root}/${defaults_1.defaults.folder}/generate/src/schema/index.d.ts`;
        const generate_path_js = `${types_params.root}/${defaults_1.defaults.folder}/generate/dist/generate.js${generate_arg1}${generate_arg2}`;
        const flags = ``;
        const tsn_cmd = `node ${generate_path_js} ${flags}`;
        util_instance.spawn.spin_and_verbose_log(tsn_cmd, 'tsnode', 'running transpiled generate.js file', undefined, resolve, reject);
    });
}
function _register_text() {
    let text = '';
    text += '/**\n';
    text += ' * Auto-generated uranio generate register file.\n';
    text += ' *\n';
    text += ' */\n\n';
    const atom_dir = `${types_params.root}/src/atoms`;
    const atom_folders = util_instance.fs.read_dir(atom_dir);
    for (const folder of atom_folders) {
        if (!util_instance.fs.exists(`${atom_dir}/${folder}/index.ts`)) {
            continue;
        }
        text += `export * from './atoms/${folder}/index';\n`;
        output_instance.verbose_log(`Exported atom [${folder}].`, `atms`);
    }
    text += `export {};\n`;
    return text;
}
function _create_generate_register() {
    output_instance.verbose_log(`Started creating register.ts for generate.ts file.`, 'types');
    const text = _register_text();
    const dot_dir = `${types_params.root}/${defaults_1.defaults.folder}`;
    const register_path_root = `${dot_dir}/generate/src/register.ts`;
    if (util_instance.fs.exists(register_path_root)) {
        util_instance.fs.remove_file(register_path_root);
    }
    util_instance.fs.write_file(register_path_root, text);
    output_instance.done_log(`Created register.ts for generate.ts file.`, 'types');
}
function _copy_server_client_registers() {
    output_instance.verbose_log(`Started copying server client register files.`, 'types');
    const dot_dir = `${types_params.root}/${defaults_1.defaults.folder}`;
    const register_path_generate = `${dot_dir}/generate/src/register.ts`;
    const register_path_server = `${dot_dir}/server/src/__urn_register.ts`;
    const register_path_client = `${dot_dir}/client/src/__urn_register.ts`;
    if (util_instance.fs.exists(register_path_server)) {
        util_instance.fs.remove_file(register_path_server);
    }
    if (util_instance.fs.exists(register_path_client)) {
        util_instance.fs.remove_file(register_path_client);
    }
    util_instance.fs.copy_file(register_path_generate, register_path_server);
    util_instance.fs.copy_file(register_path_generate, register_path_client);
    output_instance.done_log(`Copied server client register files.`, 'types');
}
function _init_types(params) {
    types_params = (0, common_1.merge_params)(params);
    output_instance = output.create(types_params);
    util_instance = util.create(types_params, output_instance);
    util_instance.must_be_initialized();
}
//# sourceMappingURL=types.js.map