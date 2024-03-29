/**
 * Default config module
 *
 * @packageDocumentation
 */

import chalk from 'chalk';

import {Params} from '../types';

export const default_params:Params = {
	prod: false,
	force: false,
	verbose: false,
	trace: false,
	// hide: false,
	no_colors: false,
	prefix_logtype: false,
	fullwidth: false,
	// native: false,
	inside_ntl: false,
	time: false,
	// context: false,
	// prefix_color: false,
	// docker: false,
	// docker_db: false,
	// build: false,
	docker_load: false,
	filelog: false,
	spin: true,
	prefix: '',
	branch: 'master',
	config: 'uranio.toml',
	repo: 'adm',
	pacman: 'yarn',
	db: 'mongo',
	root: '.',
	docker_tag: 'latest',
	log_level: 3
};

const cloud_address = 'https://github.com/x71c9';

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
	prefix_tsc: chalk.magenta('[~]'),
	prefix_srv: chalk.gray('[~]'),
	prefix_pnl: chalk.green('[~]'),
	prefix_wtc: chalk.cyan('[~]'),
	prefix_tsc_blank: '[tsc]',
	prefix_srv_blank: '[srv]',
	prefix_pnl_blank: '[pnl]',
	prefix_wtc_blank: '[wtc]',
	prefix_docker: '[DOCKER]'
} as const;
