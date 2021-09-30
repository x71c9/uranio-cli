/**
 * CMD types
 *
 * @packageDocumentation
 */

import {Repo, Deploy, PacMan} from '../types';

export type InitParams = {
	root: string
	repo?: Repo
	deploy?: Deploy
	pacman?: PacMan
	branch?: string
}

export type Aliases = {
	[key:string]: string[]
}

export type AliasParams = {
	root: string
}

export type TransposeParams = {
	root: string
	file?: string
}

export type BuildParams = {
	root: string
}

export type DevParams = {
	root: string
}
