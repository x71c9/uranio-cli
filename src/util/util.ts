/**
 * Util
 *
 * @packageDocumentation
 */

import * as cp from 'child_process';

import * as output from '../log/';

export function prettier(path:string)
	:void{
	output.start_loading(`Prettier [${path}]...`);
	cp.execSync(`npx prettier --write ${path} --use-tabs --tab-width 2`);
	output.done_verbose_log('prtt', `Prettier [${path}] done.`);
}
