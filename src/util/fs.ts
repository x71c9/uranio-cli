/**
 * Util FS
 *
 * @packageDocumentation
 */

import fs from 'fs-extra';

// import path from 'path';

import * as out from '../output/';

class FS {
	
	constructor(public output:out.OutputInstance){}
	
	public is_directory(path:string, context?:string){
		const is = fs.statSync(path).isDirectory();
		this.output.verbose_log(`Is directory sync [${path}] [${is}]`, context);
		return is;
	}
	
	public exists(path:string, context='exst'){
		const exists = fs.existsSync(path);
		this.output.verbose_log(`Exists sync [${path}]`, context);
		return exists;
	}
	
	public read_file(file_path:string, encoding?:BufferEncoding, context='rdfl'){
		const read_file = fs.readFileSync(file_path, {encoding: encoding || 'utf8'});
		this.output.verbose_log(`Opened file sync [${file_path}]`, context);
		return read_file;
	}
	
	public read_dir(dir_path:string, context='rddi'){
		const read_dir = fs.readdirSync(dir_path);
		this.output.verbose_log(`Read directory sync [${dir_path}]`, context);
		return read_dir;
	}
	
	public write_file(file_path:string, content:string, encoding?:BufferEncoding, context='wrfl'){
		const wrote_file = fs.writeFileSync(file_path, content, {encoding: encoding || 'utf8'});
		this.output.verbose_log(`Wrote file sync [${file_path}]`, context);
		return wrote_file;
	}
	
	public create_file_async(file_path:string, context='tch'){
		fs.writeFile(file_path, '', () => {
			this.output.verbose_log(`Created file async [${file_path}]`, context);
		});
	}
	
	public create_file(file_path:string, context='tch'){
		fs.writeFileSync(file_path, '');
		this.output.verbose_log(`Created file sync [${file_path}]`, context);
	}
	
	public create_directory_async(dir_path:string, context='mkdr'){
		fs.mkdir(dir_path, () => {
			this.output.verbose_log(`Created directory async [${dir_path}]`, context);
		});
	}
	
	public create_directory(dir_path:string, context='mkdr'){
		fs.mkdirSync(dir_path);
		this.output.verbose_log(`Created directory sync [${dir_path}]`, context);
	}
	
	// public copy(dir_src:string, dir_dest:string, filter:(src:string, dest?:string) => boolean, context='cpp'){
	//   fs.copy(dir_src, dir_dest, {filter: filter});
	//   this.output.verbose_log(`Copied file sync with filter [${dir_src}] to [${dir_dest}]`, context);
	// }
	
	public copy_file_async(src:string, dest:string, context='cp_f'){
		fs.copyFile(src, dest, () => {
			this.output.verbose_log(`Copied file async [${src}] to [${dest}]`, context);
		});
	}
	
	public copy_file(src:string, dest:string, context='cp_f'){
		fs.copyFileSync(src, dest);
		this.output.verbose_log(`Copied file sync [${src}] to [${dest}]`, context);
	}
	
	public copy_directory_async(src:string, dest:string, context='cp_d'){
		fs.copy(src, dest, {recursive: true}, () => {
			this.output.verbose_log(`Copied directory async [${src}] to [${dest}]`, context);
		});
	}
	
	public copy_directory(src:string, dest:string, context='cp_d'){
		fs.copySync(src, dest, {recursive: true});
		this.output.verbose_log(`Copied directory sync [${src}] to [${dest}]`, context);
	}
	
	public remove_file_async(file_path:string, context='rm_f'){
		fs.remove(file_path, () => {
			this.output.verbose_log(`Removed file async [${file_path}]`, context);
		});
	}
	
	public remove_file(file_path:string, context='rm_f'){
		fs.removeSync(file_path);
		this.output.verbose_log(`Removed file sync sync [${file_path}]`, context);
	}
	
	public remove_directory_async(dir_path:string, context='rm_d'){
		fs.remove(dir_path, () => {
			this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
		});
	}
	
	public remove_directory(dir_path:string, context='rm_d'){
		fs.removeSync(dir_path);
		this.output.verbose_log(`Removed directory sync [${dir_path}]`, context);
	}
	
}

export type FSInstance = InstanceType<typeof FS>;

export function create(output:out.OutputInstance):FSInstance{
	return new FS(output);
}



// export function remove_folder_if_exists(context:string, folder_path:string)
//     :void{
//   if(fs.existsSync(folder_path)){
//     output.start_loading(`Removing folder [${folder_path}]`);
//     fs.rmdirSync(folder_path, {recursive: true});
//     output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
//   }
// }

// export function remove_file_if_exists(context:string, file_path:string)
//     :void{
//   if(fs.existsSync(file_path)){
//     output.start_loading(`Removing file [${file_path}]`);
//     fs.unlinkSync(file_path);
//     output.done_verbose_log(context, `File [${file_path}] removed.`);
//   }
// }

// export function create_folder_if_doesnt_exists(context:string, folder_path:string)
//     :void{
//   if(!fs.existsSync(folder_path)){
//     try{
//       output.start_loading(`Creating folder [${folder_path}]`);
//       fs.mkdirSync(folder_path);
//       output.done_verbose_log(context, `Folder [${folder_path}] created.`);
//     }catch(ex){
//       output.error_log(context, `Failed creating folder [${folder_path}]. ${ex.message}.`);
//     }
//   }
// }

// export function rsync(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Rsync files [${source}] to [${destination}]...`);
//   sync_exec(`rsync -a ${source} ${destination}`);
//   output.done_verbose_log(context, `Rsynced files [${source}] to [${destination}]`);
// }

// export function copy_files(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Copying files [${source}] to [${destination}]...`);
//   sync_exec(`cp -rf -t ${destination} ${source}`,);
//   output.done_verbose_log(context, `Copied files [${source}] to [${destination}]`);
// }

// export function copy_file(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Copying file [${source}] to [${destination}]...`);
//   sync_exec(`cp ${source} ${destination}`);
//   output.done_verbose_log(context, `Copied file [${source}] to [${destination}]`);
// }

// export function copy_folder(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Copying folder [${source}] to [${destination}]...`);
//   sync_exec(`cp -rf ${source} ${destination}`);
//   output.done_verbose_log(context, `Copied folder [${source}] to [${destination}]`);
// }

// export function copy_file_sync(source:string, target:string):void {
//   let target_file = target;
//   if(fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
//     target_file = path.join(target, path.basename(source));
//   }
//   fs.writeFileSync(target_file, fs.readFileSync(source));
//   output.verbose_log('cp', `Copied file ${target_file}.`);
// }

// export function copy_folder_recursive_sync(source:string, target:string):void {
//   let files = [];
//   const target_folder = path.join(target, path.basename( source ));
//   if(!fs.existsSync(target_folder)){
//     fs.mkdirSync( target_folder );
//   }
//   if(fs.lstatSync(source).isDirectory()) {
//     files = fs.readdirSync(source);
//     files.forEach(function (file) {
//       const cur_source = path.join(source, file);
//       if(fs.lstatSync(cur_source).isDirectory()) {
//         copy_folder_recursive_sync(cur_source, target_folder);
//       }else if(!cur_source.endsWith('.swp')){
//         copy_file_sync(cur_source, target_folder);
//       }
//     });
//   }
// }

// export function delete_file_sync(file_path:string)
//     :void{
//   fs.unlinkSync(file_path);
//   output.verbose_log('dl', `Deleted file ${file_path}.`);
// }
