"use strict";
/**
 * Deinit command module
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
exports.deinit = void 0;
const urn_lib_1 = require("urn-lib");
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const docker = __importStar(require("./docker"));
const common_1 = require("./common");
let output_instance;
let util_instance;
let deinit_params = defaults_1.default_params;
function deinit(params) {
    return __awaiter(this, void 0, void 0, function* () {
        deinit_params = (0, common_1.merge_params)(params);
        output_instance = output.create(deinit_params);
        util_instance = util.create(deinit_params, output_instance);
        yield _reset_package_json();
        yield _remove_dockers();
        _delete_files();
        output_instance.end_log(`Deinitialization completed.`);
    });
}
exports.deinit = deinit;
function _remove_dockers() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!util_instance.is_initialized()) {
            output_instance.warn_log(`Uranio was not initliazed or is missing \`uranio.json\` file.`);
            output_instance.warn_log(`Some build artifacts might be still present.`);
            return;
        }
        yield docker.tmp_remove(deinit_params, true);
        yield docker.db_stop(deinit_params, deinit_params.db, true);
        yield docker.db_remove(deinit_params, deinit_params.db, true);
        yield docker.network_remove(deinit_params, true);
        yield docker.stop(deinit_params, true);
        yield docker.remove(deinit_params, true);
        yield docker.unbuild(deinit_params, true);
    });
}
function _delete_files() {
    return __awaiter(this, void 0, void 0, function* () {
        util_instance.fs.remove_directory(`${deinit_params.root}/.tmp`);
        util_instance.fs.remove_directory(`${deinit_params.root}/dist`);
        util_instance.fs.remove_directory(`${deinit_params.root}/node_modules`);
        util_instance.fs.remove_file(`${deinit_params.root}/tsconfig.json`);
        util_instance.fs.remove_file(`${deinit_params.root}/sample.env`);
        util_instance.fs.remove_file(`${deinit_params.root}/.eslintrc.js`);
        util_instance.fs.remove_file(`${deinit_params.root}/.eslintignore`);
        util_instance.fs.remove_file(`${deinit_params.root}/.stylelintrc.json`);
        util_instance.fs.remove_file(`${deinit_params.root}/yarn.lock`);
        util_instance.fs.remove_file(`${deinit_params.root}/yarn-error.log`);
        util_instance.fs.remove_file(`${deinit_params.root}/package-lock.json`);
        util_instance.fs.remove_file(`${deinit_params.root}/netlify.toml`);
        util_instance.fs.remove_directory(`${deinit_params.root}/.netlify`);
        util_instance.fs.remove_directory(`${deinit_params.root}/${defaults_1.defaults.folder}`);
        util_instance.fs.remove_file(`${deinit_params.root}/${defaults_1.defaults.json_filename}`);
    });
}
function _reset_package_json() {
    return __awaiter(this, void 0, void 0, function* () {
        _remove_package_aliases();
        _remove_package_scripts();
        _remove_package_resolutions();
        if (!util_instance.is_initialized()) {
            return;
        }
        const pack_data = util_instance.cmd.get_package_data(`${deinit_params.root}/package.json`);
        yield util_instance.cmd.uninstall_core_dep(pack_data);
        yield util_instance.cmd.uninstall_api_dep(pack_data);
        yield util_instance.cmd.uninstall_trx_dep(pack_data);
        yield util_instance.cmd.uninstall_adm_dep(pack_data);
    });
}
function _remove_package_aliases() {
    output_instance.start_loading('Removinf package.json aliases...');
    const package_json_path = `${deinit_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const uranio_keys = [
            'uranio',
            'uranio-books',
            'uranio-core',
            'uranio-api',
            'uranio-trx',
            'uranio-adm'
        ];
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        if (typeof package_data['_moduleAliases'] === 'object') {
            const module_aliases = Object.assign({}, package_data['_moduleAliases']);
            for (const [key, _value] of Object.entries(module_aliases)) {
                if (uranio_keys.includes(key)) {
                    delete module_aliases[key];
                }
            }
            package_data['_moduleAliases'] = module_aliases;
            if (Object.keys(module_aliases).length === 0) {
                delete package_data['_moduleAliases'];
            }
        }
        try {
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json module aliases.`, 'alias');
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
    }
}
function _remove_package_scripts() {
    output_instance.start_loading('Removing scripts...');
    const package_json_path = `${deinit_params.root}/package.json`;
    const data = util_instance.fs.read_file(package_json_path, 'utf8');
    try {
        const uranio_scripts = [
            'build',
            'build:server',
            'build:client',
            'dev',
            'dev:server',
            'dev:client'
        ];
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        const old_scripts = package_data['scripts'] || {};
        for (const [key, _value] of Object.entries(old_scripts)) {
            if (uranio_scripts.includes(key)) {
                delete old_scripts[key];
            }
        }
        package_data['scripts'] = old_scripts;
        try {
            util_instance.fs.write_file(package_json_path, JSON.stringify(package_data, null, '\t'));
            output_instance.done_log(`Updated package.json scripts.`, 'alias');
        }
        catch (ex) {
            output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
        }
    }
    catch (ex) {
        output_instance.error_log(`Cannot parse ${package_json_path}.`, 'alias');
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
        output_instance.done_log(`Updated package.json resolutions.`, 'alias');
    }
    catch (ex) {
        output_instance.error_log(`Cannot update ${package_json_path}.`, 'alias');
    }
}
//# sourceMappingURL=deinit.js.map