/**
 * Init command module
 *
 * @packageDocumentation
 */
import { Repo, PacMan, Deploy } from '../types';
import * as out from '../output/';
declare type InitParams = {
    root: string;
    repo: Repo;
    deploy: Deploy;
    pacman: PacMan;
    branch: string;
};
export declare function init(params: InitParams, output_params: out.OutputParams): Promise<void>;
export {};
