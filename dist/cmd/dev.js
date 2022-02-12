"use strict";
/**
 * Dev command module
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
exports.dev_client = exports.dev_server = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const esbuild = __importStar(require("esbuild"));
// import * as recast from 'recast';
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const generate_1 = require("./generate");
const defaults_1 = require("../conf/defaults");
// import {default_params} from '../conf/defaults';
const types_1 = require("../types");
const transpose_1 = require("./transpose");
// import {hooks} from './hooks';
const common_1 = require("./common");
const docker = __importStar(require("./docker"));
let output_instance;
let util_instance;
let dev_params = defaults_1.default_params;
// let watch_lib_scanned = false;
let watch_src_scanned = false;
// const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
function dev(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield docker.start(params);
        }
        else {
            _init_params(params);
            yield _init_dev();
            yield _dev_server();
            // if(valid_client_repos().includes(dev_params.repo)){
            //   await _dev_client();
            // }
        }
    });
}
exports.dev = dev;
function dev_server(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield docker.start(params);
        }
        else {
            _init_params(params);
            yield _init_dev();
            yield _dev_server();
        }
    });
}
exports.dev_server = dev_server;
function dev_client(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield docker.start(dev_params);
        }
        else {
            _init_params(params);
            if ((0, types_1.valid_client_repos)().includes(dev_params.repo)) {
                if (params.inside_ntl != true) {
                    yield _init_dev();
                }
                yield _dev_client();
            }
            else {
                output_instance.error_log(`The selected repo [${dev_params.repo}] has no client development.`);
            }
        }
    });
}
exports.dev_client = dev_client;
function _dev_server() {
    return __awaiter(this, void 0, void 0, function* () {
        _fix_mongodb_saslprep_requirement();
        // if(dev_params.deploy === 'netlify' && valid_deploy_repos().includes(dev_params.repo)){
        //   // _esbuild_netlify();
        //   const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/server`;
        //   const ts_cmd = `npx tsc -w --project ./tsconfig.json`;
        //   const cmd = `${cd_cmd} && ${ts_cmd}`;
        //   util_instance.spawn.log(cmd, 'tscw', 'developing server', tscw_color);
        // }else{ // this is valid also if the repo is core.
        _esbuild_server();
        const dotenv_part = ` -r dotenv/config`;
        const source_part = ` -r source-map-support/register`;
        const dotenv_after = ` dotenv_config_path=${dev_params.root}/.env`;
        const urn_lib_pre = ` urn_log_prefix_type=true`;
        // const node_cmd = `cd ${dev_params.root}/dist/server/ && npx nodemon --watch index.js -e ts ${dotenv_part}${source_part} index.js${dotenv_after}${urn_lib_pre}`;
        const node_cmd = `cd ${dev_params.root}/dist/server/ && npx nodemon --watch index.js -e ts ${dotenv_part}${source_part} index.js${dotenv_after}${urn_lib_pre}`;
        // const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/server`;
        const cd_cmd = `cd ${dev_params.root}`;
        const tsc_cmd = `${cd_cmd} && npx tsc -w`;
        // const tsc_cmd = `npx tsc -w`;
        util_instance.spawn.log(node_cmd, 'nodemon', 'developing server', tscw_color);
        util_instance.spawn.log(tsc_cmd, 'tscwatch', 'developing server', tscw_color);
        // }
    });
}
function _dev_client() {
    return __awaiter(this, void 0, void 0, function* () {
        // switch(dev_params.repo){
        //   case 'trx':{
        //     await _dev_trx_client();
        //     break;
        //   }
        //   case 'adm':{
        //     await _dev_client_adm();
        //   }
        // }
    });
}
// async function _dev_trx_client(){
//   if(dev_params.inside_ntl === true){
//     await _dev_trx_webpack_inside_netlify();
//   }else if(dev_params.deploy === 'express'){
//     await _dev_trx_webpack_express();
//   }else if(dev_params.deploy === 'netlify'){
//     await _dev_trx_webpack_netlify();
//   }
// }
// async function _dev_trx_webpack_inside_netlify(){
//   _update_nuxt_config();
//   if(!util_instance.fs.exists(`${dev_params.root}/dist/client`)){
//     util_instance.fs.create_directory(`${dev_params.root}/dist/client`);
//   }
//   util_instance.fs.copy_file(
//     `${dev_params.root}/${defaults.folder}/client/src/index.html`,
//     `${dev_params.root}/dist/client/index.html`,
//   );
//   const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/client`;
//   const nu_cmd = `npx webpack serve --open`;
//   const cmd = `${cd_cmd} && ${nu_cmd}`;
//   util_instance.spawn.log(cmd, 'webpack', 'developing client', nuxt_color);
// }
// async function _dev_trx_webpack_express(){
//   if(!util_instance.fs.exists(`${dev_params.root}/dist/client`)){
//     util_instance.fs.create_directory(`${dev_params.root}/dist/client`);
//   }
//   util_instance.fs.copy_file(
//     `${dev_params.root}/${defaults.folder}/client/src/index.html`,
//     `${dev_params.root}/dist/client/index.html`,
//   );
//   const client_env_string = util_instance.cmd.client_env_variables_to_command_string();
//   const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/client`;
//   const nu_cmd = `${client_env_string} npx webpack serve --open`;
//   const cmd = `${cd_cmd} && ${nu_cmd}`;
//   util_instance.spawn.log(cmd, 'webpack', 'developing client', nuxt_color);
// }
// async function _dev_trx_webpack_netlify(){
//   const cmd = `npx ntl dev`;
//   util_instance.spawn.log(cmd, 'ntlf', 'developing client', nuxt_color);
// }
// async function _dev_client_adm(){
//   if(dev_params.inside_ntl === true){
//     await _dev_admin_nuxt_inside_ntl();
//   }else if(dev_params.deploy === 'express'){
//     await _dev_admin_nuxt_express();
//   }else if(dev_params.deploy === 'netlify'){
//     await _dev_admin_nuxt_netlify();
//   }
// }
// function _update_nuxt_config(){
//   const dotenv = util_instance.cmd.read_dotenv();
//   const protocol = dotenv.URN_SERVICE_PROTOCOL || 'https';
//   const domain = dotenv.URN_SERVICE_DOMAIN || 'localhost';
//   const port = Number(dotenv.URN_SERVICE_PORT) || 7777;
//   const prefix = dotenv.URN_PREFIX_API || '/uranio/api';
//   const service_url = `${protocol}://${domain}:${port}${prefix}`;
//   const client_protocol = dotenv.URN_CLIENT_PROTOCOL || 'http';
//   const client_domain = dotenv.URN_CLIENT_DOMAIN || 'localhost';
//   const client_port = Number(dotenv.URN_CLIENT_PORT) || 4444;
//   const client_url = `${client_protocol}://${client_domain}:${client_port}`;
//   let ts_ast = _nuxt_tree();
//   ts_ast = _update_nuxt_server(ts_ast, client_domain, client_port);
//   ts_ast = _update_nuxt_proxy(ts_ast, service_url);
//   ts_ast = _update_nuxt_build_hook(ts_ast, client_url);
//   _save_nuxt_config(ts_ast);
// }
// function _save_nuxt_config(ts_ast:any){
//   const nuxt_config_path =
//     `${dev_params.root}/${defaults.folder}/client/nuxt.config.js`;
//   // const printed = recast.prettyPrint(ts_ast, {tabWidth: 2}).code;
//   const printed = recast.print(ts_ast, {useTabs: true}).code;
//   util_instance.fs.write_file(nuxt_config_path, printed);
// }
// function _nuxt_tree(){
//   const nuxt_config_path =
//     `${dev_params.root}/${defaults.folder}/client/nuxt.config.js`;
//   const source = util_instance.fs.read_file(nuxt_config_path);
//   return recast.parse(source, {
//     parser: require("recast/parsers/typescript")
//   });
// }
// function _get_nuxt_hook_console(url:string){
//   const b = recast.types.builders;
//   const len = url.length;
//   const lin = Array(len).fill('─').join('');
//   const spa = Array(len).fill(' ').join('');
//   let conso = '';
//   conso += `\t\t\t\tconsole.log('╭─────────────────────${lin}──╮');`;
//   conso += `\t\t\t\tconsole.log('│                     ${spa}  │');`;
//   conso += `\t\t\t\tconsole.log('│ Client listening on ${url}  │');`;
//   conso += `\t\t\t\tconsole.log('│                     ${spa}  │');`;
//   conso += `\t\t\t\tconsole.log('╰─────────────────────${lin}──╯');`;
//   const conso_ast = recast.parse(conso, {
//     parser: require("recast/parsers/typescript")
//   });
//   const all = conso_ast.program.body;
//   const expressions = [];
//   for(const node of all){
//     const n = node as recast.types.namedTypes.ExpressionStatement;
//     delete n.loc;
//     const exp = b.expressionStatement(n.expression);
//     expressions.push(exp);
//   }
//   return expressions;
// }
// function _update_nuxt_build_hook(ts_ast:any, client_url:string){
//   const all = ts_ast.program.body;
//   for(const node of all){
//     if(node.type === 'ExportDefaultDeclaration'){
//       const obj_declaration = node.declaration as recast.types.namedTypes.ObjectExpression;
//       if(obj_declaration.type === 'ObjectExpression'){
//         const config_props = obj_declaration.properties || []; // alias: {}, components: {}, ...
//         for(const prop of config_props){
//           if(prop.type === 'ObjectProperty' && prop.key.type === 'Identifier'){
//             if(prop.key.name === 'hooks' && prop.value.type === 'ObjectExpression'){
//               for(const hook_prop of prop.value.properties){
//                 if(hook_prop.type === 'ObjectProperty' && hook_prop.key.type === 'Identifier'){
//                   if(hook_prop.key.name === 'build' && hook_prop.value.type === 'ObjectExpression'){
//                     for(const build_prop of hook_prop.value.properties){
//                       if(build_prop.type === 'ObjectMethod' && build_prop.key.type === 'Identifier'){
//                         if(build_prop.key.name === 'compiled'){
//                           const conso_nodes = _get_nuxt_hook_console(client_url);
//                           // for(const cn of conso_nodes.reverse()){
//                           //   build_prop.body.body.unshift(cn);
//                           // }
//                           build_prop.body.body = conso_nodes;
//                           return ts_ast;
//                         }
//                       }
//                     }
//                     return ts_ast;
//                   }
//                 }
//               }
//               return ts_ast;
//             }
//           }
//         }
//       }
//       return ts_ast;
//     }
//   }
//   return ts_ast;
// }
// function _update_nuxt_server(ts_ast:any, domain:string, port:number){
//   const all = ts_ast.program.body;
//   for(const node of all){
//     if(node.type === 'ExportDefaultDeclaration'){
//       const obj_declaration = node.declaration as recast.types.namedTypes.ObjectExpression;
//       if(obj_declaration.type === 'ObjectExpression'){
//         const config_props = obj_declaration.properties || []; // alias: {}, components: {}, ...
//         for(const prop of config_props){
//           if(prop.type === 'ObjectProperty' && prop.key.type === 'Identifier'){
//             if(prop.key.name === 'server' && prop.value.type === 'ObjectExpression'){
//               prop.value.properties = _nuxt_server_props(domain, port);
//               return ts_ast;
//             }
//           }
//         }
//         _add_server_to_nuxt_properties(obj_declaration, domain, port);
//       }
//       return ts_ast;
//     }
//   }
//   return ts_ast;
// }
// function _update_nuxt_proxy(ts_ast:any, service_url:string){
//   const all = ts_ast.program.body;
//   for(const node of all){
//     if(node.type === 'ExportDefaultDeclaration'){
//       const obj_declaration = node.declaration as recast.types.namedTypes.ObjectExpression;
//       if(obj_declaration.type === 'ObjectExpression'){
//         const config_props = obj_declaration.properties || []; // alias: {}, components: {}, ...
//         for(const prop of config_props){
//           if(prop.type === 'ObjectProperty' && prop.key.type === 'Identifier'){
//             if(prop.key.name === 'proxy'){
//               _replace_proxy(prop, service_url);
//               return ts_ast;
//             }
//           }
//         }
//         _add_proxy_to_properties(obj_declaration, service_url);
//       }
//       return ts_ast;
//     }
//   }
//   return ts_ast;
// }
// function _replace_proxy(
//   prop:recast.types.namedTypes.ObjectProperty,
//   service_url:string
// ){ // proxy: {...}
//   if(prop.value.type === 'ObjectExpression'){ // {'/uranio/api': {...}}
//     const props = prop.value.properties;
//     for(const p of props){
//       if(p.type === 'ObjectProperty' && p.key.type === 'StringLiteral'){
//         if(p.key.value === '/uranio/api'){
//           p.value = _uranio_proxy_object_expression(service_url);
//           return true;
//         }
//       }
//     }
//     _add_uranio_proxy(prop, service_url);
//   }
// }
// function _add_uranio_proxy(
//   prop:recast.types.namedTypes.ObjectProperty,
//   service_url:string
// ){
//   const b = recast.types.builders;
//   if(prop.value.type === 'ObjectExpression'){ // {'/some/path': {...}}
//     const props = prop.value.properties;
//     const uranio_prop = b.objectProperty(
//       b.stringLiteral('/uranio/api'),
//       _uranio_proxy_object_expression(service_url)
//     );
//     props.push(uranio_prop);
//   }
// }
// function _uranio_proxy_object_expression(service_url:string)
//     :recast.types.namedTypes.ObjectExpression{
//   const b = recast.types.builders;
//   return b.objectExpression([
//     b.objectProperty(
//       b.identifier('target'),
//       b.stringLiteral(service_url)
//     ),
//     b.objectProperty(
//       b.identifier('pathRewrite'),
//       b.objectExpression([
//         b.objectProperty(
//           b.stringLiteral('^/uranio/api'),
//           b.stringLiteral('')
//         )
//       ])
//     )
//   ]);
// }
// function _nuxt_server_props(domain:string, port:number){
//   const host = (domain === 'localhost') ? '0.0.0.0' : domain;
//   const b = recast.types.builders;
//   return [
//     b.objectProperty(
//       b.identifier('host'),
//       b.stringLiteral(host)
//     ),
//     b.objectProperty(
//       b.identifier('port'),
//       b.numericLiteral(port)
//     )
//   ];
// }
// function _add_server_to_nuxt_properties(
//   obj_decl: recast.types.namedTypes.ObjectExpression,
//   domain: string,
//   port: number
// ){
//   const b = recast.types.builders;
//   const proxy_prop = b.objectProperty(
//     b.identifier('server'),
//     b.objectExpression(_nuxt_server_props(domain, port))
//   );
//   obj_decl.properties.push(proxy_prop);
// }
// function _add_proxy_to_properties(
//   obj_decl:recast.types.namedTypes.ObjectExpression,
//   service_url:string
// ){
//   const b = recast.types.builders;
//   const proxy_prop = b.objectProperty(
//     b.identifier('proxy'),
//     b.objectExpression([
//       b.objectProperty(
//         b.stringLiteral('/uranio/api'),
//         _uranio_proxy_object_expression(service_url)
//       )
//     ])
//   );
//   obj_decl.properties.push(proxy_prop);
// }
// async function _dev_admin_nuxt_inside_ntl(){
//   const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/client`;
//   const nu_cmd = `npx nuxt dev -c ./nuxt.config.js`;
//   const cmd = `${cd_cmd} && ${nu_cmd}`;
//   util_instance.spawn.log(cmd, 'nuxt', 'developing client', nuxt_color);
// }
// async function _dev_admin_nuxt_express(){
//   _update_nuxt_config();
//   const client_env_string = util_instance.cmd.client_env_variables_to_command_string();
//   const cd_cmd = `cd ${dev_params.root}/${defaults.folder}/client`;
//   const nu_cmd = `${client_env_string} npx nuxt dev -c ./nuxt.config.js`;
//   const cmd = `${cd_cmd} && ${nu_cmd}`;
//   util_instance.spawn.log(cmd, 'nuxt', 'developing client', nuxt_color);
// }
// async function _dev_admin_nuxt_netlify(){
//   const cmd = `npx ntl dev`;
//   util_instance.spawn.log(cmd, 'ntlf', 'developing client', nuxt_color);
// }
function _init_params(params) {
    params.spin = false;
    dev_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dev_params);
    util_instance = util.create(dev_params, output_instance);
    util_instance.must_be_initialized();
}
function _init_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, transpose_1.transpose)(dev_params, true);
        // if(valid_hooks_repos().includes(dev_params.repo)){
        //   hooks(dev_params, true);
        // }
        yield (0, generate_1.generate)(dev_params, true);
        _watch();
    });
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    const base_path = `${dev_params.root}/${defaults_1.defaults.folder}`;
    output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
        watch_src_scanned = true;
    }, (_event, _path) => __awaiter(this, void 0, void 0, function* () {
        // if(!_check_dot_file(dev_params, _path)){
        //   return false;
        // }
        const basename = path_1.default.basename(_path);
        const extension = path_1.default.extname(basename);
        const not_valid_extensions = ['.swp', '.swo'];
        if (not_valid_extensions.includes(extension) || not_valid_extensions.includes(basename)) {
            return false;
        }
        if (!watch_src_scanned) {
            if (_event === 'add' || _event === 'addDir') {
                output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
            }
            return false;
        }
        output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
        const base_path_generate = `${base_path}/generate/src`;
        const base_path_server = `${base_path}/server/src`;
        const base_path_client = `${base_path}/client/src`;
        const relative_path_to_src = _path.replace(`${dev_params.root}/src/`, '');
        const new_path_generate = `${base_path_generate}/${relative_path_to_src}`;
        const new_path_server = `${base_path_server}/${relative_path_to_src}`;
        const new_path_client = `${base_path_client}/${relative_path_to_src}`;
        if (_event === 'addDir') {
            if ((0, types_1.valid_admin_repos)().includes(dev_params.repo)
                && _path.includes(`${dev_params.root}/src/frontend`)) {
                // util_instance.fs.create_directory(
                //   `${base_path_client}/${defaults.repo_folder}/nuxt/${path.basename(_path)}`
                // );
            }
            else {
                if (_path.includes(`${dev_params.root}/src/atoms`)) {
                    util_instance.fs.create_directory(new_path_generate);
                }
                util_instance.fs.create_directory(new_path_server);
                util_instance.fs.create_directory(new_path_client);
            }
            output_instance.done_log(`[Src watch] Transposed dir [${_path}].`, 'wtch');
        }
        else if (_event === 'unlink' || _event === 'unlinkDir') {
            if (util_instance.fs.exists(new_path_server)) {
                if (util_instance.fs.is_directory(new_path_server)) {
                    util_instance.fs.remove_directory(new_path_server);
                }
                else {
                    util_instance.fs.remove_file(new_path_server);
                }
            }
            if (util_instance.fs.exists(new_path_client)) {
                if (util_instance.fs.is_directory(new_path_client)) {
                    util_instance.fs.remove_directory(new_path_client);
                }
                else {
                    util_instance.fs.remove_file(new_path_client);
                }
            }
            if (util_instance.fs.exists(new_path_generate)) {
                if (util_instance.fs.is_directory(new_path_generate)) {
                    util_instance.fs.remove_directory(new_path_generate);
                }
                else {
                    util_instance.fs.remove_file(new_path_generate);
                }
            }
            output_instance.done_log(`[src watch] Transposed [${_event}] [${_path}].`, 'wtch');
        }
        else {
            yield (0, transpose_1.transpose_one)(_path, dev_params, true);
            // if(valid_hooks_repos().includes(dev_params.repo)){
            //   hooks(dev_params, true);
            // }
            output_instance.done_log(`[src watch] Transposed [${_path}].`, 'wtch');
        }
        // if(
        //   valid_deploy_repos().includes(dev_params.repo)
        //   && dev_params.deploy === 'netlify'
        //   && _is_file_related_to_lambda_function(_path)
        // ){
        //   _replace_netlify_function_file();
        // }
        if (_event !== 'addDir' && _event !== 'unlinkDir') {
            yield (0, generate_1.generate)(dev_params, true);
            try {
                // if(dev_params.deploy === 'netlify'){
                //   // _esbuild_netlify();
                // }else{
                //   _esbuild_server();
                // }
                _esbuild_server();
            }
            catch (err) {
                const e = err;
                output_instance.error_log(e.message);
            }
        }
    }));
}
function _fix_mongodb_saslprep_requirement() {
    const dist_dir = `${dev_params.root}/dist`;
    if (!util_instance.fs.exists(dist_dir)) {
        util_instance.fs.create_directory(dist_dir);
    }
    const saslprep_filename = `code-points.mem`;
    const saslprep_module_dir = `${dev_params.root}/node_modules/saslprep/`;
    util_instance.fs.copy_file(`${saslprep_module_dir}/${saslprep_filename}`, `${dist_dir}/${saslprep_filename}`);
    // util_instance.fs.copy_file(
    //   `${saslprep_module_dir}/${saslprep_filename}`,
    //   `${dist_dir}/server/${saslprep_filename}`
    // );
}
// function _esbuild_netlify(){
//   esbuild.buildSync({
//     entryPoints: [`${dev_params.root}/${defaults.folder}/server/src/functions/api.ts`],
//     outfile: `${dev_params.root}/dist/server/functions/api.js`,
//     bundle: true,
//     platform: 'node',
//     sourcemap: true,
//     minify: true
//   });
// }
function _esbuild_server() {
    // esbuild.buildSync({
    //   entryPoints: [`${dev_params.root}/${defaults.folder}/server/src/index.ts`],
    //   outfile: `${dev_params.root}/dist/server/index.js`,
    //   bundle: true,
    //   platform: 'node',
    //   sourcemap: true,
    //   minify: true
    // });
    esbuild.buildSync({
        entryPoints: [`${dev_params.root}/${defaults_1.defaults.folder}/server/src/index.ts`],
        outfile: `${dev_params.root}/dist/server/index.js`,
        bundle: true,
        platform: 'node',
        sourcemap: true,
        minify: true
    });
}
// function _is_file_related_to_lambda_function(_path:string){
//   if(
//     valid_admin_repos().includes(dev_params.repo)
//     && _path.includes(`${dev_params.root}/src/frontend`)
//   ){
//     return false;
//   }
//   if(
//     valid_admin_repos().includes(dev_params.repo)
//     && _path.includes(`${dev_params.root}/src/uranio/nuxt`)
//   ){
//     return false;
//   }
//   return true;
// }
// function _replace_netlify_function_file(){
//   const api_file_path = `${dev_params.root}/.uranio/server/src/functions/api.ts`;
//   const result = util_instance.fs.read_file(api_file_path);
//   let new_content = result.toString();
//   const splitted = new_content.split(`\n`);
//   const comment = '// uranio autoupdate';
//   if(splitted[splitted.length - 2] !== comment){
//     new_content += `\n${comment}`;
//     new_content += `\n// 0`;
//   }else{
//     const last_update = splitted.splice(-1);
//     const last_update_split = last_update[0].split(' ');
//     const update_number = Number(last_update_split[1]);
//     new_content = splitted.join('\n');
//     new_content += `\n// ${update_number + 1}`;
//   }
//   util_instance.fs.write_file(api_file_path, new_content, 'utf8');
//   output_instance.done_verbose_log(`Replaced Netlify serverless function file.`, 'less');
// }
// function _check_dot_file(params:Partial<Params>, _path:string):boolean{
//   if(params.is_dot === true){
//     const do_not_dot_watch_paths = [
//       `${params.root}/src/books`,
//       `${params.root}/src/uranio/trx/hooks`,
//       `${params.root}/src/uranio/hooks`,
//     ];
//     for(const invalid_path of do_not_dot_watch_paths){
//       if(_path.indexOf(invalid_path) === 0){
//         return false;
//       }
//     }
//   }
//   return true;
// }
//# sourceMappingURL=dev.js.map