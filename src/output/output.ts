/**
 * Log module
 *
 * @packageDocumentation
 */

import dateFormat from 'dateformat';

import ora from 'ora';

import chalk from 'chalk';

import fs from 'fs';

import {conf, defaults} from '../conf/defaults';

function _spinner_text_color(text?:string):string{
	if(!text){
		return '';
	}
	return (conf.blank === false) ? chalk.magenta(text) : text;
}

const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

const spinner_texts:string[] = [];

export function start_loading(text:string)
		:void{
	if(conf.hide === true){
		return;
	}
	if(conf.blank === true){
		spinner.color = 'white';
	}
	spinner_texts.push(text);
	spinner_text(text);
	if(conf.spinner === true && !spinner.isSpinning){
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
	verbose_log(context, `${text}`);
}

export function error_log(context:string, text:string)
		:void{
	stop_loading();
	const error_text = `${chalk.red(`[ERROR] ${text}`)}`;
	log(context, error_text);
}

export function end_log(text:string)
		:void{
	stop_loading();
	const end_text = `${defaults.check_char} ${text}`;
	log('end', (!conf.blank) ? chalk.yellow(end_text) : end_text);
}

export function wrong_end_log(text:string)
		:void{
	stop_loading();
	const end_text = `${defaults.wrong_char} ${text}`;
	log('end', (!conf.blank) ? chalk.red(end_text) : end_text);
}

export function verbose_log(context:string, text:string)
		:void{
	const color_text = (!conf.blank) ? chalk.hex('#668899')(text) : text;
	_log(context, color_text, (conf.verbose === true));
}

export function log(context:string, text:string)
		:void{
	_log(context, text, true);
}

function _log(context:string, text:string, out=false){
	const output_text = _format_text(context, text);
	_log_to_file(output_text);
	if(out){
		let was_spinning = false;
		if(spinner.isSpinning){
			was_spinning = true;
			stop_loading();
		}
		if(conf.hide === false){
			process.stdout.write(output_text);
		}
		if(conf.spinner === true && was_spinning){
			spinner.start();
		}
	}
}

function _format_text(context:string, text:string)
		:string{
	
	let time = dateFormat(new Date(), defaults.time_format);
	
	if(context.length < 4){
		context = context.padEnd(4,'_');
	}else if(context.length > 4){
		context = context.substr(0,4);
	}
	text = _replace_root_string(text);
	
	const prefix = conf.prefix;
	context = `[${context}]`;
	time = `[${time}]`;
	
	let text_lenght = 0;
	text_lenght += prefix.length;
	text_lenght += context.length;
	text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length; // eslint-disable-line no-control-regex
	text_lenght += time.length;
	text_lenght += 4;
	
	if(conf.fullwidth === true){
		const gap_lenght = process.stdout.columns - text_lenght;
		if(gap_lenght < 0 && gap_lenght > -9){
			time = time.replace(dateFormat(new Date, "yy-mm-dd'T'"), '');
			text_lenght -= 9;
		}else if(gap_lenght <= -9 && gap_lenght > -21){
			time = '';
			text_lenght -= 24;
		}else if(gap_lenght <= -21){
			time = '';
			const remain = process.stdout.columns
				- prefix.length
				- context.length
				- time.length
				- 4;
			text = text.substr(0,remain) + ' ...';
			text_lenght = remain - 6;
		}
	}
	
	let output_text = prefix;
	let dot = '.';
	
	if(conf.blank === false){
		context = chalk.grey(context);
		text = chalk.green(text);
		dot = chalk.gray('.');
		time = chalk.blue(time);
	}
	
	if(conf.fullwidth === true){
		output_text += context + ' ';
		output_text += text + ' ';
		for(let i = 0; i < process.stdout.columns - text_lenght; i++){
			output_text += dot;
		}
		output_text += ' ';
		output_text += time;
	}else{
		output_text += time + ' ';
		output_text += context + ' ';
		output_text += text + ' ';
	}
	
	output_text += `\n`;
	
	return output_text;
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

function _replace_root_string(str:string)
		:string{
	if(str.indexOf('$URNROOT$') !== -1){
		return str.replace('$URNROOT$','');
	}
	if(conf.root == '.'){
		return str;
	}
	const regex = new RegExp(`${conf.root}`, 'g');
	return str.replace(regex, 'ROOT');
}

