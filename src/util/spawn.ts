/**
 * Util Spawn
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import * as out from '../output/index';

import isDocker from 'is-docker';

type Resolve = (v?:unknown) => void;
type Reject = (err?:Error) => void;

type CachedOutput = {
	[id:string]: string[]
}

type Over = 'trace' | 'debug' | 'info' | 'warn' | 'error' | ''

const child_list:cp.ChildProcessWithoutNullStreams[] = [];

// const child_list_detached:cp.ChildProcessWithoutNullStreams[] = [];

const child_outputs:CachedOutput = {};

process.on('SIGINT', function() {
	process.stdout.write("\r--- Caught interrupt signal [spawn] ---\n");
	if(isDocker()){
		process.stdout.write("\r--- For interrupting inside Docker press Ctrl + \\ ---\n");
	}
	for(let i = 0; i < child_list.length; i++){
		const child = child_list[i];
		if(child.pid){
			process.kill(child.pid);
		}
	}
	// for(let i = 0; i < child_list_detached.length; i++){
	//   const child = child_list_detached[i];
	//   if(child.pid){
	//     // Minus symbol "-" is needed for detached process child.
	//     process.kill(-child.pid);
	//   }
	// }
});

class Spawn {
	
	constructor(public output:out.OutputInstance){}
	
	public exec_sync(command:string){
		this.output.trace_log(command);
		cp.execSync(command);
	}
	
	public native(command:string, action:string, over:Over='', prefix='', resolve?:Resolve, reject?:Reject, detached=false, no_log_on_error=false){
		return this._native_spawn({
			command,
			action,
			spin: false,
			over,
			prefix,
			resolve,
			reject,
			detached,
			no_log_on_error
		});
	}
	
	public spin(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: true,
			verbose: false,
			debug: false,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public info_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: false,
			verbose: false,
			debug: false,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public debug_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: false,
			verbose: true,
			debug: false,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public trace_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: false,
			verbose: false,
			debug: true,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public spin_and_native(command:string, action:string, over:Over='', prefix='', resolve?:Resolve, reject?:Reject, detached=false, no_log_on_error=false){
		return this._native_spawn({
			command,
			action,
			spin: true,
			over,
			prefix,
			resolve,
			reject,
			detached,
			no_log_on_error
		});
	}
	
	public spin_and_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: true,
			verbose: false,
			debug: false,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public spin_and_verbose_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: true,
			verbose: true,
			debug: false,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public spint_and_trace_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn({
			command,
			action,
			spin: true,
			verbose: false,
			debug: true,
			prefix,
			resolve,
			reject,
			detached
		});
	}
	
	public async spin_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async native_promise(command:string, action:string, over:Over='', prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.native(command, action, over, prefix, resolve, reject, detached);
		});
	}
	
	public async info_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.info_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async debug_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.debug_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async trace_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.trace_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async spin_and_native_promise(command:string, action:string, over:Over='', prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin_and_native(command, action, over, prefix, resolve, reject, detached);
		});
	}
	
	public async spin_and_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin_and_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async spin_and_verbose_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin_and_verbose_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async spin_and_trace_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spint_and_trace_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	private _native_spawn({
		command,
		action,
		spin,
		over='',
		prefix,
		resolve,
		reject,
		detached=false,
		no_log_on_error=false
	}:{
		command: string,
		action: string,
		spin: boolean,
		over: Over,
		prefix?: string,
		resolve?: Resolve,
		reject?: Reject,
		detached?: boolean,
		no_log_on_error?: boolean,
	}){
		
		if(spin){
			this.output.start_loading(command);
		}
		this.output.trace_log(`$ ${command}`);
		
		const child = cp.spawn(command, {shell: true, detached: detached});
		
		if(child.stdout){
			child.stdout.setEncoding('utf8');
			child.stdout.on('data', (chunk) => {
				const splitted_chunk = chunk.split('\n');
				for(const split of splitted_chunk){
					if(spin){
						const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
						this.output.spinner_text(plain_spin_text);
					}
					let plain_text = this.output.clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(prefix){
						plain_text = `${prefix} ${plain_text}`;
					}
					this.output.translate_loglevel(plain_text, over);
					_append(child_outputs[child.pid || 'pid0'], plain_text);
				}
			});
		}
		
		if(child.stderr){
			child.stderr.setEncoding('utf8');
			child.stderr.on('data', (chunk) => {
				const splitted_chunk = chunk.split('\n');
				for(const split of splitted_chunk){
					if(spin){
						const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
						this.output.spinner_text(plain_spin_text);
					}
					let plain_text = this.output.clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(prefix){
						plain_text = `${prefix} ${plain_text}`;
					}
					this.output.translate_loglevel(plain_text, over);
					_append(child_outputs[child.pid || 'pid0'], plain_text);
				}
			});
		}
		
		child.on('error', (err) => {
			this.output.error_log(`${err}`);
			return (reject) ? reject() : false;
		});
		
		child.on('close', (code) => {
			this.output.stop_loading();
			switch(code){
				case 0:{
					this.output.done_debug_log(`Done ${action}`);
					return (resolve) ? resolve(true) : true;
				}
				// case 6:{
				// 	this.output.warn_log(`Restarting...`);
				// 	return (resolve) ? resolve(true) : true;
				// }
				default:{
					if(no_log_on_error === true){
						return;
					}
					if(code !== null){
						_print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
					}
					this.output.error_log(`Error on: ${command}`);
					this.output.error_log(`Child process exited with code ${code}`);
					// return (reject) ? reject() : false;
				}
			}
		});
		
		// if(detached){
		//   child_list_detached.push(child);
		// }else{
		child_list.push(child);
		// }
		
		child_outputs[child.pid || 'pid0'] = [];
		
		return child;
	
	}
	
	private _spawn({
		command,
		action,
		spin,
		verbose,
		debug,
		prefix,
		resolve,
		reject,
		detached=false,
		no_log_on_error=false
	}:{
		command: string
		action: string
		spin: boolean
		verbose: boolean
		debug: boolean
		prefix?: string
		resolve?: Resolve
		reject?: Reject
		detached?: boolean
		no_log_on_error?: boolean
	}){
		if(spin){
			this.output.start_loading(command);
		}
		const prefix_command = (prefix) ? `${prefix} ` : '';
		this.output.debug_log(`${prefix_command}$ ${command}`);
		
		const child = cp.spawn(command, {shell: true, detached: detached});
		
		if(child.stdout){
			child.stdout.setEncoding('utf8');
			child.stdout.on('data', (chunk) => {
				if(spin){
					const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
					this.output.spinner_text(plain_spin_text);
				}
				const splitted_chunk = chunk.split('\n');
				for(const split of splitted_chunk){
					let plain_text = this.output.clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(prefix){
						plain_text = `${prefix} ${plain_text}`;
					}
					if(verbose){
						this.output.debug_log(plain_text);
					}
					if(debug){
						this.output.trace_log(plain_text);
					}
					_append(child_outputs[child.pid || 'pid0'], plain_text);
				}
			});
		}
		
		if(child.stderr){
			child.stderr.setEncoding('utf8');
			child.stderr.on('data', (chunk) => {
				if(spin){
					const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
					this.output.spinner_text(plain_spin_text);
				}
				const splitted_chunk = chunk.split('\n');
				for(const split of splitted_chunk){
					let plain_text = this.output.clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(prefix){
						plain_text = `${prefix} ${plain_text}`;
					}
					if(verbose){
						this.output.debug_log(plain_text);
					}
					if(debug){
						this.output.trace_log(plain_text);
					}
					_append(child_outputs[child.pid || 'pid0'], plain_text);
				}
			});
		}
		
		child.on('error', (err) => {
			this.output.error_log(`${err}`);
			return (reject) ? reject() : false;
		});
		
		child.on('close', (code) => {
			this.output.stop_loading();
			switch(code){
				case 0:{
					if(!verbose && !debug && !spin){
						this.output.done_log(`Done ${action}`);
					}
					if(verbose){
						this.output.done_debug_log(`Done ${action}`);
					}
					return (resolve) ? resolve(true) : true;
				}
				default:{
					if(no_log_on_error === true){
						return;
					}
					if(code !== null){
						_print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
					}
					this.output.error_log(`Error on: ${command}`);
					this.output.error_log(`Child process exited with code ${code}`);
					// return (reject) ? reject() : false;
				}
			}
		});
		
		// if(detached){
		//   child_list_detached.push(child);
		// }else{
		child_list.push(child);
		// }
		
		child_outputs[child.pid || 'pid0'] = [];
		
		return child;
		
	}
	
}

function _print_cached_output(cached:string[], output:out.OutputInstance){
	for(const s of cached){
		output.error_log(s);
	}
}

function _append(arr:string[], value:string) {
	arr.push(value);
	while (arr.length > 15) {
		arr.shift();
	}
}

export type SpawnInstance = InstanceType<typeof Spawn>;

export function create(output:out.OutputInstance):SpawnInstance{
	return new Spawn(output);
}



