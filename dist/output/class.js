"use strict";
/**
 * Output class
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const dateformat_1 = __importDefault(require("dateformat"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const is_docker_1 = __importDefault(require("is-docker"));
const defaults_1 = require("../conf/defaults");
const spinner_1 = require("./spinner");
let spinner_current = '';
const is_docker = (0, is_docker_1.default)();
const prefix_types = [
    '[fn_debug]',
    '[debug___]',
    '[log_____]',
    '[warn____]',
    '[error___]'
];
const colors_16 = [
    'black',
    'white',
    'gray',
    'magenta',
    'blue',
    'red',
    'yellow',
    'green',
    'cyan'
];
class Output {
    constructor(params) {
        this.params = params;
    }
    // public log(text:string, context='log', color?:string)
    // 		:void{
    // 	const colored_text = this._color_text(text, 'log', color);
    // 	const final_color = (typeof color === 'string') ? color : this.params.color_log;
    // 	this._log(this._prefix_color(colored_text, final_color), context, true);
    // }
    // public verbose_log(text:string, context='vlog', color?:string)
    // 		:void{
    // 	const colored_text = this._color_text(text, 'verbose', color);
    // 	const final_color = (typeof color === 'string') ? color : this.params.color_verbose;
    // 	this._log(this._prefix_color(colored_text, final_color), context, (this.params.verbose === true));
    // }
    // public debug_log(text:string, context='dlog', color?:string)
    // 		:void{
    // 	const colored_text = this._color_text(text, 'debug', color);
    // 	const final_color = (typeof color === 'string') ? color : this.params.color_debug;
    // 	this._log(this._prefix_color(colored_text, final_color), context, (this.params.debug === true));
    // }
    log(text) {
        const prefixed = this._prefix_color(text, 'log');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'log');
        this._log(read, true);
    }
    verbose_log(text) {
        if (this.params.verbose === false) {
            return;
        }
        const prefixed = this._prefix_color(text, 'verbose');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'verbose');
        this._log(read, (this.params.verbose === true));
    }
    debug_log(text) {
        if (this.params.debug === false) {
            return;
        }
        const prefixed = this._prefix_color(text, 'debug');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'debug');
        this._log(read, (this.params.debug === true));
    }
    done_log(text) {
        this._go_previous();
        this.log(`${defaults_1.defaults.check_char} ${text}`);
    }
    done_verbose_log(text) {
        if (this.params.verbose) {
            this._go_previous();
            this.verbose_log(`${text}`);
        }
    }
    end_log(text) {
        this.stop_loading();
        const end_text = `${defaults_1.defaults.check_char} ${text}`;
        // this.log((!this.params.blank) ? chalk.yellow(end_text) : end_text, 'end');
        // this.log((!this.params.blank) ? chalk.magenta(end_text) : end_text);
        this.log(end_text);
    }
    error_log(text) {
        this.stop_loading();
        // const error_text = `${chalk.bgHex(`#4a3030`).hex(`#8b6666`)(`[ERROR] ${text}`)}`;
        // const error_text = `${chalk.hex(`#922424`)(`[ERROR] ${text}`)}`;
        // const error_text = `${chalk.hex(`#874040`)(`[ERROR] ${text}`)}`;
        // const error_text = chalk.red(`[ERROR] ${text}`);
        // this.log(error_text);
        const prefixed = this._prefix_color(`[ERROR] ${text}`, 'error');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'error');
        this._log(read, true);
    }
    warn_log(text) {
        this.stop_loading();
        // const warn_text = `${chalk.hex(`#d0a800`)(`[WARN] ${text}`)}`;
        // const warn_text = chalk.yellow(`[WARN] ${text}`);
        // this.log(warn_text);
        const prefixed = this._prefix_color(`[WARN] ${text}`, 'warn');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'warn');
        this._log(read, true);
    }
    wrong_end_log(text) {
        this.stop_loading();
        const end_text = `${defaults_1.defaults.wrong_char} ${text}`;
        // // this.log((!this.params.blank) ? chalk.red(end_text) : end_text);
        // this.log(end_text);
        const prefixed = this._prefix_color(`[FAILED] ${end_text}`, 'error');
        const formatted = this._format_text(prefixed);
        const read = this._read_text(formatted, 'error');
        this._log(read, true);
    }
    start_loading(text) {
        if (this.params.hide === true) {
            return;
        }
        if (this.params.blank === true) {
            spinner_1.spinner.color = 'white';
        }
        let noroot_text = text;
        const regex = new RegExp(`${this.params.root}`, 'g');
        noroot_text = text.replace(regex, '__root');
        spinner_current = noroot_text;
        spinner_1.spinner_texts.push(noroot_text);
        this.spinner_text(noroot_text);
        if (this.params.spin === true && !spinner_1.spinner.isSpinning) {
            spinner_1.spinner.start();
        }
    }
    stop_loading() {
        spinner_1.spinner.stop();
    }
    spinner_text(text) {
        let noroot_text = text;
        const regex = new RegExp(`${this.params.root}`, 'g');
        noroot_text = text.replace(regex, '__root');
        const chopped_current = (spinner_current.length > process.stdout.columns / 2) ?
            spinner_current.substring(0, Math.floor(process.stdout.columns / 2)) + '...' :
            spinner_current;
        const text_with_current = (is_docker) ? noroot_text : `${chopped_current} ${noroot_text}`;
        spinner_1.spinner.text = this._spinner_text_color(text_with_current);
        if (spinner_1.spinner.text.length > process.stdout.columns) {
            // spinner.text = spinner.text.substring(0, process.stdout.columns - 2);
            spinner_1.spinner.text = spinner_1.spinner.text.substring(0, process.stdout.columns);
        }
    }
    _read_text(text, type) {
        // if(this.params.color_uranio === false){
        // 	return text;
        // }
        if (this.params.prefix_color === true) {
            return text;
        }
        if (this._has_prefixed_color(text) === false && this._has_prefixed_type(text) === false) {
            switch (type) {
                case 'log': {
                    // return chalk.magenta(text);
                    return chalk_1.default.green(text);
                }
                case 'verbose': {
                    return chalk_1.default.blue(text);
                }
                case 'debug': {
                    return chalk_1.default.gray(text);
                }
                case 'error': {
                    return chalk_1.default.red(text);
                }
                case 'warn': {
                    return chalk_1.default.yellow(text);
                }
            }
        }
        return this._read_color(text);
    }
    _prefix_color(text, type) {
        if (this.params.prefix_color === false) {
            return text;
        }
        let color = '';
        switch (type) {
            case 'log': {
                // color = '#magenta';
                color = '#green';
                break;
            }
            case 'verbose': {
                color = '#blue';
                break;
            }
            case 'debug': {
                color = '#gray';
                break;
            }
            case 'error': {
                color = '#red';
                break;
            }
            case 'warn': {
                color = '#yellow';
                break;
            }
        }
        return `[c${color}]${text}`;
    }
    _log(text, out = false) {
        if (this.params.filelog) {
            _log_to_file(text);
        }
        if (out) {
            let was_spinning = false;
            if (spinner_1.spinner.isSpinning) {
                was_spinning = true;
                this.stop_loading();
            }
            if (this.params.hide === false) {
                process.stdout.write(text);
            }
            if (this.params.spin === true && was_spinning) {
                spinner_1.spinner.start();
            }
        }
    }
    _format_text(text) {
        let time = (0, dateformat_1.default)(new Date(), defaults_1.defaults.time_format);
        time = (this.params.time === true) ? `[${time}]` : '';
        text = this._replace_root_string(text);
        const prefix = this.params.prefix;
        if (this.params.fullwidth === true) {
            return this._full_width(text, prefix, time);
        }
        let output_text = prefix + ((prefix.length > 0) ? ' ' : '');
        output_text += time;
        if (time.length > 0) {
            output_text += ' ';
        }
        output_text += text;
        output_text += `\n`;
        return output_text;
    }
    _full_width(text, prefix, time) {
        let output_text = prefix + ((prefix.length > 0) ? ' ' : '');
        let text_lenght = 0;
        text_lenght += prefix.length + 1;
        if (text.length > process.stdout.columns - prefix.length - 4) {
            text = text.substring(0, process.stdout.columns - prefix.length - 6);
            text += ' ...';
        }
        // eslint-disable-next-line no-control-regex
        text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length;
        // eslint-disable-next-line no-control-regex
        const count_tabs = (text.match(new RegExp("\t", "g")) || []).length;
        text_lenght += count_tabs * 7;
        text_lenght += time.length;
        text_lenght += 1;
        if (this.params.time) {
            text_lenght += 2;
        }
        if (this._has_prefixed_color(text)) {
            text_lenght -= this._prefixed_color_length(text);
        }
        if (this._has_prefixed_type(text)) {
            text_lenght -= 8;
        }
        let gap_lenght = process.stdout.columns - text_lenght;
        if (gap_lenght < 0 && gap_lenght > -9) {
            time = time.replace((0, dateformat_1.default)(new Date, "yy-mm-dd'T'"), '');
            gap_lenght += 9;
        }
        else if (gap_lenght <= -9) {
            time = '';
            gap_lenght += 24;
        }
        let dot = '.';
        output_text += text + ' ';
        for (let i = 0; i < gap_lenght; i++) {
            output_text += dot;
        }
        if (time.length > 0) {
            output_text += ' ';
        }
        output_text += time;
        output_text += `\n`;
        return output_text;
    }
    // private _format_text(text:string, context='frmt'){
    // 	let time = dateFormat(new Date(), defaults.time_format);
    // 	if(context.length < 4){
    // 		context = context.padEnd(4,'_');
    // 	}else if(context.length > 4){
    // 		context = context.substr(0,4);
    // 	}
    // 	text = this._replace_root_string(text);
    // 	const prefix = this.params.prefix;
    // 	context = (this.params.context === true) ? `[${context}]` : '';
    // 	time = (this.params.time === true) ? `[${time}]` : '';
    // 	let text_lenght = 0;
    // 	text_lenght += prefix.length;
    // 	text_lenght += context.length;
    // 	// eslint-disable-next-line no-control-regex
    // 	text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length;
    // 	// eslint-disable-next-line no-control-regex
    // 	const count_tabs = (text.match(new RegExp("\t", "g")) || []).length;
    // 	text_lenght += count_tabs * 7;
    // 	text_lenght += time.length;
    // 	text_lenght += 1;
    // 	if(this.params.context){
    // 		text_lenght += 1;
    // 	}
    // 	if(this.params.time){
    // 		text_lenght += 2;
    // 	}
    // 	if(this.params.fullwidth === true){
    // 		const gap_lenght = process.stdout.columns - text_lenght;
    // 		if(gap_lenght < 0 && gap_lenght > -9){
    // 			time = time.replace(dateFormat(new Date, "yy-mm-dd'T'"), '');
    // 			text_lenght -= 9;
    // 		}else if(gap_lenght <= -9 && gap_lenght > -21){
    // 			time = '';
    // 			text_lenght -= 24;
    // 		}else if(gap_lenght <= -21){
    // 			time = '';
    // 			let remain = process.stdout.columns + 2;
    // 			if(this.params.blank === true){
    // 				remain -= 19;
    // 			}
    // 			text = text.substr(0,remain) + '...';
    // 			text_lenght = remain + 4;
    // 			if(this.params.blank === true){
    // 				text_lenght += 19;
    // 			}
    // 		}
    // 	}
    // 	let output_text = prefix;
    // 	let dot = '.';
    // 	if(this.params.blank === false){
    // 		context = chalk.grey(context);
    // 		text = chalk.green(text);
    // 		dot = chalk.gray('.');
    // 		time = chalk.blue(time);
    // 	}
    // 	if(this.params.fullwidth === true){
    // 		output_text += context;
    // 		if(context.length > 0){
    // 			output_text += ' ';
    // 		}
    // 		output_text += text + ' ';
    // 		for(let i = 0; i < process.stdout.columns - text_lenght; i++){
    // 			output_text += dot;
    // 		}
    // 		if(time.length > 0){
    // 			output_text += ' ';
    // 		}
    // 		output_text += time;
    // 	}else{
    // 		output_text += time;
    // 		if(time.length > 0){
    // 			output_text += ' ';
    // 		}
    // 		output_text += context;
    // 		if(context.length > 0){
    // 			output_text += ' ';
    // 		}
    // 		output_text += text + ' ';
    // 	}
    // 	output_text += `\n`;
    // 	return output_text;
    // }
    // private _prefix_color(text:string, color:string){
    // 	return (this.params.prefix_color === true) ? `[c${color}]${text}` : text;
    // }
    // private _color_text(text:string, type:string, color?:string){
    // 	let colored_text = text;
    // 	if(_is_uranio_native(text) && this.params.color_uranio === true){
    // 		colored_text = _uranio_color(colored_text);
    // 	}else if(this._has_prefix_color(colored_text)){
    // 		colored_text = this._read_color(colored_text);
    // 	}else{
    // 		let default_color = this.params.color_log;
    // 		switch(type){
    // 			case 'verbose':{
    // 				default_color = this.params.color_verbose;
    // 				break;
    // 			}
    // 			case 'debug':{
    // 				default_color = this.params.color_debug;
    // 				break;
    // 			}
    // 		}
    // 		const final_color = (typeof color === 'string') ? color : default_color;
    // 		colored_text = (!this.params.blank) ? chalk.hex(final_color)(text) : text;
    // 	}
    // 	return colored_text;
    // }
    // private _has_prefix_color(text:string):boolean{
    // 	const regex_hex = new RegExp(/.?\[c#[0-9a-zA-Z]{0,6}\]/);
    // 	const regex_16b = new RegExp(/.?\[c#magenta\]|\[c#blue\]|\[c#gray\]|\[c#red\]|\[c#green\]|\[c#cyan\]|\[c#black\]|\[c#white\]/);
    // 	return (regex_hex.test(text) || regex_16b.test(text));
    // }
    _has_prefixed_type(text) {
        for (const pre of prefix_types) {
            if (text.indexOf(pre) !== -1) {
                return true;
            }
        }
        return false;
    }
    _prefixed_color_length(text) {
        const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
        const match = regex.exec(text);
        if (!match) {
            return 0;
        }
        const color = match[1];
        return color.length + 4;
    }
    _has_prefixed_color(text) {
        const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
        const match = regex.exec(text);
        if (!match) {
            return false;
        }
        return true;
    }
    /**
     * If there in the text there is something in the format [c#----]
     * i.e.: [c#magenta] | [c#FF6655]
     * or
     * uranio type i.e.: [debug___] | [log_____] | ...
     * it will return the text without the [c#----] | [<type>__] and with the
     * corrisponing color.
     */
    _read_color(text) {
        if (this._has_prefixed_type(text)) {
            return this._color_type(text);
        }
        const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
        const match = regex.exec(text);
        if (!match) {
            return text;
        }
        const removed = text.replaceAll(match[0], '');
        const color = match[1];
        if (colors_16.includes(color) && typeof chalk_1.default[color] !== 'undefined') {
            return chalk_1.default[color](removed);
        }
        else {
            return chalk_1.default.hex(`#${color}`)(removed);
        }
    }
    _color_type(text) {
        const regex = new RegExp(/\[(fn_debug|debug___|warn____|error___|ERROR)\]/);
        const match = regex.exec(text);
        if (!match) {
            return text;
        }
        const removed = text.replaceAll(match[0], '');
        const type = match[1];
        switch (type) {
            case 'fn_debug': {
                return chalk_1.default.gray(removed);
            }
            case 'debug___': {
                return chalk_1.default.blue(removed);
            }
            case 'warn____': {
                return chalk_1.default.yellow(removed);
            }
            case 'ERROR':
            case 'error___': {
                return chalk_1.default.red(removed);
            }
        }
        return text;
    }
    _replace_root_string(str) {
        if (str.indexOf('$URNROOT$') !== -1) {
            return str.replace('$URNROOT$', '');
        }
        if (this.params.root == '.') {
            return str;
        }
        const regex = new RegExp(`${this.params.root}`, 'g');
        return str.replace(regex, '__root');
    }
    _spinner_text_color(text) {
        if (!text) {
            return '';
        }
        return (this.params.blank === false) ? chalk_1.default.magenta(text) : text;
        // return (this.params.blank === false) ? chalk.green(text) : text;
        // return (this.params.blank === false) ? chalk.hex('#A633FF')(text) : text;
    }
    _go_previous() {
        spinner_1.spinner_texts.pop();
        if (spinner_1.spinner_texts.length > 0) {
            this.spinner_text(spinner_1.spinner_texts[spinner_1.spinner_texts.length - 1]);
        }
    }
}
// function _is_uranio_native(text:string){
// 	for(const pre of prefix_types){
// 		if(text.indexOf(pre) !== -1){
// 			return true;
// 		}
// 	}
// 	return false;
// }
// function _remove_color_prefix(text:string):string{
// 	const regex = new RegExp(/.?\[c#[0-9a-zA-Z]{0,6}\]/);
// 	const match = regex.exec(text);
// 	if(!match){
// 		return text;
// 	}
// 	let removed_prefix = '';
// 	if(match.index === 0 && text.substring(0,3) === '[c#'){ // Regex match also with another random char in front
// 		removed_prefix = text.substring(0, match.index) + text.substring(match.index + 10, text.length);
// 	}else{ // text might have something else in from "s6728 [c#666666]"
// 		removed_prefix = text.substring(0, match.index + 1) + text.substring(match.index + 11, text.length);
// 	}
// 	return removed_prefix;
// }
// function _uranio_color(text:string){
// 	let processed_text = text;
// 	for(const pre of prefix_types){
// 		const index = text.indexOf(pre);
// 		if(index !== -1){
// 			processed_text = processed_text.substring(0, index) + processed_text.substring(index + pre.length, processed_text.length);
// 			switch(pre){
// 				case '[fn_debug]':{
// 					processed_text = chalk.cyan(processed_text);
// 					break;
// 				}
// 				case '[debug___]':{
// 					processed_text = chalk.blue(processed_text);
// 					break;
// 				}
// 				case '[warn____]':{
// 					processed_text = chalk.yellow(processed_text);
// 					break;
// 				}
// 				case '[ERROR]':
// 				case '[error___]':{
// 					processed_text = chalk.red(processed_text);
// 					break;
// 				}
// 			}
// 		}
// 	}
// 	return _remove_color_prefix(processed_text);
// }
function _log_to_file(text) {
    fs_1.default.appendFileSync(defaults_1.defaults.log_filepath, text);
}
function create(params) {
    // const full_params = merge_params(params);
    return new Output(params);
}
exports.create = create;
//# sourceMappingURL=class.js.map