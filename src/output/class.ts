/**
 * Output class
 *
 * @packageDocumentation
 */

import dateFormat from 'dateformat';

import chalk from 'chalk';

import fs from 'fs';

import isDocker from 'is-docker';

import {defaults} from '../conf/defaults';

import {Params} from '../types';

import {spinner, spinner_texts} from './spinner';

let spinner_current = '';

const is_docker = isDocker();

const prefix_types = [
	'[fn_debug]',
	'[debug___]',
	'[warn____]',
	'[error___]'
];

class Output {
	
	constructor(public params:Params){
		
	}
	
	public log(text:string, context='log', color?:string)
			:void{
		const colored_text = this._color_text(text, 'log', color);
		const final_color = (typeof color === 'string') ? color : this.params.color_log;
		this._log(this._prefix_color(colored_text, final_color), context, true);
	}
	
	public verbose_log(text:string, context='vlog', color?:string)
			:void{
		const colored_text = this._color_text(text, 'verbose', color);
		const final_color = (typeof color === 'string') ? color : this.params.color_verbose;
		this._log(this._prefix_color(colored_text, final_color), context, (this.params.verbose === true));
	}
	
	public debug_log(text:string, context='dlog', color?:string)
			:void{
		const colored_text = this._color_text(text, 'debug', color);
		const final_color = (typeof color === 'string') ? color : this.params.color_debug;
		this._log(this._prefix_color(colored_text, final_color), context, (this.params.debug === true));
	}
	
	public done_log(text:string, context='done')
			:void{
		this._go_previous();
		this.log(`${defaults.check_char} ${text}`, context);
	}
	
	public done_verbose_log(text:string, context='vdne')
			:void{
		if(this.params.verbose){
			this._go_previous();
			this.verbose_log(`${text}`, context);
		}
	}
	
	public error_log(text:string, context='errr')
			:void{
		this.stop_loading();
		// const error_text = `${chalk.bgHex(`#4a3030`).hex(`#8b6666`)(`[ERROR] ${text}`)}`;
		// const error_text = `${chalk.hex(`#922424`)(`[ERROR] ${text}`)}`;
		const error_text = `${chalk.hex(`#874040`)(`[ERROR] ${text}`)}`;
		this.log(error_text, context);
	}
	
	public warn_log(text:string, context='errr')
			:void{
		this.stop_loading();
		const warn_text = `${chalk.hex(`#d0a800`)(`[WARN] ${text}`)}`;
		this.log(warn_text, context);
	}
	
	public end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.check_char} ${text}`;
		this.log((!this.params.blank) ? chalk.yellow(end_text) : end_text, 'end');
	}
	
	public wrong_end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.wrong_char} ${text}`;
		this.log((!this.params.blank) ? chalk.red(end_text) : end_text, 'end');
	}
	
	public start_loading(text:string)
			:void{
		if(this.params.hide === true){
			return;
		}
		if(this.params.blank === true){
			spinner.color = 'white';
		}
		
		let noroot_text = text;
		const regex = new RegExp(`${this.params.root}`, 'g');
		noroot_text = text.replace(regex, '__root');
		
		spinner_current = noroot_text;
		spinner_texts.push(noroot_text);
		this.spinner_text(noroot_text);
		if(this.params.spin === true && !spinner.isSpinning){
			spinner.start();
		}
	}
	
	public stop_loading()
			:void{
		spinner.stop();
	}
	
	public spinner_text(text:string)
			:void{
		
		let noroot_text = text;
		
		const regex = new RegExp(`${this.params.root}`, 'g');
		noroot_text = text.replace(regex, '__root');
		
		const chopped_current = (spinner_current.length > process.stdout.columns / 2) ?
			spinner_current.substring(0, Math.floor(process.stdout.columns / 2)) + '...' :
			spinner_current;
		const text_with_current = (is_docker) ? noroot_text : `${chopped_current} ${noroot_text}`;
		spinner.text = this._spinner_text_color(text_with_current);
		if(spinner.text.length > process.stdout.columns){
			spinner.text = spinner.text.substr(0, process.stdout.columns - 2);
		}
	}
	
	private _log(text:string, context='log', out=false){
		const output_text = (!this.params.native) ?
			this._format_text(text, context) : text + '\n';
		if(this.params.filelog){
			_log_to_file(output_text);
		}
		if(out){
			let was_spinning = false;
			if(spinner.isSpinning){
				was_spinning = true;
				this.stop_loading();
			}
			if(this.params.hide === false){
				process.stdout.write(output_text);
			}
			if(this.params.spin === true && was_spinning){
				spinner.start();
			}
		}
	}
	
	private _format_text(text:string, context='frmt'){
		let time = dateFormat(new Date(), defaults.time_format);
		if(context.length < 4){
			context = context.padEnd(4,'_');
		}else if(context.length > 4){
			context = context.substr(0,4);
		}
		text = this._replace_root_string(text);
		const prefix = this.params.prefix;
		context = (this.params.context === true) ? `[${context}]` : '';
		time = (this.params.time === true) ? `[${time}]` : '';
		let text_lenght = 0;
		text_lenght += prefix.length;
		text_lenght += context.length;
		// eslint-disable-next-line no-control-regex
		text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length;
		// eslint-disable-next-line no-control-regex
		const count_tabs = (text.match(new RegExp("\t", "g")) || []).length;
		text_lenght += count_tabs * 7;
		text_lenght += time.length;
		text_lenght += 1;
		if(this.params.context){
			text_lenght += 1;
		}
		if(this.params.time){
			text_lenght += 2;
		}
		if(this.params.fullwidth === true){
			const gap_lenght = process.stdout.columns - text_lenght;
			if(gap_lenght < 0 && gap_lenght > -9){
				time = time.replace(dateFormat(new Date, "yy-mm-dd'T'"), '');
				text_lenght -= 9;
			}else if(gap_lenght <= -9 && gap_lenght > -21){
				time = '';
				text_lenght -= 24;
			}else if(gap_lenght <= -21){
				time = '';
				let remain = process.stdout.columns + 2;
				if(this.params.blank === true){
					remain -= 19;
				}
				text = text.substr(0,remain) + '...';
				text_lenght = remain + 4;
				if(this.params.blank === true){
					text_lenght += 19;
				}
			}
		}
		let output_text = prefix;
		let dot = '.';
		if(this.params.blank === false){
			context = chalk.grey(context);
			text = chalk.green(text);
			dot = chalk.gray('.');
			time = chalk.blue(time);
		}
		if(this.params.fullwidth === true){
			output_text += context;
			if(context.length > 0){
				output_text += ' ';
			}
			output_text += text + ' ';
			for(let i = 0; i < process.stdout.columns - text_lenght; i++){
				output_text += dot;
			}
			if(time.length > 0){
				output_text += ' ';
			}
			output_text += time;
		}else{
			output_text += time;
			if(time.length > 0){
				output_text += ' ';
			}
			output_text += context;
			if(context.length > 0){
				output_text += ' ';
			}
			output_text += text + ' ';
		}
		output_text += `\n`;
		return output_text;
	}
	
	private _prefix_color(text:string, color:string){
		return (this.params.prefix_color === true) ? `[c${color}]${text}` : text;
	}

	private _color_text(text:string, type:string, color?:string){
		let colored_text = text;
		
		if(_is_uranio_native(text) && this.params.color_uranio === true){
			
			colored_text = _uranio_color(colored_text);
			
		}else if(this._has_prefix_color(colored_text)){
			
			colored_text = this._read_color(colored_text);
			
		}else{
			
			let default_color = this.params.color_log;
			switch(type){
				case 'verbose':{
					default_color = this.params.color_verbose;
					break;
				}
				case 'debug':{
					default_color = this.params.color_debug;
					break;
				}
			}
			const final_color = (typeof color === 'string') ? color : default_color;
			colored_text = (!this.params.blank) ? chalk.hex(final_color)(text) : text;
		}
		return colored_text;
	}
	
	private _has_prefix_color(text:string):boolean{
		const regex = new RegExp(/.?\[c#[0-9a-zA-Z]{0,6}\]/);
		return (regex.test(text));
	}
	
	private _read_color(text:string):string{
		const regex = new RegExp(/.?\[c#[0-9a-zA-Z]{0,6}\]/);
		const match = regex.exec(text);
		if(!match){
			return text;
		}
		let processed_text = text;
		let color_prefix = '';
		let removed_prefix = '';
		if(match.index === 0 && text.substring(0,3) === '[c#'){ // Regex match also with another random char in front
			
			color_prefix = text.substring(0, match.index + 10);
			removed_prefix =
				text.substring(0, match.index) + text.substring(match.index + 10, text.length);
			
		}else{ // text might have something else in from "s6728 [c#666666]"
			
			color_prefix = text.substring(match.index + 1, match.index + 11);
			removed_prefix =
				text.substring(0, match.index + 1) + text.substring(match.index + 11, text.length);
			
		}
		const hexa_color = color_prefix.substring(2,9);
		processed_text = chalk.hex(hexa_color)(removed_prefix);
		return processed_text;
	}
	
	private _replace_root_string(str:string)
			:string{
		if(str.indexOf('$URNROOT$') !== -1){
			return str.replace('$URNROOT$','');
		}
		if(this.params.root == '.'){
			return str;
		}
		const regex = new RegExp(`${this.params.root}`, 'g');
		return str.replace(regex, '__root');
	}
	
	private _spinner_text_color(text?:string):string{
		if(!text){
			return '';
		}
		// return (this.params.blank === false) ? chalk.magenta(text) : text;
		return (this.params.blank === false) ? chalk.hex('#A633FF')(text) : text;
	}
	
	private _go_previous(){
		spinner_texts.pop();
		if(spinner_texts.length > 0){
			this.spinner_text(spinner_texts[spinner_texts.length - 1]);
		}
	}
	
}

function _is_uranio_native(text:string){
	for(const pre of prefix_types){
		if(text.indexOf(pre) !== -1){
			return true;
		}
	}
	return false;
}

function _remove_color_prefix(text:string):string{
	const regex = new RegExp(/.?\[c#[0-9a-zA-Z]{0,6}\]/);
	const match = regex.exec(text);
	if(!match){
		return text;
	}
	let removed_prefix = '';
	if(match.index === 0 && text.substring(0,3) === '[c#'){ // Regex match also with another random char in front
		removed_prefix = text.substring(0, match.index) + text.substring(match.index + 10, text.length);
	}else{ // text might have something else in from "s6728 [c#666666]"
		removed_prefix = text.substring(0, match.index + 1) + text.substring(match.index + 11, text.length);
	}
	return removed_prefix;
}

function _uranio_color(text:string){
	let processed_text = text;
	for(const pre of prefix_types){
		const index = text.indexOf(pre);
		if(index !== -1){
			processed_text = processed_text.substring(0, index) + processed_text.substring(index + pre.length, processed_text.length);
			switch(pre){
				case '[fn_debug]':{
					processed_text = chalk.cyan(processed_text);
					break;
				}
				case '[debug___]':{
					processed_text = chalk.blue(processed_text);
					break;
				}
				case '[warn____]':{
					processed_text = chalk.yellow(processed_text);
					break;
				}
				case '[ERROR]':
				case '[error___]':{
					processed_text = chalk.red(processed_text);
					break;
				}
			}
		}
	}
	return _remove_color_prefix(processed_text);
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

export type OutputInstance = InstanceType<typeof Output>;

export function create(params: Params)
		:OutputInstance{
	// const full_params = merge_params(params);
	return new Output(params);
}

