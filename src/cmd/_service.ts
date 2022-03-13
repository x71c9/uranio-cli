/**
 * Service command module
 *
 * @packageDocumentation
 */

import forever from 'forever-monitor';

// import * as cp from 'child_process';

import {default_params} from '../conf/defaults';

import * as output from '../output/index';

// import * as util from '../util/index';

import {Params} from '../types';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

// let util_instance:util.UtilInstance;

let service_params = default_params as Params;

// let service_child_process:cp.ChildProcessWithoutNullStreams;

// let child_id:number | undefined;

export let service_child:forever.Monitor;

// const tscw_color = '#734de3';

export async function start_service(params:Params)
		:Promise<void>{
	
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
	
	service_child = new forever.Monitor(`${service_params.root}/node_modules/uranio/dist/service/ws.js`,{
		args: ['urn_log_prefix=true'],
		// watch: true,
		// watchDirectory: `${service_params.root}/src`
	});
	
	service_child.start();
	
	service_child.on('watch:restart', function(info) {
		console.error('Restarting script because ' + info.file + ' changed');
	});
	
	service_child.on('restart', function(_info) {
		// console.error('Forever restarting script for ' + (child as any).times + ' time');
		console.error('Forever restarting script.');
	});
	
	service_child.on('exit:code', function(code) {
		console.error('Forever detected script exited with code ' + code);
	});
	
}


export async function stop_service(params:Params)
		:Promise<void>{
	
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

function _init_service(params:Partial<Params>)
		:void{
	
	service_params = merge_params(params);
	
	output_instance = output.create(service_params);
	
	// util_instance = util.create(service_params, output_instance);
	
}

