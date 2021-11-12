/**
 * Util Spawn
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import * as out from '../output/';

type Resolve = (v?:unknown) => void;
type Reject = (err?:Error) => void;

const child_list:cp.ChildProcessWithoutNullStreams[] = [];

process.on('SIGINT', function() {
	process.stdout.write("\r--- Caught interrupt signal [spawn] ---\n");
	for(let i = 0; i < child_list.length; i++){
		const child = child_list[i];
		if(child.pid){
			process.kill(child.pid);
		}
	}
});

class Spawn {
	
	constructor(public output:out.OutputInstance){}
	
	public exec_sync(command:string){
		this.output.verbose_log(command, 'exec');
		cp.execSync(command);
	}
	
	public spin(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject){
		this.output.debug_log(command, 'spin');
		return this._spawn(command, context, action, true, false, false, color, resolve, reject);
	}
	
	public log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject){
		this.output.debug_log(command, 'log');
		return this._spawn(command, context, action, false, true, false, color, resolve, reject);
	}
	
	public verbose_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject){
		this.output.debug_log(command, 'verbose log');
		return this._spawn(command, context, action, false, false, true, color, resolve, reject);
	}
	
	public spin_and_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject){
		this.output.debug_log(command, 'spin and log');
		return this._spawn(command, context, action, true, true, false, color, resolve, reject);
	}
	
	public spin_and_verbose_log(command:string, context:string, action:string, color?:string, resolve?:Resolve, reject?:Reject){
		this.output.debug_log(command, 'spin and verbose');
		return this._spawn(command, context, action, true, false, true, color, resolve, reject);
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
		reject?:Reject
	){
		if(spin){
			this.output.start_loading(command);
		}
		if(log){
			this.output.log(command, context, color);
		}
		if(verbose){
			this.output.verbose_log(command, context, color);
		}
		
		// const splitted_command = command.split(' ');
		// const first_command = splitted_command[0];
		// splitted_command.shift();
		// const child = cp.spawn(first_command, splitted_command);
		const child = cp.spawn(command, {shell: true});
		
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
				}
			});
		}
		
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
					this.output.error_log(`Child process exited with code ${code}`, context);
					return (reject) ? reject() : false;
				}
			}
		});
		
		child.on('error', (err) => {
			this.output.error_log(`${err}`, context);
			return (reject) ? reject() : false;
		});
		
		child_list.push(child);
		
		return child;
		
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



// export function sync_exec(command:string)
//     :void{
//   output.verbose_log(`Executing ${command}`, 'exec');
//   cp.execSync(command);
// }

// type PF = (v?:unknown) => void;

// export function spawn_cmd(command:string, context:string, action:string, resolve:PF, reject:PF)
//     :void{
	
//   output.start_loading(`${action}...`);
	
//   const splitted_command = command.split(' ');
//   const first_command = splitted_command[0];
//   splitted_command.shift();
	
//   const child = cp.spawn(first_command, splitted_command);
	
//   output.verbose_log(command, context);
	
//   if(child.stdout){
//     child.stdout.setEncoding('utf8');
//     child.stdout.on('data', (chunk) => {
//       const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
//       output.spinner_text(plain_text);
//     });
//   }
	
//   if(child.stderr){
//     child.stderr.setEncoding('utf8');
//     child.stderr.on('data', (chunk) => {
//       const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
//       output.spinner_text(plain_text);
//     });
//   }
	
//   child.on('close', (code) => {
//     switch(code){
//       case 0:{
//         output.done_verbose_log(`Done ${action}`, context);
//         return resolve(true);
//       }
//       default:{
//         output.error_log(`Child process exited with code ${code}`, context);
//         return reject(false);
//       }
//     }
//   });
	
//   child.on('error', (err) => {
//     output.error_log(`${err}`, context);
//     return reject(false);
//   });
	
// }

// export function spawn_log_command(command:string, context:string, color: string, callback?: () => void)
//     :cp.ChildProcessWithoutNullStreams{
//   return _spawn_log_command(command, context, color, false, false, callback);
// }

// export function spawn_verbose_log_command(command:string, context:string, color:string, callback?: () => void)
//     :cp.ChildProcessWithoutNullStreams{
//   return _spawn_log_command(command, context, color, true, false, callback);
// }

// export function spawn_native_log_command(command:string, context:string, color:string, callback?: () => void)
//     :cp.ChildProcessWithoutNullStreams{
//   return _spawn_log_command(command, context, color, true, true, callback);
// }

// function _spawn_log_command(
//   command:string,
//   context:string,
//   color:string,
//   verbose=true,
//   native=false,
//   callback?: () => void
// ):cp.ChildProcessWithoutNullStreams{
	
//   // const splitted_command = command.split(' ');
//   // const spawned = cp.spawn(
//   //   splitted_command[0],
//   //   splitted_command.slice(1),
//   //   // {stdio: [null, 'inherit', 'inherit']}
//   // );
	
//   const spawned = cp.spawn(command,{shell: true});
	
//   if(spawned.stdout){
//     spawned.stdout.setEncoding('utf8');
//     spawned.stdout.on('data', (chunk:string) => {
//       const splitted_chunk = chunk.split('\n');
//       for(const split of splitted_chunk){
//         if(native){
//           process.stdout.write(split + `\n`);
//         }else{
//           const plain_text = _clean_chunk(split);
//           if(plain_text.includes('<error>')){
//             output.error_log(plain_text, context);
//           }else if(plain_text != ''){
//             if(verbose){
//               output.verbose_log(plain_text, context, color);
//             }else{
//               output.log(plain_text, context, color);
//             }
//           }
//         }
//       }
//     });
//   }
	
//   if(spawned.stderr){
//     spawned.stderr.setEncoding('utf8');
//     spawned.stderr.on('data', (chunk) => {
//       const splitted_chunk = chunk.split('\n');
//       for(const split of splitted_chunk){
//         if(native){
//           process.stderr.write(split + `\n`);
//         }else{
//           const plain_text = _clean_chunk(split);
//           if(plain_text !== ''){
//             output.error_log(plain_text, context);
//           }
//           // process.stdout.write(chunk);
//           // process.stderr.write(`[${context}] ${chunk}`);
//         }
//       }
//     });
//   }
	
//   spawned.on('close', (code) => {
//     switch(code){
//       case 0:{
//         if(callback){
//           callback();
//         }else{
//           const done = `Done.`;
//           if(native){
//             process.stderr.write(done);
//           }else{
//             output.verbose_log(done, context, color);
//           }
//         }
//         break;
//       }
//       default:{
//         if(user_exit === false){
//           const txt = `Child process exited with code ${code}`;
//           if(native){
//             process.stderr.write(txt);
//           }else{
//             output.error_log(txt, context);
//           }
//         }
//       }
//     }
//   });
	
//   spawned.on('error', (err) => {
//     if(user_exit === false){
//       if(native){
//         process.stderr.write(`${err}`);
//       }else{
//         output.error_log(`${err}`, context);
//       }
//     }
//   });
	
//   child_list.push(spawned);
	
//   return spawned;
// }

// function _clean_chunk(chunk:string){
//   const plain_text = chunk
//     .toString()
//     .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
//     .replace(/\r?\n|\r/g, ' ');
//   return plain_text;
// }

// process.on('SIGINT', function() {
	
//   user_exit = true;
	
//   output.wrong_end_log("--- Caught interrupt signal ---");
//   // process.stdout.write("\r--- Caught interrupt signal ---\n");
	
//   for(let i = 0; i < watch_child_list.length; i++){
//     const watch_child_object = watch_child_list[i];
//     watch_child_object.child.close().then(() => {
//       output.log(`Stop ${watch_child_object.text}`, watch_child_object.context);
//     });
//   }
	
//   for(let i = 0; i < child_list.length; i++){
//     const child = child_list[i];
//     if(child.pid){
//       process.kill(child.pid);
//     }
//   }
	
// });
