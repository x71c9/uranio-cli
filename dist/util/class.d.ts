/**
 * Util module
 *
 * @packageDocumentation
 */
import { Params } from '../types';
import * as out from '../output/';
import * as fs from './fs';
import * as spawn from './spawn';
import * as cmd from './cmd';
import { OnReadyCallback, OnAllCallback } from './types';
declare class Util {
    params: Params;
    output: out.OutputInstance;
    fs: fs.FSInstance;
    cmd: cmd.CMDInstance;
    spawn: spawn.SpawnInstance;
    constructor(params: Params, output: out.OutputInstance);
    watch(watch_path: string, watch_text: string, on_ready: OnReadyCallback, on_all: OnAllCallback): void;
    is_initialized(): boolean;
    must_be_initialized(): void;
    pretty(filepath: string, parser?: string): void;
}
export declare type UtilInstance = InstanceType<typeof Util>;
export declare function create(params: Params, output: out.OutputInstance): UtilInstance;
export {};
