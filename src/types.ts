/**
 * Type module
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

export type Arguments = minimist.ParsedArgs;

export type ParseOptions = minimist.Opts;

export const abstract_repos = {
	core: '',
	api: '',
	trx: '',
	adm: ''
} as const;

export const abstract_pacman = {
	yarn: '',
	npm: '',
} as const;

export const abstract_deploy = {
	netlify: '',
	express: '',
} as const;

export function valid_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_pacman()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_pacman){
		vals.push(k);
	}
	return vals;
}

export function valid_deploy()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_deploy){
		vals.push(k);
	}
	return vals;
}
export type Repo = keyof typeof abstract_repos;
export type PacMan = keyof typeof abstract_pacman;
export type Deploy = keyof typeof abstract_deploy;

export type Params = {
	root: string
	repo: Repo
	deploy: Deploy
	pacman: PacMan
	branch: string
	verbose: boolean,
	blank: boolean,
	hide: boolean,
	spin: boolean,
	fullwidth: boolean,
	prefix: string,
	force: boolean,
	filelog: boolean,
	color: string,
	color_verbose: string,
	native: boolean
}
