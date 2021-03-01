/**
 * Type module
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

export type Arguments = minimist.ParsedArgs;

export type ParseOptions = minimist.Opts;

export type Repo = 'core' | 'web';

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
