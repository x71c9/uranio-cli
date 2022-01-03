/**
 * Util CMD
 *
 * @packageDocumentation
 */

import {urn_util} from 'urn-lib';

import {Params} from '../types';

// import {merge_params} from '../cmd/common';

import * as out from '../output/';

// import {UtilParams} from './types';

// DO NO CANCEL IT
// import * as common from '../cmd/common';

import * as fs from './fs';

import * as spawn from './spawn';

// import {
//   abstract_repos,
//   valid_repos,
//   Repo,
//   abstract_pacman,
//   valid_pacman,
//   PacMan,
//   abstract_deploy,
//   valid_deploy,
//   Deploy,
// } from '../types';

type DotEnv = {
	[k:string]: string
}

import {jsonfile_path} from '../conf/defaults';

class CMD {
	
	public fs:fs.FSInstance;
	public spawn:spawn.SpawnInstance;
	
	constructor(public params:Params, public output:out.OutputInstance){
		this.fs = fs.create(output);
		this.spawn = spawn.create(output);
	}
	
	// public read_rc_file()
	//     :void{
	//   if(!this.is_initialized()){
	//     let err =  `URANIO was not initialized yet.`;
	//     err += ` Please run "uranio init" in order to initialize the repo.`;
	//     this.output.error_log(err, 'init');
	//     process.exit(1);
	//   }else{
	//     const rcfile_path = `${this.params.root}/${jsonfile_path}`;
	//     try{
	//       const rc_content = this.fs.read_file(rcfile_path, 'utf8');
	//       const rc_obj = urn_util.json.clean_parse(rc_content);
	//       this.set_repo(rc_obj.repo);
	//       this.params.repo = rc_obj.repo;
	//       this.params.pacman = rc_obj.pacman;
	//       this.params.deploy = rc_obj.deploy;
	//     }catch(ex){
	//       this.output.wrong_end_log(`Cannot parse rcfile ${rcfile_path}. ${ex.message}`);
	//       process.exit(1);
	//     }
	//   }
	// }
	
	public is_initialized()
			:boolean{
		return (this.fs.exists(`${this.params.root}/${jsonfile_path}`));
	}
	
	public async yarn_install()
			:Promise<any>{
		const action = `yarn install`;
		this.output.verbose_log(`Started ${action}`, 'pacman');
		return new Promise((resolve, reject) => {
			this.spawn.spin(`yarn install --verbose`, 'pacman', action, undefined, resolve, reject);
		});
	}

	public async install_dep(repo:string, context:string)
			:Promise<any>{
		const action = `installing dependencies [${repo}]`;
		this.output.verbose_log(`Started ${action}`, context);
		return new Promise((resolve, reject) => {
			this.spawn.spin(_pacman_commands.install[this.params.pacman](repo), context, action, undefined, resolve, reject);
		});
	}

	public async install_dep_dev(repo:string, context:string)
			:Promise<any>{
		const action = `installing dev dependencies [${repo}]`;
		this.output.verbose_log(`Started ${action}`, context);
		return new Promise((resolve, reject) => {
			this.spawn.spin(_pacman_commands.install_dev[this.params.pacman](repo), context, action, undefined, resolve, reject);
		});
	}

	public async uninstall_dep(repo:string, context:string)
			:Promise<any>{
		const action = `uninstalling dependencies [${repo}]`;
		this.output.verbose_log(`Started ${action}`, context);
		return new Promise((resolve, reject) => {
			this.spawn.spin(_pacman_commands.uninstall[this.params.pacman](repo), context, action, undefined, resolve, reject);
		});
	}
	
	public async clone_repo(address:string, dest_folder:string, context='clrp', branch='master')
			:Promise<any>{
		return await this._clone_repo(address, dest_folder, context, branch);
	}
	
	public async clone_repo_recursive(address:string, dest_folder:string, context='clrr', branch='master')
			:Promise<any>{
		return await this._clone_repo(address, dest_folder, context, branch, true);
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
	
	public read_dotenv()
			:DotEnv{
		const dotenv_path = `${this.params.root}/.env`;
		const content = this.fs.read_file(dotenv_path);
		const dotenv:DotEnv = {};
		const lines = content.split('\n');
		for(const line of lines){
			const splitted = line.split('=');
			dotenv[splitted[0]] = splitted[1];
		}
		return dotenv;
	}
	
	private async _clone_repo(
		address:string,
		dest_folder:string,
		context='_clr',
		branch='master',
		recursive=false
	){
		const action = `cloning repo [${address}]`;
		this.output.verbose_log(`Started ${action}`, context);
		return new Promise((resolve, reject) => {
			const branch_str = (branch !== 'master' && typeof branch === 'string') ?
				`-b ${branch} ` : '';
			let cmd = `git clone ${branch_str}${address} ${dest_folder} --progress`;
			cmd += (recursive === true) ? ` --recurse-submodules` : '';
			this.spawn.spin(cmd, context, action, undefined, resolve, reject);
		});
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

const _pacman_commands = {
	install: {
		npm(repo:string){
			return `npm i ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add ${repo} --verbose`;
		}
	},
	install_dev: {
		npm(repo:string){
			return `npm i --save-dev ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn add --dev ${repo} --verbose`;
		}
	},
	uninstall: {
		npm(repo:string){
			return `npm uninstall ${repo} --verbose`;
		},
		yarn(repo:string){
			return `yarn remove ${repo} --verbose`;
		}
	}
};


