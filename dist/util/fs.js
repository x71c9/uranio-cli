"use strict";
/**
 * Util FS
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_file_sync = exports.copy_folder_recursive_sync = exports.copy_folder = exports.create_folder_if_doesnt_exists = exports.remove_file_if_exists = exports.remove_folder_if_exists = exports.remove_directories_sync = exports.remove_directories = exports.remove_directory_sync = exports.remove_directory = exports.remove_files_sync = exports.remove_files = exports.remove_file_sync = exports.remove_file = exports.copy_directories_sync = exports.copy_directories = exports.copy_directory_sync = exports.copy_directory = exports.copy_files_sync = exports.copy_files = exports.copy_file_sync = exports.copy_file = exports.create_directories_sync = exports.create_directories = exports.create_directory_sync = exports.create_directory = exports.create_files_sync = exports.create_files = exports.create_file_sync = exports.create_file = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const output = __importStar(require("../output/"));
function create_file(file_path, context = 'tch') {
    fs_1.default.writeFile(file_path, '', () => {
        output.verbose_log();
    });
}
exports.create_file = create_file;
function create_file_sync(file_path, context = 'tch') {
}
exports.create_file_sync = create_file_sync;
function create_files(file_paths, context = 'tchs') {
}
exports.create_files = create_files;
function create_files_sync(file_paths, context = 'tchs') {
}
exports.create_files_sync = create_files_sync;
function create_directory(dir_path, context = 'mkdr') {
}
exports.create_directory = create_directory;
function create_directory_sync(dir_path, context = 'mkdr') {
}
exports.create_directory_sync = create_directory_sync;
function create_directories(dir_paths, context = 'mkds') {
}
exports.create_directories = create_directories;
function create_directories_sync(dir_paths, context = 'mkds') {
}
exports.create_directories_sync = create_directories_sync;
function copy_file(src, dest, context = 'cp_f') {
}
exports.copy_file = copy_file;
function copy_file_sync(src, dest, context = 'cp_f') {
}
exports.copy_file_sync = copy_file_sync;
function copy_files(src, dest, context = 'cpfs') {
}
exports.copy_files = copy_files;
function copy_files_sync(src, dest, context = 'cpfs') {
}
exports.copy_files_sync = copy_files_sync;
function copy_directory(src, dest, context = 'cp_d') {
}
exports.copy_directory = copy_directory;
function copy_directory_sync(src, dest, context = 'cp_d') {
}
exports.copy_directory_sync = copy_directory_sync;
function copy_directories(src, dest, context = 'cpds') {
}
exports.copy_directories = copy_directories;
function copy_directories_sync(src, dest, context = 'cpds') {
}
exports.copy_directories_sync = copy_directories_sync;
function remove_file(file_path, context = 'rm_f') {
}
exports.remove_file = remove_file;
function remove_file_sync(file_path, context = 'rm_f') {
}
exports.remove_file_sync = remove_file_sync;
function remove_files(file_paths, context = 'rmfs') {
}
exports.remove_files = remove_files;
function remove_files_sync(file_paths, context = 'rmfs') {
}
exports.remove_files_sync = remove_files_sync;
function remove_directory(dir_path, context = 'rm_d') {
}
exports.remove_directory = remove_directory;
function remove_directory_sync(dir_path, context = 'rm_d') {
}
exports.remove_directory_sync = remove_directory_sync;
function remove_directories(dir_paths, context = 'rmds') {
}
exports.remove_directories = remove_directories;
function remove_directories_sync(dir_paths, context = 'rmds') {
}
exports.remove_directories_sync = remove_directories_sync;
function remove_folder_if_exists(context, folder_path) {
    if (fs_1.default.existsSync(folder_path)) {
        output.start_loading(`Removing folder [${folder_path}]`);
        fs_1.default.rmdirSync(folder_path, { recursive: true });
        output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
    }
}
exports.remove_folder_if_exists = remove_folder_if_exists;
function remove_file_if_exists(context, file_path) {
    if (fs_1.default.existsSync(file_path)) {
        output.start_loading(`Removing file [${file_path}]`);
        fs_1.default.unlinkSync(file_path);
        output.done_verbose_log(context, `File [${file_path}] removed.`);
    }
}
exports.remove_file_if_exists = remove_file_if_exists;
function create_folder_if_doesnt_exists(context, folder_path) {
    if (!fs_1.default.existsSync(folder_path)) {
        try {
            output.start_loading(`Creating folder [${folder_path}]`);
            fs_1.default.mkdirSync(folder_path);
            output.done_verbose_log(context, `Folder [${folder_path}] created.`);
        }
        catch (ex) {
            output.error_log(context, `Failed creating folder [${folder_path}]. ${ex.message}.`);
        }
    }
}
exports.create_folder_if_doesnt_exists = create_folder_if_doesnt_exists;
// export function rsync(context:string, source:string, destination:string)
//     :void{
//   output.start_loading(`Rsync files [${source}] to [${destination}]...`);
//   sync_exec(`rsync -a ${source} ${destination}`);
//   output.done_verbose_log(context, `Rsynced files [${source}] to [${destination}]`);
// }
function copy_files(context, source, destination) {
    output.start_loading(`Copying files [${source}] to [${destination}]...`);
    sync_exec(`cp -rf -t ${destination} ${source}`);
    output.done_verbose_log(context, `Copied files [${source}] to [${destination}]`);
}
exports.copy_files = copy_files;
function copy_file(context, source, destination) {
    output.start_loading(`Copying file [${source}] to [${destination}]...`);
    sync_exec(`cp ${source} ${destination}`);
    output.done_verbose_log(context, `Copied file [${source}] to [${destination}]`);
}
exports.copy_file = copy_file;
function copy_folder(context, source, destination) {
    output.start_loading(`Copying folder [${source}] to [${destination}]...`);
    sync_exec(`cp -rf ${source} ${destination}`);
    output.done_verbose_log(context, `Copied folder [${source}] to [${destination}]`);
}
exports.copy_folder = copy_folder;
function copy_file_sync(source, target) {
    let target_file = target;
    if (fs_1.default.existsSync(target) && fs_1.default.lstatSync(target).isDirectory()) {
        target_file = path_1.default.join(target, path_1.default.basename(source));
    }
    fs_1.default.writeFileSync(target_file, fs_1.default.readFileSync(source));
    output.verbose_log('cp', `Copied file ${target_file}.`);
}
exports.copy_file_sync = copy_file_sync;
function copy_folder_recursive_sync(source, target) {
    let files = [];
    const target_folder = path_1.default.join(target, path_1.default.basename(source));
    if (!fs_1.default.existsSync(target_folder)) {
        fs_1.default.mkdirSync(target_folder);
    }
    if (fs_1.default.lstatSync(source).isDirectory()) {
        files = fs_1.default.readdirSync(source);
        files.forEach(function (file) {
            const cur_source = path_1.default.join(source, file);
            if (fs_1.default.lstatSync(cur_source).isDirectory()) {
                copy_folder_recursive_sync(cur_source, target_folder);
            }
            else if (!cur_source.endsWith('.swp')) {
                copy_file_sync(cur_source, target_folder);
            }
        });
    }
}
exports.copy_folder_recursive_sync = copy_folder_recursive_sync;
function delete_file_sync(file_path) {
    fs_1.default.unlinkSync(file_path);
    output.verbose_log('dl', `Deleted file ${file_path}.`);
}
exports.delete_file_sync = delete_file_sync;
//# sourceMappingURL=fs.js.map