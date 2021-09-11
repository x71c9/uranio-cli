/**
 * Default config module
 *
 * @packageDocumentation
 */

import {Options} from '../types';

const cloud_address = 'ssh://git@bitbucket.org/nbl7/';

export const defaults = {
	
	default_repo: 'trx',
	
	folder: '.uranio',
	
	repo_folder: 'uranio',
	
	tmp_folder: '.tmp',
	
	log_filepath: '.urnlog',
	
	json_filename: `uranio.json`,
	
	time_format: "yy-mm-dd'T'HH:MM:ss:l",
	
	dot_repo: `${cloud_address}urn-dot.git`,
	
	trx_repo: `${cloud_address}urn-trx.git`,
	
	api_repo: `${cloud_address}urn-api.git`,
	
	core_repo: `${cloud_address}urn-core.git`,
	
	trx_dep_repo: `${cloud_address}urn-trx-dep`,
	
	trx_dep_dev_repo: `${cloud_address}urn-trx-dep-dev`,
	
	api_dep_repo: `${cloud_address}urn-api-dep`,
	
	api_dep_dev_repo: `${cloud_address}urn-api-dep-dev`,
	
	core_dep_repo: `${cloud_address}urn-core-dep`,
	
	core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
	
	check_char: '✔',
	
	wrong_char: '✗',
	
} as const;

export const jsonfile_path = `${defaults.folder}/${defaults.json_filename}`;

export const conf:Options = {
	
	verbose: false,
	
	blank: false,
	
	hide: false,
	
	spinner: true,
	
	fullwidth: false,
	
	root: '.',
	
	repo: defaults.default_repo,
	
	prefix: '',
	
	pacman: 'yarn',
	
	force: false,
	
	filelog: true,
	
	deploy: 'netlify',
	
};
