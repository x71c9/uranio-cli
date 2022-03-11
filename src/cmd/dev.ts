/**
 * Dev command module
 *
 * @packageDocumentation
 */

import path from 'path';

import * as output from '../output/index';

import * as util from '../util/index';

import {generate} from './generate';

import {default_params} from '../conf/defaults';

import {Params} from '../types';

import {
	transpose_one,
	transpose_unlink_dir,
	transpose_unlink_file
} from './transpose';

import {build} from './build';

import {merge_params} from './common';

import * as docker from './docker';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let dev_params = default_params as Params;

// let watch_lib_scanned = false;
let watch_src_scanned = false;

// const nuxt_color = '#677cc7';
// const tscw_color = '#734de3';
const watc_color = '#687a6a';

export async function dev(params:Partial<Params>)
		:Promise<void>{
	if(params.docker === true){
		
		await docker.start(params);
		
	}else{
		
		_init_params(params);
		await _init_dev();
		
	}
}

function _init_params(params:Partial<Params>)
		:void{
	
	params.spin = false;
	
	dev_params = merge_params(params);
	
	output_instance = output.create(dev_params);
	
	util_instance = util.create(dev_params, output_instance);
	
}

async function _init_dev(){
	
	await build(dev_params, true);
	
	_watch();
}

function _watch(){
	
	const src_path = `${dev_params.root}/src/`;
	
	output_instance.log(`Watching \`src\` folder [${src_path}] ...`, 'wtch');
	
	util_instance.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output_instance.done_log(`Initial scanner completed for [${src_path}].`, 'wtch');
			watch_src_scanned = true;
		},
		async (_event, _path) => {
			
			const basename = path.basename(_path);
			const extension = path.extname(basename);
			
			const not_valid_extensions = ['.swp', '.swo'];
			if(not_valid_extensions.includes(extension) || not_valid_extensions.includes(basename)){
				return false;
			}
			
			if(!watch_src_scanned){
				if(_event === 'add' || _event === 'addDir'){
					output_instance.verbose_log(`${_event} ${_path}`, 'wtch', watc_color);
				}
				return false;
			}
			
			output_instance.log(`${_event} ${_path}`, 'wtch', watc_color);
			
			if(_event === 'addDir'){
				
			}else if(_event === 'unlink'){
				
				await transpose_unlink_file(_path, dev_params, true);
				
			}else if(_event === 'unlinkDir'){
				
				await transpose_unlink_dir(_path, dev_params, true);
				
			}else{
				
				await transpose_one(_path, dev_params, true);
				
			}
			
			await generate(dev_params, true);
			
			output_instance.done_log(`[src watch] Transposed [${_event}] [${_path}].`, 'wtch');
			
		}
	);
	
}
