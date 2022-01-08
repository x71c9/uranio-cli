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
        yield _remove_dockers();
        yield _delete_files();
        output_instance.end_log(`Deinitialization completed.`);
    });
}
exports.deinit = deinit;
function _remove_dockers() {
    return __awaiter(this, void 0, void 0, function* () {
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
        util_instance.fs.remove_directory(`${deinit_params.root}/${defaults_1.defaults.folder}`);
        util_instance.fs.remove_file(`${deinit_params.root}/${defaults_1.defaults.json_filename}`);
        util_instance.fs.remove_directory(`${deinit_params.root}/node_modules`);
        util_instance.fs.remove_file(`${deinit_params.root}/tsconfig.json`);
        util_instance.fs.remove_file(`${deinit_params.root}/sample.env`);
        util_instance.fs.remove_file(`${deinit_params.root}/.eslintrc.js`);
        util_instance.fs.remove_file(`${deinit_params.root}/.eslintignore`);
        util_instance.fs.remove_file(`${deinit_params.root}/.stylelintrc.json`);
        util_instance.fs.remove_file(`${deinit_params.root}/yarn.lock`);
        util_instance.fs.remove_file(`${deinit_params.root}/yarn-error.log`);
        util_instance.fs.remove_file(`${deinit_params.root}/package-lock.json`);
    });
}
//# sourceMappingURL=deinit.js.map