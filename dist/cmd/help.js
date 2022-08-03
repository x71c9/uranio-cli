"use strict";
/**
 * Help command module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const title_1 = require("./title");
// import * as output from '../output/index';
async function help() {
    (0, title_1.title)();
    console.log(``);
    console.log(`usage: uranio [command] <options>`);
    console.log(``);
    console.log(`commands:`);
    console.log(`  init ............... init uranio repo.`);
    console.log(`  deinit ............. deinit uranio repo.`);
    console.log(`  reinit ............. deinit and init uranio repo.`);
    console.log(`  dev ................ start uranio development mode.`);
    console.log(`  transpose .......... transpose files to uranio repo.`);
    console.log(`  info ............... show uranio info for this repo.`);
    console.log(`  version ............ show package version.`);
    console.log(`  help ............... show help menu [this one].`);
    console.log(``);
    console.log(`list of options`);
    console.log(`  -p --prod .......... set NODE_ENV=production.`);
    console.log(`  -s --root .......... set the project root folder.`);
    console.log(`  -r --repo .......... set uranio repo to use [core, api, trx, adm].`);
    console.log(`  -c --config ........ set config toml file path.`);
    // console.log(`  -d --deploy ........ set deploy [netlify, express].`);
    console.log(`  -m --pacman ........ set package manager [npm, yarn].`);
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
    // console.log(`  -d --color_log ..... log color.`);
    // console.log(`  -o --color_verbose . verbose log color.`);
    // console.log(`  -q --color_debug ... debug log color.`);
    console.log(``);
    console.log(``);
    process.exit(0);
}
exports.help = help;
//# sourceMappingURL=help.js.map