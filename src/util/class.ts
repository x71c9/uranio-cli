/**
 * Util module
 *
 * @packageDocumentation
 */

import chokidar from 'chokidar';

import prettier from 'prettier';

import {defaults} from '../conf/defaults';

import {Params} from '../types';

import * as out from '../output/index';

// import {UtilParams} from './types';

// import {merge_params} from '../cmd/common';

import * as fs from './fs';

import * as spawn from './spawn';

import * as cmd from './cmd';

import {WatchProcessObject, OnReadyCallback, OnAllCallback} from './types';

const watch_child_list:WatchProcessObject[] = [];

process.on('SIGINT', function() {
	process.stdout.write("\r--- Caught interrupt signal [watch] ---\n");
	for(let i = 0; i < watch_child_list.length; i++){
		const watch_child_object = watch_child_list[i];
		watch_child_object.child.close().then(() => {
			process.stdout.write(`Stopped ${watch_child_object.text}\n`);
		});
	}
});

class Util {
	
	public fs:fs.FSInstance;
	
	public cmd:cmd.CMDInstance;
	
	public spawn:spawn.SpawnInstance;
	
	constructor(public params:Params, public output:out.OutputInstance){
		this.fs = fs.create(output);
		this.spawn = spawn.create(output);
		this.cmd = cmd.create(params, output);
	}
	
	public watch(
		watch_path: string,
		watch_text: string,
		on_ready: OnReadyCallback,
		on_all: OnAllCallback
	):void{
		const watch_child = chokidar.watch(watch_path, {
			ignoreInitial: true,
			ignored: ['./**/*.swp', 'node_modules/**/*']
		}).on('ready', on_ready).on('all', on_all);
		watch_child_list.push({
			child: watch_child,
			context: `wtch`,
			text: watch_text
		});
	}
	
	public is_initialized(){
		const is = (this.fs.exists(`${this.params.root}/${defaults.folder}/${defaults.init_filepath}`));
		if(is){
			this.output.verbose_log(`Uranio is initialized.`);
		}else{
			this.output.verbose_log(`Uranio is not initialized.`);
		}
		return is;
	}
	
	// public is_docker_initialized(){
	//   const is = (this.fs.exists(
	//     `${this.params.root}/${defaults.docker_folder}/${defaults.json_filename}`
	//   ));
	//   if(is){
	//     this.output.verbose_log(`Uranio [docker] is initialized.`);
	//   }else{
	//     this.output.verbose_log(`Uranio [docker] is not initialized.`);
	//   }
	//   return is;
	// }
	
	public must_be_initialized(){
		if(!this.is_initialized()){
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
	
	public pretty(filepath:string, parser='typescript')
		:void{
		this.output.start_loading(`Prettier [${filepath}]...`);
		const content = this.fs.read_file(filepath, 'utf8');
		try{
			const pretty_string = prettier.format(
				content,
				{ useTabs: true, tabWidth: 2, parser: parser }
			);
			this.fs.write_file(filepath, pretty_string);
			this.output.debug_log(`Prettier [${filepath}] done.`);
		}catch(e){
			const err = e as Error;
			this.output.error_log(`Cannot pretty file. ${err.message}`);
		}
	}
	
	// public relative_to_absolute_path(path:string)
	//     :string{
	//   if(path[path.length-1] === '/'){
	//     path = path.substr(0,path.length-1);
	//   }
	//   if(path[0] !== '/'){
	//     if(path.substr(0,2) === './'){
	//       path = path.substr(2);
	//     }
	//     path = `${conf.root}/${path}`;
	//   }
	//   return path;
	// }
	
}

export type UtilInstance = InstanceType<typeof Util>;

export function create(params:Params, output:out.OutputInstance)
		:UtilInstance{
	// const full_params = merge_params(params);
	return new Util(params, output);
}

