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
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const cp = __importStar(require("child_process"));
const child_list = [];
// const child_list_detached:cp.ChildProcessWithoutNullStreams[] = [];
const child_outputs = {};
process.on('SIGINT', function () {
    process.stdout.write("\r--- Caught interrupt signal [spawn] ---\n");
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
        this.output.verbose_log(command, 'exec');
        cp.execSync(command);
    }
    spin(command, context, action, color, resolve, reject, detached = false) {
        this.output.debug_log(command, 'spin');
        return this._spawn(command, context, action, true, false, false, color, resolve, reject, detached);
    }
    log(command, context, action, color, resolve, reject, detached = false) {
        this.output.debug_log(command, 'log');
        return this._spawn(command, context, action, false, true, false, color, resolve, reject, detached);
    }
    verbose_log(command, context, action, color, resolve, reject, detached = false) {
        this.output.debug_log(command, 'verbose log');
        return this._spawn(command, context, action, false, false, true, color, resolve, reject, detached);
    }
    spin_and_log(command, context, action, color, resolve, reject, detached = false) {
        this.output.debug_log(command, 'spin and log');
        return this._spawn(command, context, action, true, true, false, color, resolve, reject, detached);
    }
    spin_and_verbose_log(command, context, action, color, resolve, reject, detached = false) {
        this.output.debug_log(command, 'spin and verbose');
        return this._spawn(command, context, action, true, false, true, color, resolve, reject, detached);
    }
    _spawn(command, context, action, spin, log, verbose, color, resolve, reject, detached = false) {
        if (spin && verbose) {
            this.output.start_loading(command);
        }
        if (log) {
            this.output.log(command, context, color);
        }
        else if (verbose) {
            this.output.verbose_log(command, context, color);
        }
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
                    const plain_text = _clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (log) {
                        this.output.log(plain_text, context, color);
                    }
                    if (verbose) {
                        this.output.verbose_log(plain_text, context, color);
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
                    const plain_text = _clean_chunk(split);
                    if (plain_text === '') {
                        continue;
                    }
                    if (log) {
                        this.output.log(plain_text, context, color);
                    }
                    if (verbose) {
                        this.output.verbose_log(plain_text, context, color);
                    }
                    _append(child_outputs[child.pid || 'pid0'], plain_text);
                }
            });
        }
        child.on('error', (err) => {
            this.output.error_log(`${err}`, context);
            return (reject) ? reject() : false;
        });
        child.on('close', (code) => {
            this.output.stop_loading();
            switch (code) {
                case 0: {
                    if (log) {
                        this.output.done_log(`Done ${action}`, context);
                    }
                    if (verbose || spin) {
                        this.output.done_verbose_log(`Done ${action}`, context);
                    }
                    return (resolve) ? resolve(true) : true;
                }
                default: {
                    if (code !== null) {
                        _print_cached_output(child_outputs[child.pid || 'pid0'], this.output);
                    }
                    this.output.error_log(`Error on: ${command}`, context);
                    this.output.error_log(`Child process exited with code ${code}`, context);
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
function _clean_chunk(chunk) {
    const plain_text = chunk
        .toString()
        .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
        .replace(/\r?\n|\r/g, ' ');
    return plain_text;
}
//# sourceMappingURL=spawn.js.map