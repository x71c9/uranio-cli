/**
 * Output class
 *
 * @packageDocumentation
 */

import dateFormat from 'dateformat';

import ora from 'ora';

import chalk from 'chalk';

import fs from 'fs';

import {defaults} from '../conf/defaults';

import {OutputParams} from './types';

class Output {
	
	public spinner:ora.Ora
	
	public spinner_texts:string[]
	
	constructor(
		public root:string,
		public native=false,
		public blank=false,
		public hide=false,
		public spin=false,
		public verbose=false,
		public fullwidth=false,
		public filelog=true,
		public prefix=''
	){
		
		this.spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});
		this.spinner_texts = [];
		
	}
	
	public log(text:string, context='log', color='#859900')
			:void{
		const colored_text = (!this.blank) ? chalk.hex(color)(text) : text;
		this._log(colored_text, context, true);
	}
	
	public verbose_log(text:string, context='vlog', color='#668899')
			:void{
		const colored_text = (!this.blank) ? chalk.hex(color)(text) : text;
		this._log(colored_text, context, (this.verbose === true));
	}
	
	public done_log(text:string, context='done')
			:void{
		this._go_previous();
		this.log(`${defaults.check_char} ${text}`, context);
	}
	
	public done_verbose_log(text:string, context='vdne')
			:void{
		this._go_previous();
		this.verbose_log(`${text}`, context);
	}
	
	public error_log(text:string, context='errr')
			:void{
		this.stop_loading();
		// const error_text = `${chalk.bgHex(`#4a3030`).hex(`#8b6666`)(`[ERROR] ${text}`)}`;
		// const error_text = `${chalk.hex(`#922424`)(`[ERROR] ${text}`)}`;
		const error_text = `${chalk.hex(`#874040`)(`[ERROR] ${text}`)}`;
		this.log(error_text, context);
	}
	
	public end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.check_char} ${text}`;
		this.log('end', (!this.blank) ? chalk.yellow(end_text) : end_text);
	}
	
	public wrong_end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.wrong_char} ${text}`;
		this.log('end', (!this.blank) ? chalk.red(end_text) : end_text);
	}
	
	public start_loading(text:string)
			:void{
		if(this.hide === true){
			return;
		}
		if(this.blank === true){
			this.spinner.color = 'white';
		}
		this.spinner_texts.push(text);
		this.spinner_text(text);
		if(this.spin === true && !this.spinner.isSpinning){
			this.spinner.start();
		}
	}
	
	public stop_loading()
			:void{
		this.spinner.stop();
	}
	
	public spinner_text(text:string)
			:void{
		this.spinner.text = this._spinner_text_color(text);
	}
	
	private _log(text:string, context='log', out=false){
		const output_text = (!this.native) ?
			this._format_text(text, context) : text;
		if(this.filelog){
			_log_to_file(output_text);
		}
		if(out){
			let was_spinning = false;
			if(this.spinner.isSpinning){
				was_spinning = true;
				this.stop_loading();
			}
			if(this.hide === false){
				process.stdout.write(output_text);
			}
			if(this.spin === true && was_spinning){
				this.spinner.start();
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
		const prefix = this.prefix;
		context = `[${context}]`;
		time = `[${time}]`;
		let text_lenght = 0;
		text_lenght += prefix.length;
		text_lenght += context.length;
		// eslint-disable-next-line no-control-regex
		text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length;
		// eslint-disable-next-line no-control-regex
		const count_tabs = (text.match(new RegExp("\t", "g")) || []).length;
		text_lenght += count_tabs * 7;
		text_lenght += time.length;
		text_lenght += 4;
		if(this.fullwidth === true){
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
				if(this.blank === true){
					remain -= 19;
				}
				text = text.substr(0,remain) + '...';
				text_lenght = remain + 4;
				if(this.blank === true){
					text_lenght += 19;
				}
			}
		}
		let output_text = prefix;
		let dot = '.';
		if(this.blank === false){
			context = chalk.grey(context);
			text = chalk.green(text);
			dot = chalk.gray('.');
			time = chalk.blue(time);
		}
		if(this.fullwidth === true){
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
	
	private _replace_root_string(str:string)
			:string{
		if(str.indexOf('$URNROOT$') !== -1){
			return str.replace('$URNROOT$','');
		}
		if(this.root == '.'){
			return str;
		}
		const regex = new RegExp(`${this.root}`, 'g');
		return str.replace(regex, 'ROOT');
	}
	
	private _spinner_text_color(text?:string):string{
		if(!text){
			return '';
		}
		return (this.blank === false) ? chalk.magenta(text) : text;
	}
	
	private _go_previous(){
		this.spinner_texts.pop();
		this.spinner_text(this.spinner_texts[this.spinner_texts.length - 1]);
	}
	
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

export type OutputInstance = InstanceType<typeof Output>;

const default_params:OutputParams = {
	root: '.',
	native: false,
	blank: false,
	hide: false,
	spin: false,
	verbose: false,
	fullwidth: false,
	filelog: true,
	prefix: ''
};

export function create(params: Partial<OutputParams>)
		:OutputInstance{
	const merged_params = {
		...default_params,
		...params
	};
	return new Output(
		merged_params.root,
		merged_params.native,
		merged_params.blank,
		merged_params.hide,
		merged_params.spin,
		merged_params.verbose,
		merged_params.fullwidth,
		merged_params.filelog,
		merged_params.prefix
	);
}

