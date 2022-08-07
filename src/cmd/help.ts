/**
 * Help command module
 *
 * @packageDocumentation
 */

import {title} from './title';

// import * as output from '../output/index';

export async function help():Promise<void> {
	
	title();
	
	console.log(``);
	console.log(`usage: uranio [command] <options>`);
	console.log(``);
	console.log(`commands:`);
	console.log(`  init .................. init uranio repo.`);
	console.log(`  deinit ................ deinit uranio repo.`);
	console.log(`  reinit ................ deinit and init uranio repo.`);
	console.log(`  dev ................... start uranio development mode.`);
	console.log(`  transpose ............. transpose files to uranio repo.`);
	console.log(`  info .................. show uranio info for this repo.`);
	console.log(`  version ............... show package version.`);
	console.log(`  help .................. show help menu [this one].`);
	console.log(``);
	console.log(`list of options`);
	console.log(`  -p --prod ............. set NODE_ENV=production.`);
	console.log(`  -s --root ............. set the project root folder.`);
	console.log(`  -r --repo ............. set uranio repo to use [core, api, trx, adm].`);
	console.log(`  -c --config ........... set config toml file path.`);
	// console.log(`  -d --deploy .......... set deploy [netlify, express].`);
	console.log(`  -m --pacman ........... set package manager [npm, yarn].`);
	console.log(`  -f --force ............ run without prompts.`);
	console.log(`  -b --branch ........... set branch to clone.`);
	console.log(`  -k --docker ........... use docker - it needs docker installed.`);
	console.log(`  --docker_db ........... use docker db - it needs docker installed.`);
	console.log(`  --db .................. set db type [mongo] - it needs docker installed.`);
	console.log(``);
	console.log(`list of output options`);
	console.log(`  -v --verbose .......... log in verbose mode [same as --log_level=debug].`);
	console.log(`  -u --trace ............ log in trace mode [same as --log_level=trace].`);
	// console.log(`  -h --hide ............. do not output log.`);
	console.log(`  -n --no_colors ........ log with no colors.`);
	console.log(`  -w --fullwidth ........ log in full width.`);
	console.log(`  -e --prefix ........... set a log prefix.`);
	console.log(`  -t --time ............. log with timestamp.`);
	// console.log(`  -a --context .......... log with context.`);
	console.log(`  -g --filelog .......... save log on file.`);
	console.log(`  -i --spin ............. log with spinner.`);
	// console.log(`  -e --native ........... log in native mode.`);
	console.log(`  -l --log_level ........ log level [none, error, warn, log, debug, trace].`);
	console.log(`  -x --prefix_loglevel .. prefix log type.`);
	
	console.log(``);
	console.log(``);
	
	process.exit(0);
	
}
