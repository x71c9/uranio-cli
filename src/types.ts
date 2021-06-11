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
	web: '',
	ntl: ''
} as const;

export function valid_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_repos){
		vals.push(k);
	}
	return vals;
}

export type Repo = keyof typeof abstract_repos;

export type Conf = {
	verbose: boolean,
	colors: boolean,
	output: boolean,
	full_width: boolean
}
