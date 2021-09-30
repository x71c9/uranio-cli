/**
 * Util Spawn
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as cp from 'child_process';
import * as out from '../output/';
declare type Resolve = (v?: unknown) => void;
declare type Reject = (err?: Error) => void;
declare class Spawn {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
    exec_sync(command: string): void;
    spin(command: string, context: string, action: string, resolve: Resolve, reject: Reject): cp.ChildProcessWithoutNullStreams;
    log(command: string, context: string, action: string, resolve: Resolve, reject: Reject): cp.ChildProcessWithoutNullStreams;
    verbose_log(command: string, context: string, action: string, resolve: Resolve, reject: Reject): cp.ChildProcessWithoutNullStreams;
    spin_and_log(command: string, context: string, action: string, resolve: Resolve, reject: Reject): cp.ChildProcessWithoutNullStreams;
    spin_and_verbose_log(command: string, context: string, action: string, resolve: Resolve, reject: Reject): cp.ChildProcessWithoutNullStreams;
    private _spawn;
}
export declare type SpawnInstance = InstanceType<typeof Spawn>;
export declare function create(output: out.OutputInstance): SpawnInstance;
export {};
