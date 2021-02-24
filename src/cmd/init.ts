/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

// import util from 'util';

import * as cp from 'child_process';

// const execute = util.promisify(cp.exec);
// const access = util.promisify(fs.access);

import {Arguments} from '../types';

import {conf} from '../conf/defaults';

import {title} from './title';

export const init = {
	
	run: async (args:Arguments):Promise<void> => {
		
		title();
		
		let repo = conf.default_repo;
		
		const args_repo = args.r || args.repo;
		
		if(args_repo){
			switch(args_repo){
				case 'web':{
					repo = 'web';
					break;
				}
				case 'core':{
					repo = 'core';
					break;
				}
			}
		}
		
		if(fs.existsSync(conf.urn_folder)){
			
			console.log('Folder Exists');
			cp.execSync(`rm -rf ${conf.urn_folder}`);
			
		}
			
		console.log('Not exists');
		console.log('Creating folder ' + conf.urn_folder);
		
		cp.execSync(`mkdir ${conf.urn_folder}`);
		
		const child = cp.spawn(`git`, ['clone', `ssh://git@bitbucket.org/nbl7/urn-${repo}.git`, `.urn/urn-${repo}`, `--progress`]);
		
		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk) => {
			process.stdout.write(chunk);
			// console.log(chunk);
		});
		
		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk) => {
			process.stdout.write(chunk);
			// console.log(chunk);
		});
		
		child.on('close', (code) => {
			console.log(`Child process exited with code ${code}`);
		});
		
		child.on('error', (err) => {
			console.error(err);
		});
		
		// const child = cp.spawnSync(`git clone ssh://git@bitbucket.org/nbl7/urn-${repo}.git .urn/urn-${repo}`);
		// console.log('error', child.error);
		// console.log('stdout ', child.stdout);
		// console.log('stderr ', child.stderr);
		
		// const a = await execute();
		// console.log(a.stdout);
		// console.log(a.stderr);
			
		
		// console.log(repo);
		
		// exec("echo A", (e, o, eo) => {
		//   console.log('e',e);
		//   console.log('o',o);
		//   console.log('eo',eo);
		// });
		
		// await execute('echo "The \\$HOME variable is $HOME"');
		
		// execute(`mkdir .urn`)
		//   .then((d) => {
		//     console.log('THEN');
		//     console.log(d.stdout);
		//   })
		//   .catch((e) => {
		//     console.log('ERROR');
		//     console.log(e);
		//   });
		// .finally(() => {
		//   console.log('FINALLY');
		// });
		
	}
	
};

// function _get_root(){
	
// }

// async function _check_if_folder_exists(){
//   try{
//     await access('.urn', fs.constants.F_OK);
//     return true;
//   }catch(err){
//     return false;
//   }
// }

