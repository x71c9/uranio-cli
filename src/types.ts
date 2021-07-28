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
	api: ''
} as const;

export const abstract_pacman = {
	yarn: '',
	npm: '',
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

export type Repo = keyof typeof abstract_repos;
export type PacMan = keyof typeof abstract_pacman;

export type Options = {
	verbose: boolean,
	blank: boolean,
	hide: boolean,
	spinner: boolean,
	fullwidth: boolean,
	prefix: string
	root: string,
	repo: Repo,
	pacman: PacMan,
	force: boolean,
	filelog: boolean
}

// export type Conf = Options & {
// root: string,
// repo: Repo
// }
