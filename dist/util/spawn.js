"use strict";
/**
 * Util Spawn
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
class Spawn {
    constructor(output) {
        this.output = output;
    }
}
function create(output) {
    return new Spawn(output);
}
exports.create = create;
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
//# sourceMappingURL=spawn.js.map