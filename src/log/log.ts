/**
 * Log module
 *
 * @packageDocumentation
 */

import dateFormat from 'dateformat';

import ora from 'ora';

import chalk from 'chalk';

import fs from 'fs';

import * as cp from 'child_process';

import {conf, defaults} from '../conf/defaults';

if(!fs.existsSync('.urnlog')){
	cp.execSync('touch .urnlog');
}

function _spinner_text_color(text?:string):string{
	return (text) ? chalk.magenta(text) : '';
}

const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

export function start_loading(text:string)
		:void{
	spinner_text(text);
	spinner.start();
}

export function stop_loading()
		:void{
	spinner.stop();
}

// export function spinner_text(context?:string, text?:string)
//     :void{
//   let t = '';
//   t += (context) ? `[${context}] ` : '';
//   t += (text) ? text : '';
//   if(t != ''){
//     spinner.text = _spinner_text_color(t);
//   }
//   spinner.text = _spinner_text_color(text);
// }

export function spinner_text(text:string)
		:void{
	if(text){
		spinner.text = _spinner_text_color(text);
	}
}

export function done_log(context:string, text:string)
		:void{
	stop_loading();
	log(context, `${defaults.check_char} ${text}`);
}

export function done_verbose_log(context:string, text:string)
		:void{
	stop_loading();
	verbose_log(context, `${defaults.check_char} ${text}`);
}

export function error_log(context:string, text:string)
		:void{
	log(context, `[ERROR] ${text}`);
}

export function end_log(text:string)
		:void{
	stop_loading();
	log('end', chalk.yellow(text));
}

export function verbose_log(context:string, text:string)
		:void{
	_log(context, chalk.hex('#668899')(text), (conf.verbose === true));
}

export function log(context:string, text:string)
		:void{
	_log(context, text, true);
}

function _log(context:string, text:string, out=false){
	const time_text = _format_text(context, text);
	_log_to_file(time_text);
	if(out){
		let was_spinning = false;
		if(spinner.isSpinning){
			was_spinning = true;
			stop_loading();
		}
		process.stdout.write(time_text);
		if(was_spinning){
			spinner.start();
		}
	}
}

function _format_text(context:string, text:string)
		:string{
	const time = dateFormat(new Date(), defaults.time_format);
	if(context.length < 4){
		context = context.padEnd(4,'_');
	}else if(context.length > 4){
		context = context.substr(0,4);
	}
	let time_text = '';
	time_text += `${chalk.blue(`[${time}]`)} `;
	time_text += `${chalk.grey(`[${context}]`)} `;
	time_text += `${chalk.green(text)}`;
	time_text += `\n`;
	return time_text;
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

