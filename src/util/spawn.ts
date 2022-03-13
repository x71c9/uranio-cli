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
		this.output.verbose_log(command, 'exec');
		cp.execSync(command);
	}
	
	public spin(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject, detached=false){
		this.output.debug_log(command, 'spin');
		return this._spawn(command, context, action, true, false, false, color, resolve, reject, detached);
	}
	
	public log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject, detached=false){
		this.output.debug_log(command, 'log');
		return this._spawn(command, context, action, false, true, false, color, resolve, reject, detached);
	}
	
	public verbose_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject, detached=false){
		this.output.debug_log(command, 'verbose log');
		return this._spawn(command, context, action, false, false, true, color, resolve, reject, detached);
	}
	
	public spin_and_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject, detached=false){
		this.output.debug_log(command, 'spin and log');
		return this._spawn(command, context, action, true, true, false, color, resolve, reject, detached);
	}
	
	public spin_and_verbose_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject, detached=false){
		this.output.debug_log(command, 'spin and verbose');
		return this._spawn(command, context, action, true, false, true, color, resolve, reject, detached);
	}
	
	private _spawn(
		command:string,
		context:string,
		action:string,
		spin:boolean,
		log:boolean,
		verbose:boolean,
		color?:string,
		resolve?:Resolve,
		reject?:Reject,
		detached=false
	){
		if(spin && verbose){
			this.output.start_loading(command);
		}
		if(log){
			this.output.log(command, context, color);
		}else if(verbose){
			this.output.verbose_log(command, context, color);
		}
		
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
					const plain_text = _clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(log){
						this.output.log(plain_text, context, color);
					}
					if(verbose){
						this.output.verbose_log(plain_text, context, color);
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
					const plain_text = _clean_chunk(split);
					if(plain_text === ''){
						continue;
					}
					if(log){
						this.output.log(plain_text, context, color);
					}
					if(verbose){
						this.output.verbose_log(plain_text, context, color);
					}
					_append(child_outputs[child.pid || 'pid0'], plain_text);
				}
			});
		}
		
		child.on('error', (err) => {
			this.output.error_log(`${err}`, context);
			return (reject) ? reject() : false;
		});
		
		child.on('close', (code) => {
			this.output.stop_loading();
			switch(code){
				case 0:{
					if(log){
						this.output.done_log(`Done ${action}`, context);
					}
					if(verbose || spin){
						this.output.done_verbose_log(`Done ${action}`, context);
					}
					return (resolve) ? resolve(true) : true;
				}
				default:{
					if(code !== null){
						_print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
					}
					this.output.error_log(`Error on: ${command}`, context);
					this.output.error_log(`Child process exited with code ${code}`, context);
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

function _clean_chunk(chunk:string){
	const plain_text = chunk
		.toString()
		.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
		.replace(/\r?\n|\r/g, ' ');
	return plain_text;
}


