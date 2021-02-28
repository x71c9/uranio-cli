/**
 * Default config module
 *
 * @packageDocumentation
 */

import {Defaults, Conf} from '../types';

const cloud_address = 'ssh://git@bitbucket.org/nbl7/';

export const defaults:Defaults = {
	
	default_repo: 'web',
	
	folder: '.urn',
	
	log_filepath: '.urn_log',
	
	time_format: "yy-mm-dd'T'HH:MM:ss:l",
	
	web_repo: `${cloud_address}urn-web.git`,
	
	core_repo: `${cloud_address}urn-core.git`,
	
	web_dep_repo: `${cloud_address}urn-web-dep`,
	
	web_dep_dev_repo: `${cloud_address}urn-web-dep-dev`,
	
	core_dep_repo: `${cloud_address}urn-core-dep`,
	
	core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
	
	check_char: '✔'
	
};

export const conf:Conf = {
	
	verbose: true
	
};
