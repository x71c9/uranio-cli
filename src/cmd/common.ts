/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */

// import fs from 'fs';

// import * as cp from 'child_process';

import {urn_util} from 'urn-lib';

import {Params} from '../types';

// import * as util from '../util/';

// import * as output from '../output/';

// import {default_params, defaults} from '../conf/defaults';
import {default_params} from '../conf/defaults';


export function merge_params<A>(params:A):Params & A{
	const merged_params = default_params as Params & A;
	for(const k in default_params){
		if(urn_util.object.has_key(params, k)){
			(merged_params as any)[k] = params[k];
		}
	}
	for(const l in params){
		if(!urn_util.object.has_key(merge_params, l)){
			(merged_params as any)[l] = params[l];
		}
	}
	return merged_params;
}


// export function init_log()
//     :void{
//   if(!fs.existsSync(`${conf.root}/${defaults.log_filepath}`)){
//     cp.execSync(`touch ${conf.root}/${defaults.log_filepath}`);
//   }
// }

// export function init_run(options?:Partial<Options>)
//     :void {
	
//   conf.hide = true;
//   conf.spinner = false;
	
//   if(options){
//     util.merge_options(options);
//   }
	
//   if(!util.check_folder(conf.root)){
//     throw new Error(`Invalid root path [${conf.root}].`);
//   }
	
//   if(!util.check_repo(conf.repo)){
//     throw new Error(`Invalid repo [${conf.repo}].`);
//   }
	
//   init_log();
	
//   _log_options();
	
// }

// function _log_options(){
//   output.verbose_log(JSON.stringify(conf), 'opts');
// }

