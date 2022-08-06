"use strict";
/**
 * Util module
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const prettier_1 = __importDefault(require("prettier"));
const defaults_1 = require("../conf/defaults");
// import {UtilParams} from './types';
// import {merge_params} from '../cmd/common';
const fs = __importStar(require("./fs"));
const spawn = __importStar(require("./spawn"));
const cmd = __importStar(require("./cmd"));
const watch_child_list = [];
process.on('SIGINT', function () {
    process.stdout.write("\r--- Caught interrupt signal [watch] ---\n");
    for (let i = 0; i < watch_child_list.length; i++) {
        const watch_child_object = watch_child_list[i];
        watch_child_object.child.close().then(() => {
            process.stdout.write(`Stopped ${watch_child_object.text}\n`);
        });
    }
});
class Util {
    constructor(params, output) {
        this.params = params;
        this.output = output;
        this.fs = fs.create(output);
        this.spawn = spawn.create(output);
        this.cmd = cmd.create(params, output);
    }
    watch(watch_path, watch_text, on_ready, on_all) {
        const watch_child = chokidar_1.default.watch(watch_path, {
            ignoreInitial: true,
            ignored: ['./**/*.swp', 'node_modules/**/*']
        }).on('ready', on_ready).on('all', on_all);
        watch_child_list.push({
            child: watch_child,
            context: `wtch`,
            text: watch_text
        });
    }
    is_initialized() {
        const is = (this.fs.exists(`${this.params.root}/${defaults_1.defaults.folder}/${defaults_1.defaults.init_filepath}`));
        if (is) {
            this.output.debug_log(`Uranio is initialized.`);
        }
        else {
            this.output.debug_log(`Uranio is not initialized.`);
        }
        return is;
    }
    // public is_docker_initialized(){
    //   const is = (this.fs.exists(
    //     `${this.params.root}/${defaults.docker_folder}/${defaults.json_filename}`
    //   ));
    //   if(is){
    //     this.output.debug_log(`Uranio [docker] is initialized.`);
    //   }else{
    //     this.output.debug_log(`Uranio [docker] is not initialized.`);
    //   }
    //   return is;
    // }
    must_be_initialized() {
        if (!this.is_initialized()) {
            let err_msg = '';
            err_msg += 'URANIO must be initialized first.';
            err_msg += ` Please run \`uranio init\` in order to initialize the repo.`;
            this.output.wrong_end_log(err_msg);
            process.exit(1);
        }
    }
    // public must_be_docker_initialized(){
    //   if(!this.is_docker_initialized()){
    //     let err_msg = '';
    //     err_msg += 'URANIO [docker] must be initialized first.';
    //     err_msg += ` Please run \`uranio init\` in order to initialize the repo.`;
    //     this.output.wrong_end_log(err_msg);
    //     process.exit(1);
    //   }
    // }
    pretty(filepath, parser = 'typescript') {
        this.output.start_loading(`Prettier [${filepath}]...`);
        const content = this.fs.read_file(filepath, 'utf8');
        try {
            const pretty_string = prettier_1.default.format(content, { useTabs: true, tabWidth: 2, parser: parser });
            this.fs.write_file(filepath, pretty_string);
            this.output.fndebug_log(`Prettier [${filepath}] done.`);
        }
        catch (e) {
            const err = e;
            this.output.error_log(`Cannot pretty file. ${err.message}`);
        }
    }
}
function create(params, output) {
    // const full_params = merge_params(params);
    return new Util(params, output);
}
exports.create = create;
//# sourceMappingURL=class.js.map