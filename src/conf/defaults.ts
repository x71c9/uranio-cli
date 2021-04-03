/**
 * Default config module
 *
 * @packageDocumentation
 */

import {Defaults, Conf} from '../types';

const cloud_address = 'ssh://git@bitbucket.org/nbl7/';

export const defaults:Defaults = {
	
	default_repo: 'fnc',
	
	folder: '.urn',
	
	tmp_folder: '.tmp',
	
	book_src_path: 'src/book.ts',
	
	book_dest_path: '.urn/books.ts',
	
	log_filepath: '.urnlog',
	
	rcfile_path: `.urn/.urnrc.json`,
	
	time_format: "yy-mm-dd'T'HH:MM:ss:l",
	
	dot_repo: `${cloud_address}urn-dot.git`,
	
	fnc_repo: `${cloud_address}urn-fnc.git`,
	
	web_repo: `${cloud_address}urn-web.git`,
	
	core_repo: `${cloud_address}urn-core.git`,
	
	fnc_dep_repo: `${cloud_address}urn-fnc-dep`,
	
	fnc_dep_dev_repo: `${cloud_address}urn-fnc-dep-dev`,
	
	web_dep_repo: `${cloud_address}urn-web-dep`,
	
	web_dep_dev_repo: `${cloud_address}urn-web-dep-dev`,
	
	core_dep_repo: `${cloud_address}urn-core-dep`,
	
	core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
	
	check_char: '✔',
	
	wrong_char: '✗',
	
};

export const conf:Conf = {
	
	verbose: false,
	
	colors: true,
	
	output: true
	
};
