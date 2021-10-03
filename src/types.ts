/**
 * Type module
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

export type Repo = keyof typeof abstract_repos;
export type PacMan = keyof typeof abstract_pacman;
export type Deploy = keyof typeof abstract_deploy;

export type Params = {
	force: boolean
	verbose: boolean
	debug: boolean
	hide: boolean
	blank: boolean
	fullwidth: boolean
	native: boolean
	filelog: boolean
	spin: boolean
	prefix: string
	branch: string
	repo: Repo
	pacman: PacMan
	deploy: Deploy
	color: string
	color_verbose: string
	color_debug: string
	root: string
}

export type Arguments = minimist.ParsedArgs;

export type ParseOptions = minimist.Opts;

export const abstract_repos = {
	core: '',
	api: '',
	trx: '',
	adm: ''
} as const;

export const abstract_deploy_repos = {
	api: '',
	trx: '',
	adm: ''
} as const;

export const abstract_hooks_repos = {
	trx: '',
	adm: ''
} as const;

export const abstract_admin_repos = {
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

export function valid_deploy_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_deploy_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_hooks_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_hooks_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_admin_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_admin_repos){
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
