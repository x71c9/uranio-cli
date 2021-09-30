/**
 * CMD types
 *
 * @packageDocumentation
 */
import { Params, Repo, Deploy, PacMan } from '../types';
export declare type InitParams = Partial<Params> & {
    root: string;
    repo?: Repo;
    deploy?: Deploy;
    pacman?: PacMan;
    branch?: string;
};
export declare type Aliases = {
    [key: string]: string[];
};
