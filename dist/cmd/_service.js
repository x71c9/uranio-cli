"use strict";
/**
 * Service command module
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
exports.stop_service = exports.start_service = exports.service_child = void 0;
const forever_monitor_1 = __importDefault(require("forever-monitor"));
// import * as cp from 'child_process';
const defaults_1 = require("../conf/defaults");
const output = __importStar(require("../output/index"));
const common_1 = require("./common");
let output_instance;
// let util_instance:util.UtilInstance;
let service_params = defaults_1.default_params;
// const tscw_color = '#734de3';
async function start_service(params) {
    _init_service(params);
    output_instance.start_loading(`Starting service...`);
    // const nuxt_cmd = `cd ${service_params.root}/node_modules/uranio/ && yarn nuxt dev -c nuxt.config.js`;
    // util_instance.spawn.log(nuxt_cmd, 'nuxt', 'developing admin', tscw_color);
    // const service_cmd = `yarn forever start -c yarn uranio-webservice-${service_params.repo} urn_log_prefix_type=true`;
    // service_child_process = util_instance.spawn.log(service_cmd, 'service', 'starting service', undefined, undefined, undefined, true);
    // // service_child_process = util_instance.spawn.log(service_cmd, 'service', 'starting service', undefined, undefined, undefined);
    // child_id = service_child_process.pid;
    // service_child_process.on('exit', function(){
    //   console.log('EEEEECCXXXSSIIT');
    //   // if(child_id){
    //   //   process.kill(child_id);
    //   // }
    //   start_service(service_params);
    // });
    exports.service_child = new forever_monitor_1.default.Monitor(`${service_params.root}/node_modules/uranio/dist/service/ws.js`, {
        args: ['urn_log_prefix=true'],
        // watch: true,
        // watchDirectory: `${service_params.root}/src`
    });
    exports.service_child.start();
    exports.service_child.on('watch:restart', function (info) {
        console.error('Restarting script because ' + info.file + ' changed');
    });
    exports.service_child.on('restart', function (_info) {
        // console.error('Forever restarting script for ' + (child as any).times + ' time');
        console.error('Forever restarting script.');
    });
    exports.service_child.on('exit:code', function (code) {
        console.error('Forever detected script exited with code ' + code);
    });
}
exports.start_service = start_service;
async function stop_service(params) {
    _init_service(params);
    output_instance.start_loading(`Stopping service...`);
    // const service_cmd = `yarn forever stop -c yarn uranio-webservice-${service_params.repo} urn_log_prefix_type=true`;
    // service_child_process = util_instance.spawn.log(service_cmd, 'service', 'starting service', undefined, undefined, undefined, true);
    // // service_child_process = util_instance.spawn.log(service_cmd, 'service', 'starting service', undefined, undefined, undefined);
    // child_id = service_child_process.pid;
    // await service_child_process.kill('SIGTERM');
    // if(child_id){
    //   process.kill(-child_id);
    // }
}
exports.stop_service = stop_service;
function _init_service(params) {
    service_params = (0, common_1.merge_params)(params);
    output_instance = output.create(service_params);
    // util_instance = util.create(service_params, output_instance);
}
//# sourceMappingURL=_service.js.map