/**
 * CMD types
 *
 * @packageDocumentation
 */
import { Repo, Deploy, PacMan } from '../types';
export declare type InitParams = {
    root: string;
    repo?: Repo;
    deploy?: Deploy;
    pacman?: PacMan;
    branch?: string;
};
export declare type Aliases = {
    [key: string]: string[];
};
export declare type AliasParams = {
    root: string;
};
export declare type TransposeParams = {
    root: string;
    file?: string;
};
export declare type BuildParams = {
    root: string;
};
export declare type DevParams = {
    root: string;
};
export declare type HooksParams = {
    root: string;
};
