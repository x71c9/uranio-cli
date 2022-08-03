"use strict";
/**
 * Deinit command module
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deinit = void 0;
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const docker = __importStar(require("./docker"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let deinit_params = defaults_1.default_params;
async function deinit(params) {
    deinit_params = (0, common_1.merge_params)(params);
    output_instance = output.create(deinit_params);
    util_instance = util.create(deinit_params, output_instance);
    if (!util_instance.is_initialized()) {
        return;
    }
    await _reset_package_json();
    await _remove_dockers();
    _delete_files();
    output_instance.end_log(`Deinitialization completed.`);
}
exports.deinit = deinit;
async function _remove_dockers() {
    if (!util_instance.is_initialized()) {
        output_instance.warn_log(`Uranio was not initliazed or is missing ${defaults_1.defaults.init_filepath} file.`);
        output_instance.warn_log(`Some build artifacts might be still present.`);
        return;
    }
    await docker.tmp_remove(deinit_params, true);
    await docker.db_stop(deinit_params, true);
    await docker.db_remove(deinit_params, true);
    await docker.network_remove(deinit_params, true);
    await docker.stop(deinit_params, true);
    await docker.remove(deinit_params, true);
    await docker.unbuild(deinit_params, true);
    await docker.prune(deinit_params, true);
}
async function _delete_files() {
    util_instance.fs.remove_directory(`${deinit_params.root}/.tmp`);
    util_instance.fs.remove_directory(`${deinit_params.root}/dist`);
    util_instance.fs.remove_directory(`${deinit_params.root}/node_modules`);
    util_instance.fs.remove_file(`${deinit_params.root}/tsconfig.json`);
    util_instance.fs.remove_file(`${deinit_params.root}/sample.env`);
    // util_instance.fs.remove_file(`${deinit_params.root}/uranio.toml`);
    util_instance.fs.remove_file(`${deinit_params.root}/.eslintrc.js`);
    util_instance.fs.remove_file(`${deinit_params.root}/.eslintignore`);
    util_instance.fs.remove_file(`${deinit_params.root}/.stylelintrc.json`);
    util_instance.fs.remove_file(`${deinit_params.root}/yarn.lock`);
    util_instance.fs.remove_file(`${deinit_params.root}/yarn-error.log`);
    util_instance.fs.remove_file(`${deinit_params.root}/package-lock.json`);
    util_instance.fs.remove_file(`${deinit_params.root}/netlify.toml`);
    util_instance.fs.remove_directory(`${deinit_params.root}/.netlify`);
    util_instance.fs.remove_directory(`${deinit_params.root}/${defaults_1.defaults.folder}`);
    // util_instance.fs.remove_file(`${deinit_params.root}/${defaults.init_filepath}`);
}
async function _reset_package_json() {
    // _remove_package_aliases();
    _remove_package_scripts();
    _remove_package_resolutions();
    const pack_data = util_instance.cmd.get_package_data(`${deinit_params.root}/package.json`);
    // await util_instance.cmd.uninstall_dep('patch-package', 'patch');
    // await util_instance.cmd.uninstall_dep('postinstall-postinstall', 'post');
    await util_instance.cmd.uninstall_uranio(pack_data);
    await util_instance.cmd.uninstall_core_dep(pack_data);
    await util_instance.cmd.uninstall_api_dep(pack_data);
    await util_instance.cmd.uninstall_trx_dep(pack_data);
    await util_instance.cmd.uninstall_adm_dep(pack_data);
}
// function _remove_package_aliases(){
//   output_instance.start_loading('Removing package.json aliases...');
//   const package_json_path = `${deinit_params.root}/package.json`;
//   const data = util_instance.fs.read_file(package_json_path, 'utf8');
//   try{
//     const uranio_keys = [
//       'uranio',
//       'uranio-books',
//       'uranio-core',
//       'uranio-api',
//       'uranio-trx',
//       'uranio-adm'
//     ];
//     const package_data = urn_util.json.clean_parse(data);
//     if(typeof package_data['_moduleAliases'] === 'object'){
//       const module_aliases = { ...package_data['_moduleAliases']};
//       for(const [key, _value] of Object.entries(module_aliases)){
//         if(uranio_keys.includes(key)){
//           delete module_aliases[key];
//         }
//       }
//       package_data['_moduleAliases'] = module_aliases;
//       if(Object.keys(module_aliases).length === 0){
//         delete package_data['_moduleAliases'];
//       }
//     }
//     try{
//       util_instance.fs.write_file(
//         package_json_path,
//         JSON.stringify(package_data, null, '\t')
//       );
//       output_instance.done_log(`Updated package.json module aliases.`, 'alias');
//     }catch(ex){
//       output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
//     }
//   }catch(ex){
//     output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
//   }
// }
function _remove_package_scripts() {
    output_instance.start_loading('Removing scripts...');
    const package_json_path = `${deinit_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        const old_scripts = package_data['scripts'] || {};
        for (const [key, value] of Object.entries(old_scripts)) {
            if (urn_lib_1.urn_util.object.has_key(common_1.package_scripts, key)
                && common_1.package_scripts[key] === value) {
                delete old_scripts[key];
            }
            if (urn_lib_1.urn_util.object.has_key(common_1.adm_package_scripts, key)
                && common_1.adm_package_scripts[key] === value) {
                delete old_scripts[key];
            }
        }
        package_data['scripts'] = old_scripts;
        try {
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json scripts.`);
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`);
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`);
    }
}
function _remove_package_resolutions() {
    output_instance.start_loading('Removing resolutions...');
    const package_json_path = `${deinit_params.root}/package.json`;
    const package_data = util_instance.cmd.get_package_data(package_json_path);
    const uranio_resolutions = [
        '@oclif/plugin-help',
        'colors',
    ];
    const old_resolutions = package_data['resolutions'] || {};
    for (const [key, _value] of Object.entries(old_resolutions)) {
        if (uranio_resolutions.includes(key)) {
            delete old_resolutions[key];
        }
    }
    package_data['resolutions'] = old_resolutions;
    if (Object.keys(old_resolutions).length === 0) {
        delete package_data['resolutions'];
    }
    try {
        util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
        output_instance.done_log(`Updated package.json resolutions.`);
    }
    catch (ex) {
        output_instance.error_log(`Cannot update ${package_json_path}.`);
    }
}
//# sourceMappingURL=deinit.js.map