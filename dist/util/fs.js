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
        fs_1.default.mkdirSync(path_1.default.dirname(file_path), { recursive: true });
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
        fs_1.default.mkdir(path_1.default.dirname(dest), { recursive: true }, () => {
            fs_1.default.copyFile(src, dest, () => {
                this.output.verbose_log(`Copied file async [${src}] to [${dest}]`, context);
            });
        });
    }
    copy_file(src, dest, context = 'cp_f') {
        fs_1.default.mkdirSync(path_1.default.dirname(dest), { recursive: true });
        fs_1.default.copyFileSync(src, dest);
        this.output.verbose_log(`Copied file sync [${src}] to [${dest}]`, context);
    }
    /**
     * It will copy all files in src folder inside dest folder.
     * If dest folder does not exist it will create it.
     */
    copy_directory(src, dest, context = 'cp_d', exclude) {
        // fs.copySync(src, dest, {recursive: true});
        if (!fs_1.default.lstatSync(src).isDirectory()) {
            this.output.error_log(`Provided src path is not a directory [${src}]`, context);
            process.exit(1);
        }
        if (!fs_1.default.existsSync(dest)) {
            fs_1.default.mkdirSync(dest, { recursive: true });
        }
        this.output.start_loading(`Copying directory [${src}] to [${dest}]...`);
        const files = fs_1.default.readdirSync(src);
        fileloop: for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (exclude && Array.isArray(exclude)) {
                for (let e = 0; e < exclude.length; e++) {
                    const exc = exclude[e];
                    if (!(exc instanceof RegExp) && file === exc) {
                        continue fileloop;
                    }
                    if (exc instanceof RegExp && file.match(exc) !== null) {
                        continue fileloop;
                    }
                }
            }
            const current_src = path_1.default.join(src, file);
            const target_src = path_1.default.join(dest, path_1.default.basename(current_src));
            if (fs_1.default.lstatSync(current_src).isDirectory()) {
                this.copy_directory(current_src, target_src, context, exclude);
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
        // rmdir is deprecated
        // fs.rmdir(dir_path, {recursive: true}, () => {
        //   this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
        // });
        fs_1.default.rm(dir_path, { recursive: true }, () => {
            this.output.verbose_log(`Removed directory async [${dir_path}]`, context);
        });
    }
    remove_directory(dir_path, context = 'rm_d') {
        if (!fs_1.default.existsSync(dir_path)) {
            return;
        }
        // fs.rmdirSync(dir_path, {recursive: true});
        fs_1.default.rmSync(dir_path, { recursive: true });
        this.output.verbose_log(`Removed directory sync [${dir_path}]`, context);
    }
}
function create(output) {
    return new FS(output);
}
exports.create = create;
//# sourceMappingURL=fs.js.map