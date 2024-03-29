/**
 * Util CMD
 *
 * @packageDocumentation
 */

import toml from 'toml';
import {urn_util} from 'uranio-lib';
import {Params, PacManExec} from '../types';
import {defaults} from '../conf/defaults';
import * as out from '../output/index';
import { promisify } from 'util';
import cp from 'child_process';
const exe = promisify(cp.exec);

// DO NO CANCEL IT
// import * as common from '../cmd/common';

import * as fs from './fs';

import * as spawn from './spawn';

type DotEnv = {
	[k:string]: string
}

type Toml = {
	[k:string]: string
}

export const pacman_exec:PacManExec = {
	npm: 'npx',
	yarn: 'yarn',
	pnpm: 'pnpm exec'
};

class CMD {
	
	public fs:fs.FSInstance;
	public spawn:spawn.SpawnInstance;
	
	constructor(public params:Params, public output:out.OutputInstance){
		this.fs = fs.create(output);
		this.spawn = spawn.create(output);
	}
	
	public async yarn_install()
			:Promise<any>{
		const action = `yarn install`;
		this.output.trace_log(`Started ${action}`);
		return await this.spawn.spin_promise(`yarn install --verbose`, action);
	}
	
	public async install_package(pack:string)
			:Promise<any>{
		const action = `installing package [${pack}]`;
		this.output.trace_log(`Started ${action}`);
		this.output.start_loading(`Installing package [${pack}]...`);
		return await this.spawn.spin_promise(_pacman_commands.install[this.params.pacman](pack), action);
	}
	
	public async install_package_dev(pack:string)
			:Promise<any>{
		const action = `installing dev package [${pack}]`;
		this.output.trace_log(`Started ${action}`);
		this.output.start_loading(`Installing dev package [${pack}]...`);
		return await this.spawn.spin_promise(_pacman_commands.install_dev[this.params.pacman](pack), action);
	}
	
	public async install_dep(repo:string)
			:Promise<any>{
		const action = `installing dependencies [${repo}]`;
		this.output.trace_log(`Started ${action}`);
		this.output.start_loading(`Installing dep [${repo}]...`);
		return await this.spawn.spin_promise(_pacman_commands.install[this.params.pacman](repo), action);
	}
	
	public async install_dep_dev(repo:string)
			:Promise<any>{
		const action = `installing dev dependencies [${repo}]`;
		this.output.trace_log(`Started ${action}`);
		this.output.start_loading(`Installing dep dev [${repo}]...`);
		return await this.spawn.spin_promise(_pacman_commands.install_dev[this.params.pacman](repo), action);
	}

	public async uninstall_dep(repo:string)
			:Promise<any>{
		const action = `uninstalling dependencies [${repo}]`;
		this.output.trace_log(`Started ${action}`);
		return await this.spawn.spin_promise(_pacman_commands.uninstall[this.params.pacman](repo), action);
	}
	
	public async clone_repo(
		address:string,
		dest_folder:string,
		branch='master'
	):Promise<any>{
		return await this._clone_repo(address, dest_folder, branch);
	}
	
	public async clone_repo_recursive(
		address:string,
		dest_folder:string,
		branch='master'
	):Promise<any>{
		return await this._clone_repo(address, dest_folder, branch, true);
	}
	
	public get_package_data(package_json_path:string){
		try{
			const data = this.fs.read_file(package_json_path, 'utf8');
			const pack_data = urn_util.json.clean_parse(data);
			return pack_data;
		}catch(ex){
			const e = ex as Error;
			this.output.wrong_end_log(`Invalid ${package_json_path}. ${e.message}`);
			process.exit(1);
		}
	}
	
	public dependency_exists(repo:string, package_data?:any)
			:boolean{
		let pack_data = package_data;
		if(!package_data){
			const package_json_path = `${this.params.root}/package.json`;
			pack_data = this.get_package_data(package_json_path);
		}
		const packdata_dep = pack_data['dependencies'];
		const packdata_dep_dev = pack_data['devDependencies'];
		return (
			(packdata_dep && typeof packdata_dep[repo] === 'string') ||
			(packdata_dep_dev && typeof packdata_dep_dev[repo] === 'string')
		);
	}
	
	public read_toml()
			:Toml{
		const toml_path = `${this.params.config}`;
		if(!this.fs.exists(toml_path)){
			this.output.warn_log(`Missing .toml file.`);
			// process.exit(1);
		}
		const content = this.fs.read_file(toml_path);
		const parsed_toml = toml.parse(content);
		const converted_toml = _convert_toml(parsed_toml);
		return converted_toml;
	}
	
	public read_dotenv()
			:DotEnv{
		const dotenv_path = `${this.params.root}/.env`;
		if(!this.fs.exists(dotenv_path)){
			this.output.error_log(`Missing .env file.`);
			process.exit(1);
		}
		const content = this.fs.read_file(dotenv_path);
		const dotenv:DotEnv = {};
		const lines = content.split('\n');
		for(const line of lines){
			if(line.trim()[0] === '#'){
				continue;
			}
			const splitted = line.split('=');
			dotenv[splitted[0]] = splitted[1];
		}
		return dotenv;
	}
	
	public client_env_variables_to_command_string():string{
		const dotenv_obj = this.read_dotenv();
		const client_env_var:string[] = [];
		for(const [key, value] of Object.entries(dotenv_obj)){
			if(key.substring(0,11) === 'URN_CLIENT_'){
				client_env_var.push(`${key}=${value}`);
			}
		}
		const env_string = client_env_var.join(' ');
		return env_string;
	}
	
	public write_dotenv(dotenv:DotEnv)
			:void{
		const dotenv_path = `${this.params.root}/.env`;
		let content = ``;
		for(const [key, value] of Object.entries(dotenv)){
			content += `${key}=${value}\n`;
		}
		this.fs.write_file(dotenv_path, content);
	}
	
	public async install_core_dep(){
		this.output.start_loading(`Installing core dep...`);
		await this.install_dep(defaults.core_dep_repo);
		await this.install_dep_dev(defaults.core_dep_dev_repo);
		this.output.done_log(`Installed core dependencies.`);
		return true;
	}
	
	public async install_api_dep(){
		this.output.start_loading(`Installing api dep...`);
		await this.install_dep(defaults.api_dep_repo);
		await this.install_dep_dev(defaults.api_dep_dev_repo);
		this.output.done_log(`Installed api dependencies.`);
		return true;
	}
	
	public async install_trx_dep(){
		this.output.start_loading(`Installing trx dep...`);
		await this.install_dep(defaults.trx_dep_repo);
		await this.install_dep_dev(defaults.trx_dep_dev_repo);
		this.output.done_log(`Installed trx dependencies.`);
		return true;
	}
	
	public async install_adm_dep(){
		this.output.start_loading(`Installing adm dep...`);
		await this.install_dep(defaults.adm_dep_repo);
		await this.install_dep_dev(defaults.adm_dep_dev_repo);
		this.output.done_log(`Installed adm dependencies.`);
		return true;
	}
	
	public async uninstall_uranio(pack_data:any){
		if(this.dependency_exists('uranio', pack_data)){
			await this.uninstall_dep('uranio');
		}
		return true;
	}
	
	public async uninstall_core_dep(pack_data?:any){
		await this._uninstall_uranio_dep(defaults.core_dep_repo, pack_data);
		await this._uninstall_uranio_dep(defaults.core_dep_dev_repo, pack_data);
		return true;
	}
	
	public async uninstall_api_dep(pack_data?:any){
		await this._uninstall_uranio_dep(defaults.api_dep_repo, pack_data);
		await this._uninstall_uranio_dep(defaults.api_dep_dev_repo, pack_data);
		return true;
	}
	
	public async uninstall_trx_dep(pack_data?:any){
		await this._uninstall_uranio_dep(defaults.trx_dep_repo, pack_data);
		await this._uninstall_uranio_dep(defaults.trx_dep_dev_repo, pack_data);
		return true;
	}
	
	public async uninstall_adm_dep(pack_data?:any){
		await this._uninstall_uranio_dep(defaults.adm_dep_repo, pack_data);
		await this._uninstall_uranio_dep(defaults.adm_dep_dev_repo, pack_data);
		return true;
	}
	
	public async uninstall_core(pack_data?:any){
		await this._uninstall_uranio_pack(defaults.core_repo, pack_data);
		return true;
	}
	
	public async uninstall_api(pack_data?:any){
		await this._uninstall_uranio_pack(defaults.api_repo, pack_data);
		return true;
	}
	
	public async uninstall_trx(pack_data?:any){
		await this._uninstall_uranio_pack(defaults.trx_repo, pack_data);
		return true;
	}
	
	public async uninstall_adm(pack_data?:any){
		await this._uninstall_uranio_pack(defaults.adm_repo, pack_data);
		return true;
	}
	
	public async is_docker_running():Promise<boolean>{
		try{
			const response = await exe(`docker ps`);
			const resp_str = response.stdout.trim();
			if(resp_str.indexOf('Cannot connect to the Docker daemon') === -1){
				return true;
			}
			return false;
		}catch(err){
			return false;
		}
	}
	
	private async _uninstall_uranio_dep(repo:string, pack_data?:any){
		let short_repo =
			(repo.substring(0,3) === 'ssh' || repo.substring(0,7) === 'git+ssh') ?
				repo.split('/').slice(-1)[0].replace('uranio', 'urn') : repo;
		if(short_repo.indexOf('.git')){
			const splitted_git = short_repo.split('.git');
			short_repo = splitted_git[0];
		}
		await this._uninstall_package(short_repo, pack_data);
	}
	
	private async _uninstall_uranio_pack(repo:string, pack_data?:any){
		let short_repo =
			(repo.substring(0,3) === 'ssh' || repo.substring(0,7) === 'git+ssh') ?
				repo.split('/').slice(-1)[0] : repo;
		if(short_repo.indexOf('.git')){
			const splitted_git = short_repo.split('.git');
			short_repo = splitted_git[0];
		}
		await this._uninstall_package(short_repo, pack_data);
	}
	
	private async _uninstall_package(short_repo:string, pack_data?:any){
		if(this.dependency_exists(short_repo, pack_data)){
			this.output.start_loading(`Uninstalling ${short_repo} dep...`);
			const dep_folder = `${this.params.root}/node_modules/${short_repo}`;
			try{
				await this.uninstall_dep(`${short_repo}`);
				this.fs.remove_directory(dep_folder);
				this.output.done_log(`Uninstalled ${short_repo} dependencies.`);
				return true;
			}catch(error){
				const err = error as Error;
				this.output.warn_log(`[WARNING] Could not uninstall dependency.`);
				this.output.warn_log(`[WARNING] ${err.message}.`);
				this.output.warn_log(`[WARNING] Please remove ${short_repo} from package.json.`);
			}
		}
	}
	
	private async _clone_repo(
		address:string,
		dest_folder:string,
		branch='master',
		recursive=false
	){
		const action = `cloning repo [${address}]`;
		this.output.trace_log(`Started ${action}`);
		const branch_str = (branch !== 'master' && typeof branch === 'string') ?
			`-b ${branch} ` : '';
		let cmd = `git clone ${branch_str}${address} ${dest_folder} --depth 1 --progress`;
		cmd += (recursive === true) ? ` --recurse-submodules` : '';
		// return await this.spawn.spin_and_trace_log_promise(cmd, action, '');
		return await this.spawn.spin_promise(cmd, action, '');
	}
	
	// private _check_folder(folder_path:string){
	//   const data = this.fs.read_dir_sync(folder_path);
	//   for(const file of data){
	//     if(file === 'package.json'){
	//       const package_json_path = `${folder_path}/${file}`;
	//       try{
	//         const content = this.fs.read_file(package_json_path,'utf8');
	//         const pack = urn_util.json.clean_parse(content);
	//         if(pack.name === 'urn-cli'){
	//           return false;
	//         }else if(pack.name === 'uranio'){
	//           const bld_path = `${folder_path}/urn-bld`;
	//           if(!this.fs.exists(bld_path)){
	//             return false;
	//           }
	//           this.params.root = bld_path;
	//           return true;
	//         }
	//         this.params.root = folder_path;
	//         return true;
	//       }catch(ex){
	//         this.output.error_log(`Invalid ${package_json_path}. ${ex.message}`, 'root');
	//         return false;
	//       }
	//     }
	//   }
	//   return false;
	// }
}

export type CMDInstance = InstanceType<typeof CMD>;

export function create(params:Params, output:out.OutputInstance)
		:CMDInstance{
	// const full_params = merge_params(params);
	return new CMD(params, output);
}

function _convert_toml(parsed_toml:any):Toml{
	const converted_config:Toml = {};
	for(const [key, value] of Object.entries(parsed_toml)){
		if(value === null || value === undefined){
			continue;
		}
		if(typeof value === 'object'){
			_convert_subobject(converted_config, key, value);
		}else{
			(converted_config as any)[key] = value;
		}
	}
	return converted_config;
}

function _convert_subobject(config:Toml, key:string, obj:any){
	for(const [subkey, subvalue] of Object.entries(obj)){
		if(subvalue === null || subvalue === undefined){
			continue;
		}
		const full_key = `${key}_${subkey}`;
		if(typeof subvalue === 'object'){
			_convert_subobject(config, full_key, subvalue);
		}else{
			(config as any)[full_key] = subvalue;
		}
	}
	return config;
}

const _pacman_commands = {
	install: {
		npm(repo:string){
			return `npm i ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add ${repo} --verbose`;
		},
		pnpm(repo:string){
			return `pnpm add ${repo}`;
		}
	},
	install_dev: {
		npm(repo:string){
			return `npm i --save-dev ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add --dev ${repo} --verbose`;
		},
		pnpm(repo:string){
			return `pnpm add --D ${repo}`;
		}
	},
	uninstall: {
		npm(repo:string){
			return `npm uninstall ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn remove ${repo} --verbose`;
		},
		pnpm(repo:string){
			return `pnpm remove ${repo}`;
		}
	},
};



