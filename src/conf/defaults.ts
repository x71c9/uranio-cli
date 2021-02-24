/**
 * Default config module
 *
 * @packageDocumentation
 */

const cloud_address = 'ssh://git@bitbucket.org/nbl7/';

export const conf = {
	
	default_repo: 'web',
	
	urn_folder: '.urn',
	
	web_repo: `${cloud_address}urn-web.git`,
	
	core_repo: `${cloud_address}urn-core.git`,
	
	web_dep_repo: `${cloud_address}urn-web-dep`,
	
	web_dep_dev_repo: `${cloud_address}urn-web-dep-dev`,
	
	core_dep_repo: `${cloud_address}urn-core-dep`,
	
	core_dep_dev_repo: `${cloud_address}urn-core-dep-dev`,
	
};
