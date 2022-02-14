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
	console.log(`  init ............... init uranio repo.`);
	console.log(`  deinit ............. deinit uranio repo.`);
	console.log(`  dev ................ start uranio development mode.`);
	console.log(`  transpose .......... transpose atom books.`);
	console.log(`  info ............... show uranio info for this repo.`);
	console.log(`  version ............ show package version.`);
	console.log(`  help ............... show help menu [this one].`);
	console.log(``);
	console.log(`list of options`);
	console.log(`  -s --root .......... set the project root folder.`);
	console.log(`  -r --repo .......... set uranio repo to use [core, api, trx, adm].`);
	console.log(`  -d --deploy ........ set deploy [netlify, express].`);
	console.log(`  -p --pacman ........ set package manager [npm, yarn].`);
	console.log(`  -f --force ......... run without prompts.`);
	console.log(`  -g --branch ........ set branch to clone.`);
	console.log(`  -k --docker ........ use docker - it needs docker installed.`);
	console.log(`  --docker_db ........ use docker db - it needs docker installed.`);
	console.log(`  --db ............... set db type [mongo] - it needs docker installed.`);
	console.log(``);
	console.log(`list of output options`);
	console.log(`  -v --verbose ....... log in verbose mode.`);
	console.log(`  -u --debug ......... log in debug mode.`);
	console.log(`  -n --hide .......... do not output log.`);
	console.log(`  -b --blank ......... log with no colors.`);
	console.log(`  -w --fullwidth ..... log in full width.`);
	console.log(`  -x --prefix ........ set a log prefix.`);
	console.log(`  -t --time .......... log with timestamp.`);
	console.log(`  -a --context ....... log with context.`);
	console.log(`  -l --filelog ....... save log on file.`);
	console.log(`  -i --spin .......... log with spinner.`);
	console.log(`  -e --native ........ log in native mode.`);
	console.log(`  -c --color_log ..... log color.`);
	console.log(`  -o --color_verbose . verbose log color.`);
	console.log(`  -q --color_debug ... debug log color.`);
	
	console.log(``);
	console.log(``);
	
	process.exit(0);
	
}
