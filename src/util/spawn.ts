/**
 * Util Spawn
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import * as out from '../output/index';

type Resolve = (v?:unknown) => void;
type Reject = (err?:Error) => void;

type CachedOutput = {
	[id:string]: string[]
}

const child_list:cp.ChildProcessWithoutNullStreams[] = [];

// const child_list_detached:cp.ChildProcessWithoutNullStreams[] = [];

const child_outputs:CachedOutput = {};

process.on('SIGINT', function() {
	process.stdout.write("\r--- Caught interrupt signal [spawn] ---\n");
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
		this.output.debug_log(command);
		cp.execSync(command);
	}
	
	public spin(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, true, false, false, prefix, resolve, reject, detached);
	}
	
	public log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, false, false, false, prefix, resolve, reject, detached);
	}
	
	public verbose_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, false, true, false, prefix, resolve, reject, detached);
	}
	
	public debug_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, false, false, true, prefix, resolve, reject, detached);
	}
	
	public spin_and_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, true, false, false, prefix, resolve, reject, detached);
	}
	
	public spin_and_verbose_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, true, true, false, prefix, resolve, reject, detached);
	}
	
	public spin_and_debug_log(command:string, action:string, prefix='', resolve?:Resolve, reject?:Reject, detached=false){
		return this._spawn(command, action, true, false, true, prefix, resolve, reject, detached);
	}
	
	public async spin_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async verbose_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.verbose_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	public async debug_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.debug_log(command, action, prefix, resolve, reject, detached);
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
	
	public async spin_and_debug_log_promise(command:string, action:string, prefix='', detached=false){
		return await new Promise((resolve, reject) => {
			return this.spin_and_debug_log(command, action, prefix, resolve, reject, detached);
		});
	}
	
	private _spawn(
		command:string,
		action:string,
		spin:boolean,
		verbose:boolean,
		debug:boolean,
		prefix?:string,
		resolve?:Resolve,
		reject?:Reject,
		detached=false
	){
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
						this.output.fndebug_log(plain_text);
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
						this.output.fndebug_log(plain_text);
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
					if(!verbose && !debug){
						this.output.done_log(`Done ${action}`);
					}
					if(verbose){
						this.output.done_debug_log(`Done ${action}`);
					}
					return (resolve) ? resolve(true) : true;
				}
				default:{
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



