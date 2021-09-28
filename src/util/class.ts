/**
 * Util module
 *
 * @packageDocumentation
 */

import chokidar from 'chokidar';

import prettier from 'prettier';

import * as out from '../output/';

import * as fs from './fs';

import * as spawn from './spawn';

import * as cmd from './cmd';

import {WatchProcessObject, OnReadyCallback, OnAllCallback} from './types';

class Util {
	
	public fs:fs.FSInstance;
	
	public cmd:cmd.CMDInstance;
	
	public spawn:spawn.SpawnInstance;
	
	public watch_child_list:WatchProcessObject[] = [];
	
	constructor(public output:out.OutputInstance){
		this.fs = fs.create(output);
		this.cmd = cmd.create(output);
		this.spawn = spawn.create(output);
	}
	
	public watch(
		watch_path: string,
		watch_text: string,
		on_ready: OnReadyCallback,
		on_all: OnAllCallback
	):void{
		const watch_child = chokidar.watch(watch_path).on('ready', on_ready).on('all', on_all);
		this.watch_child_list.push({
			child: watch_child,
			context: `wtch`,
			text: watch_text
		});
	}

	public pretty(filepath:string, parser='typescript')
		:void{
		this.output.start_loading(`Prettier [${filepath}]...`);
		const content = this.fs.read_file_sync(filepath, 'utf8');
		const pretty_string = prettier.format(
			content,
			{ useTabs: true, tabWidth: 2, parser: parser }
		);
		this.fs.write_file_sync(filepath, pretty_string);
		this.output.done_verbose_log(`Prettier [${filepath}] done.`, 'prtt');
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

export function create(output:out.OutputInstance)
		:UtilInstance{
	return new Util(output);
}

