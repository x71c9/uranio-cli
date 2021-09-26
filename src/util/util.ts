/**
 * Util
 *
 * @packageDocumentation
 */

import fs from 'fs';

import prettier from 'prettier';

import * as output from '../output/';

import {conf} from '../conf/defaults';

export function pretty(filepath:string, parser='typescript')
	:void{
	output.start_loading(`Prettier [${filepath}]...`);
	const content = fs.readFileSync(filepath, 'utf8');
	const pretty_string = prettier.format(
		content,
		{ useTabs: true, tabWidth: 2, parser: parser }
	);
	fs.writeFileSync(filepath, pretty_string);
	// cp.execSync(`npx prettier --write ${filepath} --use-tabs --tab-width 2`);
	output.done_verbose_log(`Prettier [${filepath}] done.`, 'prtt');
}

export function relative_to_absolute_path(path:string)
		:string{
	if(path[path.length-1] === '/'){
		path = path.substr(0,path.length-1);
	}
	if(path[0] !== '/'){
		if(path.substr(0,2) === './'){
			path = path.substr(2);
		}
		path = `${conf.root}/${path}`;
	}
	return path;
}
