"use strict";
/**
 * Build command module
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
exports.build_panel = exports.build_server = exports.build = void 0;
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const common_1 = require("./common");
const transpose_1 = require("./transpose");
const generate_1 = require("./generate");
// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';
let output_instance;
let util_instance;
let build_params = defaults_1.default_params;
function build(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building...`);
        yield (0, transpose_1.transpose)(build_params);
        yield (0, generate_1.generate)(build_params);
        output_instance.done_log('Build completed.');
    });
}
exports.build = build;
function build_server(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building server...`);
        yield (0, transpose_1.transpose)(build_params);
        yield (0, generate_1.generate)(build_params);
        output_instance.done_log('Build server completed.');
    });
}
exports.build_server = build_server;
function build_panel(params) {
    return __awaiter(this, void 0, void 0, function* () {
        _init_build(params);
        output_instance.start_loading(`Building panel...`);
        yield (0, transpose_1.transpose)(build_params);
        yield (0, generate_1.generate)(build_params);
        const urn_lib_pre = ` urn_log_prefix_type=true`;
        const urn_config_path = ` -c ${build_params.root}/uranio.toml`;
        const cmd_server = `NODE_ENV=production yarn uranio-panel-${build_params.repo} generate ${urn_lib_pre}${urn_config_path}`;
        util_instance.spawn.log(cmd_server, 'start', 'starting panel');
        output_instance.done_log('Build panel completed.');
    });
}
exports.build_panel = build_panel;
function _init_build(params) {
    build_params = (0, common_1.merge_params)(params);
    output_instance = output.create(build_params);
    util_instance = util.create(build_params, output_instance);
}
//# sourceMappingURL=build.js.map