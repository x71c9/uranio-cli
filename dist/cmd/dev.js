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
exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const output = __importStar(require("../output/index"));
const util = __importStar(require("../util/index"));
const generate_1 = require("./generate");
const defaults_1 = require("../conf/defaults");
const transpose_1 = require("./transpose");
const build_1 = require("./build");
const common_1 = require("./common");
const docker = __importStar(require("./docker"));
let output_instance;
let util_instance;
let dev_params = defaults_1.default_params;
// let watch_lib_scanned = false;
let watch_src_scanned = false;
// const nuxt_color = '#677cc7';
// const tscw_color = '#734de3';
const watc_color = '#687a6a';
function dev(params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (params.docker === true) {
            yield docker.start(params);
        }
        else {
            _init_params(params);
            yield _init_dev();
        }
    });
}
exports.dev = dev;
function _init_params(params) {
    params.spin = false;
    dev_params = (0, common_1.merge_params)(params);
    output_instance = output.create(dev_params);
    util_instance = util.create(dev_params, output_instance);
}
function _init_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, build_1.build)(dev_params, true);
        _watch();
    });
}
function _watch() {
    const src_path = `${dev_params.root}/src/`;
    output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
    util_instance.watch(src_path, `watching \`src\` folder.`, () => {
        output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
        watch_src_scanned = true;
    }, (_event, _path) => __awaiter(this, void 0, void 0, function* () {
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
        if (_event === 'addDir') {
        }
        else if (_event === 'unlink') {
            yield (0, transpose_1.transpose_unlink_file)(_path, dev_params, true);
        }
        else if (_event === 'unlinkDir') {
            yield (0, transpose_1.transpose_unlink_dir)(_path, dev_params, true);
        }
        else {
            yield (0, transpose_1.transpose_one)(_path, dev_params, true);
        }
        yield (0, generate_1.generate)(dev_params, true);
        output_instance.done_log(`[src watch] Transposed [${_event}] [${_path}].`, 'wtch');
    }));
}
//# sourceMappingURL=dev.js.map