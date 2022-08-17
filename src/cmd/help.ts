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
	console.log(`  init .................. initialize uranio in the current dir.`);
	console.log(`  build ................. build and generate all files.`);
	console.log(`  start ................. start uranio.`);
	console.log(`  dev ................... start uranio in development mode.`);
	console.log(`  deinit ................ remove uranio from repo.`);
	console.log(`  reinit ................ deinit and init uranio.`);
	console.log(`  info .................. show uranio info for this repo.`);
	console.log(`  version ............... show package version.`);
	console.log(`  help .................. show help menu [this one].`);
	console.log(``);
	console.log(`list of options`);
	console.log(`  -p --prod ............. flag for production.`);
	console.log(`  -s --root ............. set the project root folder.`);
	console.log(`  -b --build ............ build before starting.`);
	console.log(`  -r --repo ............. set uranio repo to use [core, api, trx, adm].`);
	console.log(`  -c --config ........... set config toml file path.`);
	console.log(`  -m --pacman ........... set package manager [npm, yarn, pnpm].`);
	console.log(`  -f --force ............ run without prompts.`);
	console.log(`  -a --branch ........... set branch to clone.`);
	// console.log(`  -k --docker ........... use docker - it needs docker installed.`);
	// console.log(`  --docker_db ........... use docker db - it needs docker installed.`);
	console.log(`  --docker_tag .......... set docker image tag.`);
	console.log(`  --docker_load ......... add flag --load to docker build command.`);
	// console.log(`  --db .................. set db type [mongo] - it needs docker installed.`);
	console.log(``);
	console.log(`list of output options`);
	console.log(`  -v --verbose .......... log in verbose mode [same as --log_level=debug].`);
	console.log(`  -u --trace ............ log in trace mode [same as --log_level=trace].`);
	console.log(`  -n --no_colors ........ log with no colors.`);
	console.log(`  -w --fullwidth ........ log in full width.`);
	console.log(`  -e --prefix ........... set a log prefix.`);
	console.log(`  -t --time ............. log with timestamp.`);
	console.log(`  -g --filelog .......... save log on file.`);
	console.log(`  -i --spin ............. log with spinner.`);
	console.log(`  -l --log_level ........ log level [none, error, warn, log, debug, trace].`);
	console.log(`  -x --prefix_loglevel .. prefix log type.`);
	
	console.log(``);
	console.log(``);
	
	process.exit(0);
	
}
