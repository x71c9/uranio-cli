/**
 * Util module
 *
 * @packageDocumentation
 */
import * as out from '../output/';
import * as fs from './fs';
import * as spawn from './spawn';
import * as cmd from './cmd';
import { WatchProcessObject, OnReadyCallback, OnAllCallback } from './types';
declare class Util {
    output: out.OutputInstance;
    fs: fs.FSInstance;
    cmd: cmd.CMDInstance;
    spawn: spawn.SpawnInstance;
    watch_child_list: WatchProcessObject[];
    constructor(output: out.OutputInstance);
    watch(watch_path: string, watch_text: string, on_ready: OnReadyCallback, on_all: OnAllCallback): void;
    pretty(filepath: string, parser?: string): void;
}
export declare type UtilInstance = InstanceType<typeof Util>;
export declare function create(output: out.OutputInstance): UtilInstance;
export {};
