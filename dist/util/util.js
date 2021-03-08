"use strict";
/**
 * Util
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone_repo_recursive = exports.clone_repo = exports.uninstall_dep = exports.install_dep_dev = exports.install_dep = exports.spawn_cmd = exports.sync_exec = exports.copy_folder = exports.copy_file = exports.copy_files = exports.create_folder_if_doesnt_exists = exports.remove_folder_if_exists = exports.prettier = exports.check_repo = exports.check_if_initialized = void 0;
const fs_1 = __importDefault(require("fs"));
const cp = __importStar(require("child_process"));
const output = __importStar(require("../log/"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
function check_if_initialized() {
    const rc_file_path = `${global.uranio.root}/${defaults_1.defaults.rcfile_path}`;
    if (!fs_1.default.existsSync(rc_file_path)) {
        let err = `URANIO was not initialized yet.`;
        err += ` Please run "uranio init" in order to initialize the repo.`;
        output.error_log('init', err);
        process.exit(1);
    }
    else {
        const rc_content = fs_1.default.readFileSync(rc_file_path, 'utf8');
        const rc_obj = JSON.parse(rc_content);
        check_repo(rc_obj.repo);
        global.uranio.repo = rc_obj.repo;
    }
}
exports.check_if_initialized = check_if_initialized;
function check_repo(repo) {
    switch (repo) {
        case 'core':
        case 'web': {
            global.uranio.repo = repo;
            break;
        }
        default: {
            const valid_repos_str = types_1.valid_repos().join(', ');
            let end_log = '';
            end_log += `Wrong repo. `;
            end_log += `Repo must be one of the following [${valid_repos_str}]`;
            output.end_log(end_log);
            process.exit(1);
        }
    }
}
exports.check_repo = check_repo;
function prettier(path) {
    output.start_loading(`Prettier [${path}]...`);
    cp.execSync(`npx prettier --write ${path} --use-tabs --tab-width 2`);
    output.done_verbose_log('prtt', `Prettier [${path}] done.`);
}
exports.prettier = prettier;
function remove_folder_if_exists(context, folder_path) {
    if (fs_1.default.existsSync(folder_path)) {
        output.start_loading(`Removing folder [${folder_path}]`);
        sync_exec(`rm -rf ${folder_path}`);
        output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
    }
}
exports.remove_folder_if_exists = remove_folder_if_exists;
function create_folder_if_doesnt_exists(context, folder_path) {
    if (!fs_1.default.existsSync(folder_path)) {
        output.start_loading(`Creating folder [${folder_path}]`);
        sync_exec(`mkdir ${folder_path}`);
        output.done_verbose_log(context, `Folder [${folder_path}] created.`);
    }
}
exports.create_folder_if_doesnt_exists = create_folder_if_doesnt_exists;
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
function sync_exec(command) {
    cp.execSync(command);
}
exports.sync_exec = sync_exec;
function spawn_cmd(command, context, action, resolve, reject) {
    output.start_loading(`${action}...`);
    const splitted_command = command.split(' ');
    const first_command = splitted_command[0];
    splitted_command.shift();
    const child = cp.spawn(first_command, splitted_command);
    output.verbose_log(context, command);
    if (child.stdout) {
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
            output.spinner_text(plain_text);
        });
    }
    if (child.stderr) {
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => {
            const plain_text = chunk.replace(/\r?\n|\r/g, ' ');
            output.spinner_text(plain_text);
        });
    }
    child.on('close', (code) => {
        switch (code) {
            case 0: {
                output.done_verbose_log(context, `Done ${action}`);
                return resolve(true);
            }
            default: {
                output.error_log(context, `Child process exited with code ${code}`);
                return reject(false);
            }
        }
    });
    child.on('error', (err) => {
        output.error_log(context, `${err}`);
        return reject(false);
    });
}
exports.spawn_cmd = spawn_cmd;
function install_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `installing dependencies [${repo}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            spawn_cmd(`npm i ${repo} --verbose`, context, action, resolve, reject);
        });
    });
}
exports.install_dep = install_dep;
function install_dep_dev(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `installing dev dependencies [${repo}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            spawn_cmd(`npm i ${repo} --save-dev --verbose`, context, action, resolve, reject);
        });
    });
}
exports.install_dep_dev = install_dep_dev;
function uninstall_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `uninstalling dependencies [${repo}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            spawn_cmd(`npm uninstall ${repo} --verbose`, context, action, resolve, reject);
        });
    });
}
exports.uninstall_dep = uninstall_dep;
function clone_repo(context, address, dest_folder) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _clone_repo(context, address, dest_folder);
    });
}
exports.clone_repo = clone_repo;
function clone_repo_recursive(context, address, dest_folder) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _clone_repo(context, address, dest_folder, true);
    });
}
exports.clone_repo_recursive = clone_repo_recursive;
function _clone_repo(context, address, dest_folder, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `cloning repo [${address}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            let cmd = `git clone ${address} ${global.uranio.root}/${dest_folder} --progress`;
            cmd += (recursive === true) ? ` --recurse-submodules` : '';
            spawn_cmd(cmd, context, action, resolve, reject);
        });
    });
}
//# sourceMappingURL=util.js.map