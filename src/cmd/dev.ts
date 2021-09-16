/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import * as output from '../output/';

import * as util from '../util/';

import {conf, defaults} from '../conf/defaults';
// import {conf} from '../conf/defaults';

import {transpose} from './transpose';

import {hooks} from './hooks';

export const dev = {
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		conf.filelog = false;
		
		_start_dev();
		
	}
	
};

// let watch_client_scanned = false;
// let watch_server_scanned = false;
// let watch_book_scanned = false;
// let watch_lib_scanned = false;
let watch_src_scanned = false;

const cli_options = {
	hide: false,
	verbose: true,
};

const nuxt_color = '#677cc7';
const tscw_color = '#734de3';
const watc_color = '#687a6a';

async function _start_dev()
		:Promise<any>{
	
	// const client_folder = `${conf.root}/src/client/.`;
	
	// if(fs.existsSync(client_folder)){
	//   util.copy_folder_recursive_sync(
	//     client_folder,
	//     `${conf.root}/.uranio/client/src/.`
	//   );
	// }
	
	cli_options.verbose = conf.verbose;
	
	transpose.run(conf.root, undefined, cli_options);
	
	if(conf.repo === 'trx'){
		hooks.run(cli_options);
	}
	
	if(conf.deploy === 'netlify'){
		const ntl_cmd = `npx ntl dev`;
		util.spawn_log_command(ntl_cmd, 'ntlf', nuxt_color);
	}else{
		const nuxt_cmd = `cd ${conf.root}/.uranio/client && npx nuxt dev -c ./nuxt.config.js`;
		util.spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
	}
	
	const tscw_cmd = `cd ${conf.root}/.uranio/server && npx tsc -w --project ./tsconfig.json`;
	util.spawn_log_command(tscw_cmd, 'tscw', tscw_color);
	
	const src_path = `${conf.root}/src/`;
	output.log(`wtch`, `Watching \`src\` folder [${src_path}] ...`, watc_color);
	
	util.watch(
		src_path,
		`watching \`src\` folder.`,
		() => {
			output.done_log(`wtch`, `Initial scanner completed for [${src_path}].`);
			watch_src_scanned = true;
		},
		(_event, _path) => {
			output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
			if(!watch_src_scanned){
				return false;
			}
			
			if(_event !== 'unlink'){
				
				transpose.run(conf.root, _path, cli_options);
				
				if(conf.repo === 'trx'){
					hooks.run(cli_options);
				}
				
				output.done_log(`wtch`, `[Book watch] Transposed [${_path}].`);
			
			}else{
				const relative_path = _path.replace(`${conf.root}/src/`, '');
				const new_path_server = `${conf.root}/${defaults.folder}/server/src/${relative_path}`;
				const new_path_client = `${conf.root}/${defaults.folder}/client/src/${relative_path}`;
				util.delete_file_sync(new_path_server);
				util.delete_file_sync(new_path_client);
			}
			_replace_netlify_function_file();
		}
	);
	
	// output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`, watc_color);
	
	// util.watch(
	//   client_folder,
	//   `watching client folder.`,
	//   () => {
	//     output.done_log(`wtch`, `Initial scanner completed for [${client_folder}].`);
	//     watch_client_scanned = true;
	//   },
	//   (_event, _path) => {
	//     output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
	//     if(!watch_client_scanned){
	//       return false;
	//     }
	//     if(_path.endsWith('.swp')){
	//       return false;
	//     }
	//     const relative_path_to_client = _path.replace(`${conf.root}/src/client/`, '');
	//     const new_path = `${conf.root}/${defaults.folder}/client/src/${relative_path_to_client}`;
	//     const pre_str = `[Client watch]`;
	//     const post_str = `sync [${_path}] to [${new_path}]`;
	//     if(_event === 'unlink'){
	//       util.delete_file_sync(new_path);
	//       output.done_log(`wtch`, `[Server watch] Unlinked [${_path}].`);
	//     }else if(_event === 'add' || _event === 'change'){
	//       const what = 'file';
	//       // output.start_loading(`${pre_str} Copying ${what} ${post_str}`);
	//       // util.copy_file_sync(_path, new_path);
	//       transpose.run(conf.root, _path, cli_options);
	//       output.done_log(`wtch`, `${pre_str} Copied ${what} ${post_str}`);
	//     }else if(_event === 'addDir'){
	//       const what = 'dir';
	//       // output.start_loading(`${pre_str} Copying ${what} ${post_str}`);
	//       util.copy_folder_recursive_sync(_path, new_path);
	//       output.done_log(`wtch`, `${pre_str} Copied ${what} ${post_str}`);
	//     }
	//   }
	// );
	
	// const server_folder = `${conf.root}/src/server/.`;
	// output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`, watc_color);
	
	// util.watch(
	//   server_folder,
	//   `watching server folder.`,
	//   () => {
	//     output.done_log(`wtch`, `Initial scanner completed for [${server_folder}].`);
	//     watch_server_scanned = true;
	//   },
	//   (_event, _path) => {
	//     output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
	//     if(!watch_server_scanned){
	//       return false;
	//     }
	//     const relative_path_to_server = _path.replace(`${conf.root}/src/server/`, '');
	//     const new_path = `${conf.root}/${defaults.folder}/server/src/${relative_path_to_server}`;
	//     const pre_str = `[Server watch]`;
	//     const post_str = `sync [${_path}] to [${new_path}]`;
	//     if(_event === 'unlink'){
	//       util.delete_file_sync(new_path);
	//       output.done_log(`wtch`, `${pre_str} Unlinked [${_path}].`);
	//     }else if(_event === 'add' || _event === 'change'){
	//       const what = 'file';
	//       transpose.run(conf.root, _path, cli_options);
	//       output.done_log(`wtch`, `${pre_str} Copied ${what} ${post_str}`);
	//     }else if(_event === 'addDir'){
	//       const what = 'dir';
	//       util.copy_folder_recursive_sync(_path, new_path);
	//       output.done_log(`wtch`, `${pre_str} Copied ${what} ${post_str}`);
	//     }
	//     _replace_netlify_function_file();
	//   }
	// );
	
	// const book_path = `${conf.root}/src/book.ts`;
	// output.log(`wtch`, `Watching Book file [${book_path}] ...`, watc_color);
	
	// util.watch(
	//   book_path,
	//   `watching book file.`,
	//   () => {
	//     output.done_log(`wtch`, `Initial scanner completed for [${book_path}].`);
	//     watch_book_scanned = true;
	//   },
	//   (_event, _path) => {
	//     output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
	//     if(!watch_book_scanned){
	//       return false;
	//     }
	//     if(_event !== 'unlink'){
	//       transpose.run(conf.root, _path, cli_options);
	//       if(conf.repo === 'trx'){
	//         hooks.run(cli_options);
	//       }
	//       output.done_log(`wtch`, `[Book watch] Transposed [${_path}].`);
	//     }
	//     _replace_netlify_function_file();
	//   }
	// );
	
	// const lib_path = `${conf.root}/${defaults.folder}/server/src/uranio/.`;
	// output.log(`wtch`, `Watching Lib folder [${lib_path}] ...`, watc_color);
	
	// util.watch(
	//   lib_path,
	//   `watching lib folder.`,
	//   () => {
	//     output.done_log(`wtch`, `Initial scanner completed for [${lib_path}].`);
	//     watch_lib_scanned = true;
	//   },
	//   (_event, _path) => {
	//     if(_event !== 'add' && _event !== 'addDir'){
	//       output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
	//     }
	//     if(!watch_lib_scanned){
	//       return false;
	//     }
	//     _replace_netlify_function_file();
	//   }
	// );
	
}

function _replace_netlify_function_file(){
	const api_file_path = `${conf.root}/.uranio/server/src/functions/api.ts`;
	const result = fs.readFileSync(api_file_path);
	let new_content = result.toString();
	const splitted = new_content.split(`\n`);
	const comment = '// uranio autoupdate';
	if(splitted[splitted.length - 2] !== comment){
		new_content += `\n${comment}`;
		new_content += `\n// 0`;
	}else{
		const last_update = splitted.splice(-1);
		const last_update_split = last_update[0].split(' ');
		const update_number = Number(last_update_split[1]);
		new_content = splitted.join('\n');
		new_content += `\n// ${update_number + 1}`;
	}
	fs.writeFileSync(api_file_path, new_content, 'utf8');
	output.verbose_log('less', `Replacing Netlify serverless function file.`);
}

