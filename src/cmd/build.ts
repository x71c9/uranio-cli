/**
 * Build command module
 *
 * @packageDocumentation
 */

import {default_params} from '../conf/defaults';

import * as output from '../output/index';

// import * as util from '../util/index';

import {Params} from '../types';

import {transpose} from './transpose';

import {merge_params} from './common';

import {generate} from './generate';

// const tscw_color = '#734de3';
// const nuxt_color = '#677cc7';

let output_instance:output.OutputInstance;

// let util_instance:util.UtilInstance;

let build_params = default_params as Params;

export async function build(params:Params, included=false)
		:Promise<void>{
	
	_init_build(params);
	
	output_instance.start_loading(`Building...`);
	
	await transpose(build_params, true);
	
	await generate(build_params, true);
	
	if(included){
		output_instance.done_log('Build completed.');
	}else{
		output_instance.end_log('Build completed.');
	}
	
}

function _init_build(params:Partial<Params>)
		:void{
	
	build_params = merge_params(params);
	
	output_instance = output.create(build_params);
	
}

