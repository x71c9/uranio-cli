"use strict";
/**
 * Util FS
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
// import fs from 'fs-extra';
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FS {
    constructor(output) {
        this.output = output;
    }
    is_directory(path, context) {
        // if(!fs.existsSync(path)){
        //   return false;
        // }
        const is = fs_1.default.statSync(path).isDirectory();
        this.output.debug_log(`Is directory sync [${path}] [${is}]`, context);
        return is;
    }
    exists(path, context = 'exst') {
        const exists = fs_1.default.existsSync(path);
        this.output.debug_log(`Exists sync [${path}] [${exists}]`, context);
        return exists;
    }
    read_file(file_path, encoding, context = 'rdfl') {
        const read_file = fs_1.default.readFileSync(file_path, { encoding: encoding || 'utf8' });
        this.output.debug_log(`Opened file sync [${file_path}]`, context);
        return read_file;
    }
    read_dir(dir_path, context = 'rddi') {
        const read_dir = fs_1.default.readdirSync(dir_path);
        this.output.debug_log(`Read directory sync [${dir_path}]`, context);
        return read_dir;
    }
    write_file(file_path, content, encoding, context = 'wrfl') {
        const wrote_file = fs_1.default.writeFileSync(file_path, content, { encoding: encoding || 'utf8' });
        this.output.verbose_log(`Wrote file sync [${file_path}]`, context);
        return wrote_file;
    }
    create_file_async(file_path, context = 'tch') {
        fs_1.default.writeFile(file_path, '', () => {
            this.output.verbose_log(`Created file async [${file_path}]`, context);
        });
    }
    create_file(file_path, context = 'tch') {
        fs_1.default.writeFileSync(file_path, '');
        this.output.verbose_log(`Created file sync [${file_path}]`, context);
    }
    create_directory_async(dir_path, context = 'mkdr') {
        fs_1.default.mkdir(dir_path, () => {
            this.output.verbose_log(`Created directory async [${dir_path}]`, context);
        });
    }
    create_directory(dir_path, context = 'mkdr') {
        fs_1.default.mkdirSync(dir_path);
        this.output.verbose_log(`Created directory sync [${dir_path}]`, context);
    }
    copy_file_async(src, dest, context = 'cp_f') {
        fs_1.default.copyFile(src, dest, () => {
            this.output.verbose_log(`Copied file async [${src}] to [${dest}]`, context);
        });
    }
    copy_file(src, dest, context = 'cp_f') {
        fs_1.default.copyFileSync(src, dest);
        this.output.verbose_log(`Copied file sync [${src}] to [${dest}]`, context);
    }
    // public copy_directory_async(src:string, dest:string, context='cp_d'){
    //   fs.copy(src, dest, {recursive: true}, () => {
    //     this.output.verbose_log(`Copied directory async [${src}] to [${dest}]`, context);
    //   });
    // }
    /**
     * It will copy all files in src folder inside dest folder.
     * If dest folder does not exist it will create it.
     */
    copy_directory(src, dest, context = 'cp_d') {
        // fs.copySync(src, dest, {recursive: true});
        if (!fs_1.default.lstatSync(src).isDirectory()) {
            this.output.error_log(`Provided src path is not a directory [${src}]`, context);
            process.exit(1);
        }
        if (!fs_1.default.existsSync(dest)) {
            fs_1.default.mkdirSync(dest, { recursive: true });
        }
        const files = fs_1.default.readdirSync(src);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const current_src = path_1.default.join(src, file);
            const target_src = path_1.default.join(dest, path_1.default.basename(current_src));
            if (fs_1.default.lstatSync(current_src).isDirectory()) {
                this.copy_directory(current_src, target_src);
            }
            else {
                this.copy_file(current_src, target_src);
            }
        }
        this.output.verbose_log(`Copied directory sync [${src}] to [${dest}]`, context);
    }
    remove_file_async(file_path, context = 'rm_f') {
        if (!fs_1.default.existsSync(file_path)) {
            return;
        }
        fs_1.default.unlink(file_path, () => {
            this.output.verbose_log(`Removed file async [${file_path}]`, context);
        });
    }
    remove_file(file_path, context = 'rm_f') {
        if (!fs_1.default.existsSync(file_path)) {
            return;
        }
        fs_1.default.unlinkSync(file_path);
        this.output.verbose_log(`Removed file sync [${file_path}]`, context);
    }
    remove_directory_async(dir_path, context = 'rm_d') {
        if (!fs_1.default.existsSync(dir_path)) {
            return;
        }
        fs_1.default.rmdir(dir_path, { recursive: true }, () => {
            this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
        });
    }
    remove_directory(dir_path, context = 'rm_d') {
        if (!fs_1.default.existsSync(dir_path)) {
            return;
        }
        fs_1.default.rmdirSync(dir_path, { recursive: true });
        this.output.verbose_log(`Removed directory sync [${dir_path}]`, context);
    }
}
function create(output) {
    return new FS(output);
}
exports.create = create;
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
//# sourceMappingURL=fs.js.map