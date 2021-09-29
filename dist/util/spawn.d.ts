/**
 * Util Spawn
 *
 * @packageDocumentation
 */
import * as out from '../output/';
declare class Spawn {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
}
export declare type SpawnInstance = InstanceType<typeof Spawn>;
export declare function create(output: out.OutputInstance): SpawnInstance;
export {};
