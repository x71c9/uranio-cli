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
	fnc: ''
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

export type Defaults = {
	default_repo: Repo,
	folder: string,
	tmp_folder: string,
	book_src_path: string,
	book_dest_path: string,
	log_filepath: string,
	time_format: string,
	dot_repo: string,
	core_repo: string,
	web_repo: string,
	fnc_repo: string,
	core_dep_repo: string,
	core_dep_dev_repo: string,
	web_dep_repo: string,
	web_dep_dev_repo: string,
	fnc_dep_repo: string,
	fnc_dep_dev_repo: string,
	check_char: string,
	wrong_char: string,
	rcfile_path: string
}

export type Conf = {
	verbose: boolean,
	colors: boolean,
	output: boolean
}
