"use strict";
/**
 * Generate command module
 *
 * Method `generate` first create the register files with the user defined Atoms
 * by reading the src/atoms folder of the project.
 *
 * Then it runs the binary script exported from uranio repo:
 * - uranio-generate-adm
 * - uranio-generate-trx
 * - uranio-generate-api
 * - uranio-generate-core
 *
 * This scripts are defined inside uranio repos: src/server/generate.ts
 *
 * In general what they do is:
 *
 * - Generating the schema in node_modules/uranio-schema
 * - Generating the hooks in node_modules/uranio-trx
 * - Generating the hook types in node_modules/uranio-trx
 * - Generating the client_toml module in node_modules/uranio
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
exports.generate = void 0;
const path_1 = __importDefault(require("path"));
const esbuild = __importStar(require("esbuild"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const types_1 = require("../types");
const common_1 = require("./common");
let output_instance;
let util_instance;
let generate_params = defaults_1.default_params;
let register_path_server = `node_modules/uranio/src/server/register.ts`;
let register_path_client = `node_modules/uranio/src/client/register.ts`;
let compiled_register_path_server = `node_modules/uranio/dist/server/register.js`;
let compiled_register_path_client = `node_modules/uranio/dist/client/register.js`;
function generate(params, path, _event) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_generate(params);
        const src_path = `${generate_params.root}/src`;
        const atoms_src_dir = `${src_path}/atoms`;
        const server_src_dir = `${src_path}/server`;
        const admin_src_dir = `${src_path}/admin`;
        if (typeof path === 'undefined') {
            yield _generate_all();
            return;
        }
        if (path.includes(atoms_src_dir)) {
            yield _generate_atoms();
        }
        else if ((0, types_1.valid_deploy_repos)().includes(generate_params.repo)
            && path.includes(server_src_dir)) {
            // TODO
        }
        else if ((0, types_1.valid_admin_repos)().includes(generate_params.repo)
            && path.includes(admin_src_dir)) {
            // TODO
        }
        else if (path.includes(generate_params.config)) {
            yield _generate_client_config();
        }
        else {
            yield _generate_all();
        }
        output_instance.done_log('Generate completed.');
    });
}
exports.generate = generate;
function _generate_all() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _generate('');
        output_instance.done_verbose_log('Generate all completed.');
    });
}
function _generate_atoms() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _generate(`urn_command=atoms`);
    });
}
// async function _generate_schema(params:Params):Promise<void>{
//   await _generate(`urn_command=schema`, params);
// }
// async function _generate_hooks(params:Params):Promise<void>{
//   await _generate(`urn_command=hooks`, params);
//   await _generate(`urn_command=hook-types`, params);
// }
function _generate_client_config() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _generate(`urn_command=client-config`);
    });
}
function _generate(args) {
    return __awaiter(this, void 0, void 0, function* () {
        // _init_generate(params);
        yield _generate_register();
        yield new Promise((resolve, reject) => {
            const generate_cmd = `yarn uranio-generate-${generate_params.repo} ${args}`;
            util_instance.spawn.verbose_log(generate_cmd, 'generate', 'generating', undefined, resolve, reject);
        });
        // output_instance.done_log('Generate completed.');
    });
}
function _generate_register() {
    return __awaiter(this, void 0, void 0, function* () {
        const node_register_uranio_src = `node_modules/uranio/src`;
        const node_register_src_server = `${node_register_uranio_src}/server/register.ts`;
        const node_register_src_client = `${node_register_uranio_src}/client/register.ts`;
        const node_register_uranio_dist = `node_modules/uranio/dist`;
        const node_register_dist_server = `${node_register_uranio_dist}/server/register.js`;
        const node_register_dist_client = `${node_register_uranio_dist}/client/register.js`;
        register_path_server = `${generate_params.root}/${node_register_src_server}`;
        register_path_client = `${generate_params.root}/${node_register_src_client}`;
        compiled_register_path_server = `${generate_params.root}/${node_register_dist_server}`;
        compiled_register_path_client = `${generate_params.root}/${node_register_dist_client}`;
        _generate_server_register();
        _generate_client_register();
        _compile_register_server();
        _compile_register_client();
        output_instance.done_log('Generate register completed.');
    });
}
function _compile(src, dest) {
    esbuild.buildSync({
        entryPoints: [src],
        outfile: dest,
        platform: 'node',
        format: 'cjs',
        // sourcemap: true,
        // minify: true
    });
}
function _compile_register_server() {
    _compile(register_path_server, compiled_register_path_server);
}
function _compile_register_client() {
    _compile(register_path_client, compiled_register_path_client);
}
function _generate_server_register() {
    const text = _register_text('server');
    util_instance.fs.write_file(register_path_server, text);
}
function _generate_client_register() {
    const text = _register_text('client');
    util_instance.fs.write_file(register_path_client, text);
}
function _register_text(parent_folder) {
    let text = '';
    text += '/**\n';
    text += ' * Auto-generated uranio register file.\n';
    text += ' *\n';
    text += ' */\n\n';
    const atom_dir = `${generate_params.root}/src/atoms`;
    const atom_folders = util_instance.fs.read_dir(atom_dir);
    for (const atom_folder of atom_folders) {
        if (!util_instance.fs.exists(`${atom_dir}/${atom_folder}/index.ts`)) {
            continue;
        }
        text += `export * from '../atoms/${parent_folder}/${atom_folder}/index';\n`;
        if (util_instance.fs.exists(`${atom_dir}/${atom_folder}/routes`)) {
            const routes_folder = util_instance.fs.read_dir(`${atom_dir}/${atom_folder}/routes`);
            for (const route_file of routes_folder) {
                const base_route_filename = path_1.default.parse(route_file).name;
                text += `export * from '../atoms/${parent_folder}/${atom_folder}/routes/${base_route_filename}';\n`;
            }
        }
        output_instance.verbose_log(`Exported atom [${atom_folder}].`, `atms`);
    }
    text += `export {};\n`;
    return text;
}
function _init_generate(params) {
    generate_params = (0, common_1.merge_params)(params);
    output_instance = output.create(generate_params);
    util_instance = util.create(generate_params, output_instance);
}
//# sourceMappingURL=generate.js.map