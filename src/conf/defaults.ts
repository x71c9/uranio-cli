/**
 * Default config module
 *
 * @packageDocumentation
 */

import {Params} from '../types';

export const default_params:Params = {
	force: false,
	verbose: false,
	debug: false,
	hide: false,
	blank: false,
	fullwidth: false,
	native: false,
	inside_ntl: false,
	// is_dot: false,
	time: false,
	context: false,
	prefix_color: false,
	docker: false,
	docker_db: false,
	filelog: true,
	spin: true,
	color_uranio:true,
	prefix: '',
	branch: 'master',
	config: 'uranio.toml',
	repo: 'adm',
	pacman: 'yarn',
	// deploy: 'netlify',
	db: 'mongo',
	color_log: '#859900',
	color_verbose: '#668899',
	color_debug: '#557685',
	root: '.',
};

const cloud_address = 'git+ssh://git@github.com/x71c9';

export const defaults = {
	folder: '.uranio',
	docker_folder: '.docker',
	repo_folder: 'uranio',
	tmp_folder: '.tmp',
	log_filepath: '.urnlog',
	init_filepath: `.uranio.json`,
	time_format: "yy-mm-dd'T'HH:MM:ss:l",
	dot_repo: `${cloud_address}/uranio-dot.git`,
	dev_repo: `${cloud_address}/uranio-dev.git`,
	lib_repo: `${cloud_address}/uranio-lib.git`,
	assets_repo: `${cloud_address}/uranio-assets.git`,
	schema_repo: `${cloud_address}/uranio-schema.git`,
	adm_repo: `${cloud_address}/uranio-adm.git`,
	trx_repo: `${cloud_address}/uranio-trx.git`,
	api_repo: `${cloud_address}/uranio-api.git`,
	core_repo: `${cloud_address}/uranio-core.git`,
	adm_dep_repo: `${cloud_address}/uranio-adm-dep`,
	adm_dep_dev_repo: `${cloud_address}/uranio-adm-dep-dev`,
	trx_dep_repo: `${cloud_address}/uranio-trx-dep`,
	trx_dep_dev_repo: `${cloud_address}/uranio-trx-dep-dev`,
	api_dep_repo: `${cloud_address}/uranio-api-dep`,
	api_dep_dev_repo: `${cloud_address}/uranio-api-dep-dev`,
	core_dep_repo: `${cloud_address}/uranio-core-dep`,
	core_dep_dev_repo: `${cloud_address}/uranio-core-dep-dev`,
	check_char: '✔',
	wrong_char: '✗',
} as const;

// export const jsonfile_path = `${defaults.folder}/${defaults.json_filename}`;
// export const jsonfile_path = `${defaults.json_filename}`;


