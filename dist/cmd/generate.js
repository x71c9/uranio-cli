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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_register = exports.generate = void 0;
const path_1 = __importDefault(require("path"));
const esbuild = __importStar(require("esbuild"));
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const common_1 = require("./common");
// import {valid_hooks_repos} from '../types';
let output_instance;
let util_instance;
let generate_params = defaults_1.default_params;
let register_path_server = `node_modules/uranio/src/server/register.ts`;
let register_path_client = `node_modules/uranio/src/client/register.ts`;
let compiled_register_path_server = `node_modules/uranio/dist/server/register.js`;
let compiled_register_path_client = `node_modules/uranio/dist/client/register.js`;
function generate(params, is_included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_generate(params);
        const generate_cmd = `yarn uranio-generate-${generate_params.repo}`;
        util_instance.spawn.verbose_log(generate_cmd, 'generate', 'generating');
        if (!is_included) {
            output_instance.end_log('Generate completed.');
        }
    });
}
exports.generate = generate;
function generate_register(params, is_included = false) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_generate(params);
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
        if (!is_included) {
            output_instance.end_log('Generate register completed.');
        }
    });
}
exports.generate_register = generate_register;
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
function _init_generate(params, must_init = true) {
    generate_params = (0, common_1.merge_params)(params);
    output_instance = output.create(generate_params);
    util_instance = util.create(generate_params, output_instance);
    if (must_init) {
        // util_instance.must_be_initialized();
    }
}
//# sourceMappingURL=generate.js.map