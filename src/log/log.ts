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

if(!fs.existsSync('.urn_log')){
	cp.execSync('touch .urn_log');
}

function _spinner_text_color(text:string):string{
	// return chalk.yellow(text);
	return chalk.magenta(text);
}

// const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});
const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

export function start_loading(context?:string, text?:string)
		:void{
	let t = '';
	t += (context) ? `[${context}] ` : '';
	t += (text) ? text : '';
	if(t != ''){
		spinner.text = _spinner_text_color(t);
	}
	spinner.start();
}

export function stop_loading()
		:void{
	spinner.stop();
}

export function spinner_text(text:string)
		:void{
	spinner.text = _spinner_text_color(text);
}

export function verbose_log(context:string, text:string)
		:void{
	_log(context, text, (conf.verbose === true));
}

export function log(context:string, text:string)
		:void{
	_log(context, text, true);
}

export function error_log(context:string, text:string)
		:void{
	_log(context, `[ERROR] ${text}`);
}

function _log(context:string, text:string, out=false){
	const time_text = _format_text(context, text);
	_log_to_file(time_text);
	if(out){
		process.stdout.write(time_text);
	}
}

function _format_text(context:string, text:string)
		:string{
	const time = dateFormat(new Date(), defaults.time_format);
	let time_text = '';
	time_text += `${chalk.blue(`[${time}]`)} `;
	time_text += `${chalk.grey(`[${context}]`)} `;
	time_text += `${chalk.green(text)}`;
	time_text += `\n`;
	return time_text;
}

function _log_to_file(text:string)
		:void{
	start_loading('file_log', `${text}...`);
	fs.appendFileSync(defaults.log_filepath, text);
	stop_loading();
}

