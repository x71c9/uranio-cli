/**
 * Util FS
 *
 * @packageDocumentation
 */

// import fs from 'fs-extra';
import fs from 'fs';

import path from 'path';

import * as out from '../output/';

class FS {
	
	constructor(public output:out.OutputInstance){}
	
	public is_directory(path:string, context?:string){
		// if(!fs.existsSync(path)){
		//   return false;
		// }
		const is = fs.statSync(path).isDirectory();
		this.output.debug_log(`Is directory sync [${path}] [${is}]`, context);
		return is;
	}
	
	public exists(path:string, context='exst'){
		const exists = fs.existsSync(path);
		this.output.debug_log(`Exists sync [${path}] [${exists}]`, context);
		return exists;
	}
	
	public read_file(file_path:string, encoding?:BufferEncoding, context='rdfl'){
		const read_file = fs.readFileSync(file_path, {encoding: encoding || 'utf8'});
		this.output.debug_log(`Opened file sync [${file_path}]`, context);
		return read_file;
	}
	
	public read_dir(dir_path:string, context='rddi'){
		const read_dir = fs.readdirSync(dir_path);
		this.output.debug_log(`Read directory sync [${dir_path}]`, context);
		return read_dir;
	}
	
	public write_file(file_path:string, content:string, encoding?:BufferEncoding, context='wrfl'){
		fs.mkdirSync(path.dirname(file_path), {recursive: true});
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
	
	public copy_file_async(src:string, dest:string, context='cp_f'){
		fs.mkdir(path.dirname(dest), {recursive: true}, () => {
			fs.copyFile(src, dest, () => {
				this.output.verbose_log(`Copied file async [${src}] to [${dest}]`, context);
			});
		});
	}
	
	public copy_file(src:string, dest:string, context='cp_f'){
		fs.mkdirSync(path.dirname(dest), {recursive: true});
		fs.copyFileSync(src, dest);
		this.output.verbose_log(`Copied file sync [${src}] to [${dest}]`, context);
	}
	
	/**
	 * It will copy all files in src folder inside dest folder.
	 * If dest folder does not exist it will create it.
	 */
	public copy_directory(src:string, dest:string, context='cp_d', exclude?:string[]|RegExp[]){
		// fs.copySync(src, dest, {recursive: true});
		if(!fs.lstatSync(src).isDirectory()) {
			this.output.error_log(`Provided src path is not a directory [${src}]`, context);
			process.exit(1);
		}
		if(!fs.existsSync(dest)) {
			fs.mkdirSync(dest, {recursive: true});
		}
		this.output.start_loading(`Copying directory [${src}] to [${dest}]...`);
		const files = fs.readdirSync(src);
		fileloop:
		for(let i = 0; i < files.length; i++){
			const file = files[i];
			if(exclude && Array.isArray(exclude)){
				for(let e = 0; e < exclude.length; e++){
					const exc = exclude[e] as unknown;
					if(!(exc instanceof RegExp) && file === exc){
						continue fileloop;
					}
					if(exc instanceof RegExp && file.match(exc) !== null){
						continue fileloop;
					}
				}
			}
			const current_src = path.join(src, file);
			const target_src = path.join(dest, path.basename(current_src));
			if(fs.lstatSync(current_src).isDirectory()) {
				this.copy_directory(current_src, target_src, context, exclude);
			}else{
				this.copy_file(current_src, target_src);
			}
		}
		this.output.verbose_log(`Copied directory sync [${src}] to [${dest}]`, context);
	}
	
	public remove_file_async(file_path:string, context='rm_f'){
		if(!fs.existsSync(file_path)){
			return;
		}
		fs.unlink(file_path, () => {
			this.output.verbose_log(`Removed file async [${file_path}]`, context);
		});
	}
	
	public remove_file(file_path:string, context='rm_f'){
		if(!fs.existsSync(file_path)){
			return;
		}
		fs.unlinkSync(file_path);
		this.output.verbose_log(`Removed file sync [${file_path}]`, context);
	}
	
	public remove_directory_async(dir_path:string, context='rm_d'){
		if(!fs.existsSync(dir_path)){
			return;
		}
		// rmdir is deprecated
		// fs.rmdir(dir_path, {recursive: true}, () => {
		//   this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
		// });
		fs.rm(dir_path, {recursive: true}, () => {
			this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
		});
	}
	
	public remove_directory(dir_path:string, context='rm_d'){
		if(!fs.existsSync(dir_path)){
			return;
		}
		// fs.rmdirSync(dir_path, {recursive: true});
		fs.rmSync(dir_path, {recursive: true});
		this.output.verbose_log(`Removed directory sync [${dir_path}]`, context);
	}
	
}

export type FSInstance = InstanceType<typeof FS>;

export function create(output:out.OutputInstance):FSInstance{
	return new FS(output);
}

