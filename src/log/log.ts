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
	if(!text){
		return '';
	}
	return (conf.colors === true) ? chalk.magenta(text) : text;
}

const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

const spinner_texts:string[] = [];

export function start_loading(text:string)
		:void{
	if(conf.colors === false){
		spinner.color = 'white';
	}
	spinner_texts.push(text);
	spinner_text(text);
	if(!spinner.isSpinning){
		spinner.start();
	}
}

export function stop_loading()
		:void{
	spinner.stop();
}

export function spinner_text(text:string)
		:void{
	spinner.text = _spinner_text_color(text);
}

function _go_previous(){
	spinner_texts.pop();
	spinner_text(spinner_texts[spinner_texts.length - 1]);
}

export function done_log(context:string, text:string)
		:void{
	_go_previous();
	log(context, `${defaults.check_char} ${text}`);
}

export function done_verbose_log(context:string, text:string)
		:void{
	_go_previous();
	verbose_log(context, `${defaults.check_char} ${text}`);
}

export function error_log(context:string, text:string)
		:void{
	stop_loading();
	log(context, `[ERROR] ${text}`);
}

export function end_log(text:string)
		:void{
	stop_loading();
	log('end', (conf.colors) ? chalk.yellow(text) : text);
}

export function verbose_log(context:string, text:string)
		:void{
	const color_text = (conf.colors) ? chalk.hex('#668899')(text) : text;
	_log(context, color_text, (conf.verbose === true));
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
	if(conf.colors === true){
		time_text += `${chalk.blue(`[${time}]`)} `;
		time_text += `${chalk.grey(`[${context}]`)} `;
		time_text += `${chalk.green(text)}`;
	}else{
		time_text += `[${time}] `;
		time_text += `[${context}] `;
		time_text += text;
	}
	time_text += `\n`;
	return time_text;
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

