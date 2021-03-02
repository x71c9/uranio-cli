/**
 * Type module
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

export type Arguments = minimist.ParsedArgs;

export type ParseOptions = minimist.Opts;

const repos = {
	core: '',
	web: ''
} as const;

export function valid_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in repos){
		vals.push(k);
	}
	return vals;
}

export type Repo = keyof typeof repos;

export type Defaults = {
	default_repo: Repo,
	folder: string,
	book_src_path: string,
	book_dest_path: string,
	log_filepath: string,
	time_format: string,
	core_repo: string,
	web_repo: string,
	core_dep_repo: string,
	core_dep_dev_repo: string,
	web_dep_repo: string,
	web_dep_dev_repo: string,
	check_char: string
}

export type Conf = {
	verbose: boolean;
}
