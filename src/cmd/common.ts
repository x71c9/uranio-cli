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

import {
	abstract_repos,
	valid_repos,
	abstract_pacman,
	valid_pacman,
	abstract_deploy,
	valid_deploy,
} from '../types';


export function merge_params(params:Partial<Params>):Params{
	const merged_params = default_params as Params;
	for(const k in default_params){
		if(urn_util.object.has_key(params, k)){
			(merged_params as any)[k] = params[k];
		}
	}
	for(const l in params){
		if(!urn_util.object.has_key(merge_params, l)){
			(merged_params as any)[l] = (params as any)[l];
		}
	}
	return merged_params;
}

export function check_repo(repo:string)
		:void{
	if(!urn_util.object.has_key(abstract_repos, repo)){
		const valid_repos_str = valid_repos().join(', ');
		let end_log = '';
		end_log += `Wrong repo. `;
		end_log += `Repo must be one of the following [${valid_repos_str}]`;
		process.stderr.write(end_log);
		process.exit(1);
	}
}

export function check_pacman(pacman:string)
		:void{
	if(!urn_util.object.has_key(abstract_pacman, pacman)){
		const valid_pacman_str = valid_pacman().join(', ');
		let end_log = '';
		end_log += `Wrong package manager. `;
		end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
		process.stderr.write(end_log);
		process.exit(1);
	}
}

export function check_deploy(deploy:string)
		:void{
	if(!urn_util.object.has_key(abstract_deploy, deploy)){
		const valid_deploy_str = valid_deploy().join(', ');
		let end_log = '';
		end_log += `Wrong deploy value. `;
		end_log += `Deploy value must be one of the following [${valid_deploy_str}]`;
		process.stderr.write(end_log);
		process.exit(1);
	}
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

