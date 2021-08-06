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
exports.spawn_log_command = exports.delete_file_sync = exports.copy_folder_recursive_sync = exports.copy_file_sync = exports.dependency_exists = exports.clone_repo_recursive = exports.clone_repo = exports.uninstall_dep = exports.install_dep_dev = exports.install_dep = exports.spawn_cmd = exports.sync_exec = exports.relative_to_absolute_path = exports.copy_folder = exports.copy_file = exports.copy_files = exports.create_folder_if_doesnt_exists = exports.remove_folder_if_exists = exports.pretty = exports.check_pacman = exports.check_repo = exports.set_pacman = exports.set_repo = exports.auto_set_project_root = exports.check_folder = exports.is_initialized = exports.read_rc_file = exports.merge_options = exports.watch_child_list = exports.child_list = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cp = __importStar(require("child_process"));
const prettier_1 = __importDefault(require("prettier"));
const urn_lib_1 = require("urn-lib");
const output = __importStar(require("../output/"));
const common = __importStar(require("../cmd/common"));
const types_1 = require("../types");
const defaults_1 = require("../conf/defaults");
let user_exit = false;
exports.child_list = [];
exports.watch_child_list = [];
process.on('SIGINT', function () {
    user_exit = true;
    process.stdout.write("\r--- Caught interrupt signal ---\n");
    for (let i = 0; i < exports.watch_child_list.length; i++) {
        const watch_child_object = exports.watch_child_list[i];
        watch_child_object.child.close().then(() => {
            output.log(watch_child_object.context, `Stop ${watch_child_object.text}`);
        });
    }
    for (let i = 0; i < exports.child_list.length; i++) {
        const child = exports.child_list[i];
        if (child.pid) {
            process.kill(child.pid);
        }
    }
});
function merge_options(options) {
    let k;
    for (k in defaults_1.conf) {
        if (typeof k !== typeof undefined && urn_lib_1.urn_util.object.has_key(options, k)) {
            defaults_1.conf[k] = options[k]; // TODO FIX THIS
        }
    }
}
exports.merge_options = merge_options;
function read_rc_file() {
    if (!is_initialized()) {
        let err = `URANIO was not initialized yet.`;
        err += ` Please run "uranio init" in order to initialize the repo.`;
        output.error_log('init', err);
        process.exit(1);
    }
    else {
        const rcfile_path = `${defaults_1.conf.root}/${defaults_1.jsonfile_path}`;
        try {
            const rc_content = fs_1.default.readFileSync(rcfile_path, 'utf8');
            const rc_obj = urn_lib_1.urn_util.json.clean_parse(rc_content);
            set_repo(rc_obj.repo);
            defaults_1.conf.repo = rc_obj.repo;
            defaults_1.conf.pacman = rc_obj.pacman;
        }
        catch (ex) {
            output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
            process.exit(1);
        }
    }
}
exports.read_rc_file = read_rc_file;
function is_initialized() {
    return (fs_1.default.existsSync(`${defaults_1.conf.root}/${defaults_1.jsonfile_path}`));
}
exports.is_initialized = is_initialized;
function check_folder(folder_path) {
    const data = fs_1.default.readdirSync(folder_path);
    for (const file of data) {
        if (file === 'package.json') {
            const package_json_path = `${folder_path}/${file}`;
            try {
                const content = fs_1.default.readFileSync(package_json_path, 'utf8');
                const pack = urn_lib_1.urn_util.json.clean_parse(content);
                if (pack.name === 'urn-cli') {
                    return false;
                }
                else if (pack.name === 'uranio') {
                    const bld_path = `${folder_path}/urn-bld`;
                    if (!fs_1.default.existsSync(bld_path)) {
                        return false;
                    }
                    defaults_1.conf.root = bld_path;
                    return true;
                }
                defaults_1.conf.root = folder_path;
                return true;
            }
            catch (ex) {
                output.error_log(`root`, `Invalid ${package_json_path}. ${ex.message}`);
                return false;
            }
        }
    }
    return false;
}
exports.check_folder = check_folder;
function auto_set_project_root() {
    output.start_loading('Getting project root...');
    let folder_path = process.cwd();
    while (!check_folder(folder_path)) {
        const arr_folder = folder_path.split('/');
        arr_folder.pop();
        folder_path = arr_folder.join('/');
        if (folder_path === '/') {
            throw new Error('Cannot find project root.');
        }
    }
    common.init_log();
    output.done_verbose_log('root', `$URNROOT$Project root found [${defaults_1.conf.root}]`);
}
exports.auto_set_project_root = auto_set_project_root;
function set_repo(repo) {
    if (check_repo(repo)) {
        defaults_1.conf.repo = repo;
    }
    else {
        const valid_repos_str = types_1.valid_repos().join(', ');
        let end_log = '';
        end_log += `Wrong repo. `;
        end_log += `Repo must be one of the following [${valid_repos_str}]`;
        output.wrong_end_log(end_log);
        process.exit(1);
    }
}
exports.set_repo = set_repo;
function set_pacman(pacman) {
    if (check_pacman(pacman)) {
        defaults_1.conf.pacman = pacman;
    }
    else {
        const valid_pacman_str = types_1.valid_pacman().join(', ');
        let end_log = '';
        end_log += `Wrong package manager. `;
        end_log += `Package manager must be one of the following [${valid_pacman_str}]`;
        output.wrong_end_log(end_log);
        process.exit(1);
    }
}
exports.set_pacman = set_pacman;
function check_repo(repo) {
    return urn_lib_1.urn_util.object.has_key(types_1.abstract_repos, repo);
}
exports.check_repo = check_repo;
function check_pacman(pacman) {
    return urn_lib_1.urn_util.object.has_key(types_1.abstract_pacman, pacman);
}
exports.check_pacman = check_pacman;
function pretty(filepath, parser = 'typescript') {
    output.start_loading(`Prettier [${filepath}]...`);
    const content = fs_1.default.readFileSync(filepath, 'utf8');
    const pretty_string = prettier_1.default.format(content, { useTabs: true, tabWidth: 2, parser: parser });
    fs_1.default.writeFileSync(filepath, pretty_string);
    // cp.execSync(`npx prettier --write ${filepath} --use-tabs --tab-width 2`);
    output.done_verbose_log('prtt', `Prettier [${filepath}] done.`);
}
exports.pretty = pretty;
function remove_folder_if_exists(context, folder_path) {
    if (fs_1.default.existsSync(folder_path)) {
        output.start_loading(`Removing folder [${folder_path}]`);
        fs_1.default.rmdirSync(folder_path, { recursive: true });
        // sync_exec(`rm -rf ${folder_path}`);
        output.done_verbose_log(context, `Folder [${folder_path}] removed.`);
    }
}
exports.remove_folder_if_exists = remove_folder_if_exists;
function create_folder_if_doesnt_exists(context, folder_path) {
    if (!fs_1.default.existsSync(folder_path)) {
        try {
            output.start_loading(`Creating folder [${folder_path}]`);
            fs_1.default.mkdirSync(folder_path);
            // sync_exec(`mkdir ${folder_path}`);
            output.done_verbose_log(context, `Folder [${folder_path}] created.`);
        }
        catch (ex) {
            output.error_log(context, `Failed creating folder [${folder_path}]. ${ex.message}.`);
        }
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
function relative_to_absolute_path(path) {
    if (path[path.length - 1] === '/') {
        path = path.substr(0, path.length - 1);
    }
    if (path[0] !== '/') {
        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }
        path = `${defaults_1.conf.root}/${path}`;
    }
    return path;
}
exports.relative_to_absolute_path = relative_to_absolute_path;
function sync_exec(command) {
    output.log(`exec`, `Executing ${command}`);
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
            spawn_cmd(_pacman_commands.install[defaults_1.conf.pacman](repo), context, action, resolve, reject);
        });
    });
}
exports.install_dep = install_dep;
function install_dep_dev(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `installing dev dependencies [${repo}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            spawn_cmd(_pacman_commands.install_dev[defaults_1.conf.pacman](repo), context, action, resolve, reject);
        });
    });
}
exports.install_dep_dev = install_dep_dev;
function uninstall_dep(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = `uninstalling dependencies [${repo}]`;
        output.verbose_log(context, `Started ${action}`);
        return new Promise((resolve, reject) => {
            spawn_cmd(_pacman_commands.uninstall[defaults_1.conf.pacman](repo), context, action, resolve, reject);
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
            let cmd = `git clone ${address} ${dest_folder} --progress`;
            cmd += (recursive === true) ? ` --recurse-submodules` : '';
            spawn_cmd(cmd, context, action, resolve, reject);
        });
    });
}
function dependency_exists(repo) {
    const package_json_path = `${defaults_1.conf.root}/package.json`;
    try {
        const data = fs_1.default.readFileSync(package_json_path, 'utf8');
        const package_data = urn_lib_1.urn_util.json.clean_parse(data);
        return (typeof package_data['dependencies'][repo] === 'string' ||
            typeof package_data['devDependencies'][repo] === 'string');
    }
    catch (ex) {
        output.wrong_end_log(`Invalid ${package_json_path}. ${ex.message}`);
        process.exit(1);
    }
}
exports.dependency_exists = dependency_exists;
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
function _clean_chunk(chunk) {
    const plain_text = chunk
        .toString()
        .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
        .replace(/\r?\n|\r/g, ' ');
    return plain_text;
}
function spawn_log_command(command, context, color) {
    const splitted_command = command.split(' ');
    const spawned = cp.spawn(splitted_command[0], splitted_command.slice(1));
    if (spawned.stdout) {
        spawned.stdout.setEncoding('utf8');
        spawned.stdout.on('data', (chunk) => {
            const splitted_chunk = chunk.split('\n');
            for (const split of splitted_chunk) {
                const plain_text = _clean_chunk(split);
                if (plain_text.includes('<error>')) {
                    output.error_log(context, plain_text);
                    // process.stdout.write(chunk);
                }
                else if (plain_text != '') {
                    output.verbose_log(context, plain_text, color);
                }
            }
        });
    }
    if (spawned.stderr) {
        spawned.stderr.setEncoding('utf8');
        spawned.stderr.on('data', (chunk) => {
            const splitted_chunk = chunk.split('\n');
            for (const split of splitted_chunk) {
                const plain_text = _clean_chunk(split);
                if (plain_text !== '') {
                    output.error_log(context, plain_text);
                }
                // process.stdout.write(chunk);
                // process.stderr.write(`[${context}] ${chunk}`);
            }
        });
    }
    spawned.on('close', (code) => {
        switch (code) {
            case 0: {
                output.verbose_log(context, `Closed.`, color);
                break;
            }
            default: {
                if (user_exit === false) {
                    output.error_log(context, `Child process exited with code ${code}`);
                }
            }
        }
    });
    spawned.on('error', (err) => {
        if (user_exit === false) {
            output.error_log(context, `${err}`);
        }
    });
    exports.child_list.push(spawned);
    return spawned;
}
exports.spawn_log_command = spawn_log_command;
const _pacman_commands = {
    install: {
        npm(repo) {
            return `npm i ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn add ${repo} --verbose`;
        }
    },
    install_dev: {
        npm(repo) {
            return `npm i --save-dev ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn add --dev ${repo} --verbose`;
        }
    },
    uninstall: {
        npm(repo) {
            return `npm uninstall ${repo} --verbose`;
        },
        yarn(repo) {
            return `yarn remove ${repo} --verbose`;
        }
    }
};
//# sourceMappingURL=util.js.map