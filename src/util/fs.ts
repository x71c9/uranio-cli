/**
 * Util FS
 *
 * @packageDocumentation
 */

import fs from 'fs';

import path from 'path';

import * as output from '../output/';

export function create_file(file_path:string, context='tch'){
	fs.writeFile(file_path, '', () => {
		output.verbose_log()
	});
}

export function create_file_sync(file_path:string, context='tch'){
	
}

export function create_files(file_paths:string, context='tchs'){

}

export function create_files_sync(file_paths:string, context='tchs'){

}

export function create_directory(dir_path:string, context='mkdr'){

}

export function create_directory_sync(dir_path:string, context='mkdr'){

}

export function create_directories(dir_paths:string, context='mkds'){

}

export function create_directories_sync(dir_paths:string, context='mkds'){

}

export function copy_file(src:string, dest:string, context='cp_f'){
	
}

export function copy_file_sync(src:string, dest:string, context='cp_f'){
	
}

export function copy_files(src:string, dest:string, context='cpfs'){

}

export function copy_files_sync(src:string, dest:string, context='cpfs'){

}

export function copy_directory(src:string, dest:string, context='cp_d'){

}

export function copy_directory_sync(src:string, dest:string, context='cp_d'){

}

export function copy_directories(src:string, dest:string, context='cpds'){

}

export function copy_directories_sync(src:string, dest:string, context='cpds'){

}

export function remove_file(file_path:string, context='rm_f'){

}

export function remove_file_sync(file_path:string, context='rm_f'){

}

export function remove_files(file_paths:string, context='rmfs'){

}

export function remove_files_sync(file_paths:string, context='rmfs'){

}

export function remove_directory(dir_path:string, context='rm_d'){
	
}

export function remove_directory_sync(dir_path:string, context='rm_d'){
	
}

export function remove_directories(dir_paths:string, context='rmds'){
	
}

export function remove_directories_sync(dir_paths:string, context='rmds'){
	
}




export function remove_folder_if_exists(context:string, folder_path:string)
		:void{
	if(fs.existsSync(folder_path)){
		output.start_loading(`Removing folder [${folder_path}]`);
		fs.rmdirSync(folder_path, {recursive: true});
		output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
	}
}

export function remove_file_if_exists(context:string, file_path:string)
		:void{
	if(fs.existsSync(file_path)){
		output.start_loading(`Removing file [${file_path}]`);
		fs.unlinkSync(file_path);
		output.done_verbose_log(context, `File [${file_path}] removed.`);
	}
}

export function create_folder_if_doesnt_exists(context:string, folder_path:string)
		:void{
	if(!fs.existsSync(folder_path)){
		try{
			output.start_loading(`Creating folder [${folder_path}]`);
			fs.mkdirSync(folder_path);
			output.done_verbose_log(context, `Folder [${folder_path}] created.`);
		}catch(ex){
			output.error_log(context, `Failed creating folder [${folder_path}]. ${ex.message}.`);
		}
	}
}

// export function rsync(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Rsync files [${source}] to [${destination}]...`);
//   sync_exec(`rsync -a ${source} ${destination}`);
//   output.done_verbose_log(context, `Rsynced files [${source}] to [${destination}]`);
// }

export function copy_files(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying files [${source}] to [${destination}]...`);
	sync_exec(`cp -rf -t ${destination} ${source}`,);
	output.done_verbose_log(context, `Copied files [${source}] to [${destination}]`);
}

export function copy_file(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying file [${source}] to [${destination}]...`);
	sync_exec(`cp ${source} ${destination}`);
	output.done_verbose_log(context, `Copied file [${source}] to [${destination}]`);
}

export function copy_folder(context:string, source:string, destination:string)
		:void{
	output.start_loading(`Copying folder [${source}] to [${destination}]...`);
	sync_exec(`cp -rf ${source} ${destination}`);
	output.done_verbose_log(context, `Copied folder [${source}] to [${destination}]`);
}

export function copy_file_sync(source:string, target:string):void {
	let target_file = target;
	if(fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
		target_file = path.join(target, path.basename(source));
	}
	fs.writeFileSync(target_file, fs.readFileSync(source));
	output.verbose_log('cp', `Copied file ${target_file}.`);
}

export function copy_folder_recursive_sync(source:string, target:string):void {
	let files = [];
	const target_folder = path.join(target, path.basename( source ));
	if(!fs.existsSync(target_folder)){
		fs.mkdirSync( target_folder );
	}
	if(fs.lstatSync(source).isDirectory()) {
		files = fs.readdirSync(source);
		files.forEach(function (file) {
			const cur_source = path.join(source, file);
			if(fs.lstatSync(cur_source).isDirectory()) {
				copy_folder_recursive_sync(cur_source, target_folder);
			}else if(!cur_source.endsWith('.swp')){
				copy_file_sync(cur_source, target_folder);
			}
		});
	}
}

export function delete_file_sync(file_path:string)
		:void{
	fs.unlinkSync(file_path);
	output.verbose_log('dl', `Deleted file ${file_path}.`);
}
