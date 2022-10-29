/**
 * Util Spawn
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as cp from 'child_process';
import * as out from '../output/index';
declare type Resolve = (v?: unknown) => void;
declare type Reject = (err?: Error) => void;
declare type Over = 'trace' | 'debug' | 'info' | 'warn' | 'error' | '';
declare class Spawn {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
    exec_sync(command: string): void;
    native(command: string, action: string, over?: Over, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean, no_log_on_error?: boolean): cp.ChildProcessWithoutNullStreams;
    spin(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    info_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    debug_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    trace_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    spin_and_native(command: string, action: string, over?: Over, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean, no_log_on_error?: boolean): cp.ChildProcessWithoutNullStreams;
    spin_and_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    spin_and_verbose_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    spint_and_trace_log(command: string, action: string, prefix?: string, resolve?: Resolve, reject?: Reject, detached?: boolean): cp.ChildProcessWithoutNullStreams;
    spin_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    native_promise(command: string, action: string, over?: Over, prefix?: string, detached?: boolean): Promise<unknown>;
    info_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    debug_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    trace_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    spin_and_native_promise(command: string, action: string, over?: Over, prefix?: string, detached?: boolean): Promise<unknown>;
    spin_and_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    spin_and_verbose_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    spin_and_trace_log_promise(command: string, action: string, prefix?: string, detached?: boolean): Promise<unknown>;
    private _native_spawn;
    private _spawn;
}
export declare type SpawnInstance = InstanceType<typeof Spawn>;
export declare function create(output: out.OutputInstance): SpawnInstance;
export {};
