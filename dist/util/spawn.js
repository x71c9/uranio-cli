"use strict";
/**
 * Util Spawn
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.create = void 0;
const cp = __importStar(require("child_process"));
const is_docker_1 = __importDefault(require("is-docker"));
const child_list = [];
// const child_list_detached:cp.ChildProcessWithoutNullStreams[] = [];
const child_outputs = {};
process.on('SIGINT', function () {
    process.stdout.write("\r--- Caught interrupt signal [spawn] ---\n");
    if ((0, is_docker_1.default)()) {
        process.stdout.write("\r--- For interrupting inside Docker press Ctrl + \\ ---\n");
    }
    for (let i = 0; i < child_list.length; i++) {
        const child = child_list[i];
        if (child.pid) {
            process.kill(child.pid);
        }
    }
    // for(let i = 0; i < child_list_detached.length; i++){
    //   const child = child_list_detached[i];
    //   if(child.pid){
    //     // Minus symbol "-" is needed for detached process child.
    //     process.kill(-child.pid);
    //   }
    // }
});
class Spawn {
    constructor(output) {
        this.output = output;
    }
    exec_sync(command) {
        this.output.trace_log(command);
        cp.execSync(command);
    }
    native({ command, action, over = '', prefix = '', resolve, reject, detached = false, no_log_on_error = false }) {
        return this._native_spawn({
            command,
            action,
            spin: false,
            over,
            prefix,
            resolve,
            reject,
            detached,
            no_log_on_error
        });
    }
    spin(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: true,
            verbose: false,
            debug: false,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    info_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: false,
            verbose: false,
            debug: false,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    debug_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: false,
            verbose: true,
            debug: false,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    trace_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: false,
            verbose: false,
            debug: true,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    spin_and_native(command, action, over = '', prefix = '', resolve, reject, detached = false, no_log_on_error = false) {
        return this._native_spawn({
            command,
            action,
            spin: true,
            over,
            prefix,
            resolve,
            reject,
            detached,
            no_log_on_error
        });
    }
    spin_and_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: true,
            verbose: false,
            debug: false,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    spin_and_verbose_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: true,
            verbose: true,
            debug: false,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    spint_and_trace_log(command, action, prefix = '', resolve, reject, detached = false) {
        return this._spawn({
            command,
            action,
            spin: true,
            verbose: false,
            debug: true,
            prefix,
            resolve,
            reject,
            detached
        });
    }
    async spin_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.spin(command, action, prefix, resolve, reject, detached);
        });
    }
    async native_promise(command, action, over = '', prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.native({
                command, action, over, prefix, resolve, reject, detached
            });
        });
    }
    async info_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.info_log(command, action, prefix, resolve, reject, detached);
        });
    }
    async debug_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.debug_log(command, action, prefix, resolve, reject, detached);
        });
    }
    async trace_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.trace_log(command, action, prefix, resolve, reject, detached);
        });
    }
    async spin_and_native_promise(command, action, over = '', prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.spin_and_native(command, action, over, prefix, resolve, reject, detached);
        });
    }
    async spin_and_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.spin_and_log(command, action, prefix, resolve, reject, detached);
        });
    }
    async spin_and_verbose_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.spin_and_verbose_log(command, action, prefix, resolve, reject, detached);
        });
    }
    async spin_and_trace_log_promise(command, action, prefix = '', detached = false) {
        return await new Promise((resolve, reject) => {
            return this.spint_and_trace_log(command, action, prefix, resolve, reject, detached);
        });
    }
    _native_spawn({ command, action, spin, over = '', prefix, resolve, reject, detached = false, no_log_on_error = false }) {
        if (spin) {
            this.output.start_loading(command);
        }
        this.output.trace_log(`$ ${command}`);
        // const controller = new AbortController();
        // const { signal } = controller;
        // const child = cp.spawn(command, {shell: true, detached: detached, signal});
        const child = cp.spawn(command, { shell: true, detached: detached });
        if (child.stdout) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (chunk) => {
                const splitted_chunk = chunk.split('\n');
                for (const split of splitted_chunk) {
                    if (spin) {
                        const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
                        this.output.spinner_text(plain_spin_text);
                    }
                    let plain_text = this.output.clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (prefix) {
                        plain_text = `${prefix} ${plain_text}`;
                    }
                    this.output.translate_loglevel(plain_text, over);
                    _append(child_outputs[child.pid || 'pid0'], plain_text);
                }
            });
        }
        if (child.stderr) {
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', (chunk) => {
                const splitted_chunk = chunk.split('\n');
                for (const split of splitted_chunk) {
                    if (spin) {
                        const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
                        this.output.spinner_text(plain_spin_text);
                    }
                    let plain_text = this.output.clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (prefix) {
                        plain_text = `${prefix} ${plain_text}`;
                    }
                    this.output.translate_loglevel(plain_text, over);
                    _append(child_outputs[child.pid || 'pid0'], plain_text);
                }
            });
        }
        child.on('error', (err) => {
            this.output.error_log(`${err}`);
            return (reject) ? reject() : false;
        });
        child.on('close', (code) => {
            this.output.stop_loading();
            switch (code) {
                case 0: {
                    this.output.done_debug_log(`Done ${action}`);
                    return (resolve) ? resolve(true) : true;
                }
                // case 6:{
                // 	this.output.warn_log(`Restarting...`);
                // 	return (resolve) ? resolve(true) : true;
                // }
                default: {
                    if (no_log_on_error === true) {
                        return;
                    }
                    if (code !== null) {
                        _print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
                    }
                    this.output.error_log(`Error on: ${command}`);
                    this.output.error_log(`Child process exited with code ${code}`);
                    // return (reject) ? reject() : false;
                }
            }
        });
        // if(detached){
        //   child_list_detached.push(child);
        // }else{
        child_list.push(child);
        // }
        child_outputs[child.pid || 'pid0'] = [];
        return child;
        // return controller;
    }
    _spawn({ command, action, spin, verbose, debug, prefix, resolve, reject, detached = false, no_log_on_error = false }) {
        if (spin) {
            this.output.start_loading(command);
        }
        const prefix_command = (prefix) ? `${prefix} ` : '';
        this.output.debug_log(`${prefix_command}$ ${command}`);
        const child = cp.spawn(command, { shell: true, detached: detached });
        if (child.stdout) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (chunk) => {
                if (spin) {
                    const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
                    this.output.spinner_text(plain_spin_text);
                }
                const splitted_chunk = chunk.split('\n');
                for (const split of splitted_chunk) {
                    let plain_text = this.output.clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (prefix) {
                        plain_text = `${prefix} ${plain_text}`;
                    }
                    if (verbose) {
                        this.output.debug_log(plain_text);
                    }
                    if (debug) {
                        this.output.trace_log(plain_text);
                    }
                    _append(child_outputs[child.pid || 'pid0'], plain_text);
                }
            });
        }
        if (child.stderr) {
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', (chunk) => {
                if (spin) {
                    const plain_spin_text = chunk.replace(/\r?\n|\r/g, ' ');
                    this.output.spinner_text(plain_spin_text);
                }
                const splitted_chunk = chunk.split('\n');
                for (const split of splitted_chunk) {
                    let plain_text = this.output.clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (prefix) {
                        plain_text = `${prefix} ${plain_text}`;
                    }
                    if (verbose) {
                        this.output.debug_log(plain_text);
                    }
                    if (debug) {
                        this.output.trace_log(plain_text);
                    }
                    _append(child_outputs[child.pid || 'pid0'], plain_text);
                }
            });
        }
        child.on('error', (err) => {
            this.output.error_log(`${err}`);
            return (reject) ? reject() : false;
        });
        child.on('close', (code) => {
            this.output.stop_loading();
            switch (code) {
                case 0: {
                    if (!verbose && !debug && !spin) {
                        this.output.done_log(`Done ${action}`);
                    }
                    if (verbose) {
                        this.output.done_debug_log(`Done ${action}`);
                    }
                    return (resolve) ? resolve(true) : true;
                }
                default: {
                    if (no_log_on_error === true) {
                        return;
                    }
                    if (code !== null) {
                        _print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
                    }
                    this.output.error_log(`Error on: ${command}`);
                    this.output.error_log(`Child process exited with code ${code}`);
                    // return (reject) ? reject() : false;
                }
            }
        });
        // if(detached){
        //   child_list_detached.push(child);
        // }else{
        child_list.push(child);
        // }
        child_outputs[child.pid || 'pid0'] = [];
        return child;
    }
}
function _print_cached_output(cached, output) {
    for (const s of cached) {
        output.error_log(s);
    }
}
function _append(arr, value) {
    arr.push(value);
    while (arr.length > 15) {
        arr.shift();
    }
}
function create(output) {
    return new Spawn(output);
}
exports.create = create;
//# sourceMappingURL=spawn.js.map