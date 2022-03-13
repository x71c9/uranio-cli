/**
 * Common procedures among all "run" functions
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {urn_util} from 'urn-lib';

import {Params} from '../types';

import {defaults, default_params} from '../conf/defaults';

import {
	abstract_repos,
	valid_repos,
	abstract_pacman,
	valid_pacman,
	// abstract_deploy,
	// valid_deploy,
	abstract_db,
	valid_db
} from '../types';

export function read_init_file(params:Params):Params;
export function read_init_file(params:Partial<Params>):Partial<Params>;
export function read_init_file(params:Partial<Params>):Partial<Params>{
	const rcfile_path = `${params.root}/${defaults.init_filepath}`;
	if(!fs.existsSync(rcfile_path)){
		return params;
	}
	try{
		const cloned_params = {...params};
		const rc_content = fs.readFileSync(rcfile_path, 'utf8');
		const rc_obj = urn_util.json.clean_parse(rc_content);
		cloned_params.repo = rc_obj.repo;
		cloned_params.pacman = rc_obj.pacman;
		// cloned_params.deploy = rc_obj.deploy;
		cloned_params.docker = Boolean(rc_obj.docker);
		cloned_params.docker_db = Boolean(rc_obj.docker_db);
		cloned_params.db = rc_obj.db;
		return cloned_params;
	}catch(ex){
		const err = ex as Error;
		process.stderr.write(`Cannot parse rcfile ${rcfile_path}. ${err.message}`);
		process.exit(1);
	}
}

export function merge_params(params:Partial<Params>)
		:Params{
	return _merge_params(params, false);
}

export function merge_init_params(params:Partial<Params>)
		:Params{
	return _merge_params(params, true);
}

function _merge_params(params:Partial<Params>, is_init=false)
		:Params{
	let merged_params = {...default_params} as Partial<Params>;
	if(!is_init){
		merged_params = read_init_file(params);
	}
	for(const k in default_params){
		if(urn_util.object.has_key(params, k)){
			(merged_params as any)[k] = params[k];
		}
	}
	for(const l in params){
		if(!urn_util.object.has_key(merge_params, l)){
			(merged_params as any)[l] = (params as any)[l];
		}
	}
	return merged_params as Params;
}

export function check_repo(repo:string)
		:void{
	if(!urn_util.object.has_key(abstract_repos, repo)){
		const valid_repos_str = valid_repos().join(', ');
		let end_log = '';
		end_log += `Wrong repo. `;
		end_log += `Repo must be one of the following [${valid_repos_str}]\n`;
		process.stderr.write(end_log);
		process.exit(1);
	}
}

export function check_pacman(pacman:string)
		:void{
	if(!urn_util.object.has_key(abstract_pacman, pacman)){
		const valid_pacman_str = valid_pacman().join(', ');
		let end_log = '';
		end_log += `Wrong package manager. `;
		end_log += `Package manager must be one of the following [${valid_pacman_str}]\n`;
		process.stderr.write(end_log);
		process.exit(1);
	}
}

export function check_deploy(deploy:string)
		:void{
	console.log(deploy);
	// if(!urn_util.object.has_key(abstract_deploy, deploy)){
	//   const valid_deploy_str = valid_deploy().join(', ');
	//   let end_log = '';
	//   end_log += `Wrong deploy value. `;
	//   end_log += `Deploy value must be one of the following [${valid_deploy_str}]\n`;
	//   process.stderr.write(end_log);
	//   process.exit(1);
	// }
}

export function check_db(db:string)
		:void{
	if(!urn_util.object.has_key(abstract_db, db)){
		const valid_db_str = valid_db().join(', ');
		let end_log = '';
		end_log += `Wrong db value. `;
		end_log += `DB value must be one of the following [${valid_db_str}]\n`;
		process.stderr.write(end_log);
		process.exit(1);
	}
}

export function check_if_is_dot(path:string):boolean{
	const data = fs.readdirSync(path);
	if(!data){
		return false;
	}
	for(const file of data){
		if(file === 'package.json'){
			const package_json_path = `${path}/${file}`;
			try{
				const content = fs.readFileSync(package_json_path,'utf8');
				const pack = urn_util.json.clean_parse(content);
				if(pack.name === 'urn-dot' || pack.name === 'uranio-dot'){
					return true;
				}
				return false;
			}catch(ex){
				const err = ex as Error;
				process.stderr.write(`Invalid ${package_json_path}. ${err.message}`);
				return false;
			}
		}
	}
	return false;
}

export const package_scripts = {
	'build': `uranio build`,
	'build:server': `uranio build:client`,
	'build:client': `uranio build:client`,
	'dev': `uranio dev`,
	'dev:server': `uranio dev:server`,
	'dev:client': `uranio dev:client`
};

