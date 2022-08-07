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
const types_1 = require("../types");
const spinner_1 = require("./spinner");
let spinner_current = '';
const is_docker = (0, is_docker_1.default)();
// const prefix_types = [
// 	'[trace]',
// 	'[debug]',
// 	'[log__]',
// 	'[warn_]',
// 	'[error]',
// 	'[none_]'
// ];
const prefix_type_by_type = {
    0: '[none_]',
    1: '[error]',
    2: '[warn_]',
    3: '[log__]',
    4: '[debug]',
    5: '[trace]',
};
// const colors_16 = [
// 	'black',
// 	'white',
// 	'gray',
// 	'magenta',
// 	'blue',
// 	'red',
// 	'yellow',
// 	'green',
// 	'cyan'
// ];
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
    error_log(text, prefix) {
        if (this.params.log_level < types_1.LogLevel.ERROR) {
            return;
        }
        this.stop_loading();
        const prefixed = this._prefixes(text, types_1.LogLevel.ERROR, prefix);
        const formatted = this._format_text(prefixed);
        const read = this._color_type(formatted, types_1.LogLevel.ERROR);
        this._log(read, true);
    }
    warn_log(text, prefix) {
        if (this.params.log_level < types_1.LogLevel.WARN) {
            return;
        }
        const prefixed = this._prefixes(text, types_1.LogLevel.WARN, prefix);
        const formatted = this._format_text(prefixed);
        const read = this._color_type(formatted, types_1.LogLevel.WARN);
        this._log(read, true);
    }
    log(text, prefix) {
        if (this.params.log_level < types_1.LogLevel.LOG) {
            return;
        }
        const prefixed = this._prefixes(text, types_1.LogLevel.LOG, prefix);
        const formatted = this._format_text(prefixed);
        const read = this._color_type(formatted, types_1.LogLevel.LOG);
        this._log(read, true);
    }
    debug_log(text, prefix) {
        if (this.params.log_level < types_1.LogLevel.DEBUG) {
            return;
        }
        const prefixed = this._prefixes(text, types_1.LogLevel.DEBUG, prefix);
        const formatted = this._format_text(prefixed);
        const read = this._color_type(formatted, types_1.LogLevel.DEBUG);
        this._log(read, true);
    }
    trace_log(text, prefix) {
        if (this.params.log_level < types_1.LogLevel.TRACE) {
            return;
        }
        const prefixed = this._prefixes(text, types_1.LogLevel.TRACE, prefix);
        const formatted = this._format_text(prefixed);
        const read = this._color_type(formatted, types_1.LogLevel.TRACE);
        this._log(read, true);
    }
    done_log(text, prefix) {
        this._go_previous();
        text = `${defaults_1.defaults.check_char} ${text}`;
        this.log(text, prefix);
    }
    done_debug_log(text, prefix) {
        if (this.params.log_level >= types_1.LogLevel.DEBUG) {
            this._go_previous();
        }
        // text = `${defaults.check_char} ${text}`;
        this.debug_log(text, prefix);
    }
    end_log(text, prefix) {
        this.stop_loading();
        let end_text = `${defaults_1.defaults.check_char}${defaults_1.defaults.check_char} ${text}`;
        this.log(end_text, prefix);
    }
    wrong_end_log(text, prefix) {
        text = `[FAILED] ${text}`;
        this.error_log(text, prefix);
    }
    start_loading(text) {
        if (this.params.log_level === types_1.LogLevel.NONE) {
            return;
        }
        if (this.params.no_colors === true) {
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
    translate_loglevel(text, over) {
        const regex = new RegExp(/\[(trace|debug|log__|warn_|error)\]/);
        const match = regex.exec(text);
        if (!match) {
            if (!over) {
                this._log(text + `\n`, true);
            }
            else {
                switch (over) {
                    case 'trace': {
                        this.trace_log(text);
                        break;
                    }
                    case 'debug': {
                        this.debug_log(text);
                        break;
                    }
                    case 'log': {
                        this.log(text);
                        break;
                    }
                    case 'warn': {
                        this.warn_log(text);
                        break;
                    }
                    case 'error': {
                        this.error_log(text);
                        break;
                    }
                }
            }
            // process.stdout.write(text);
            // process.stdout.write(`\n`);
            return;
        }
        text = text.replaceAll(match[0], ''); // [trace] | [debug] | ...
        switch (match[1]) { // trace | debug | log__ | warn_ | error
            case 'trace': {
                this.trace_log(text);
                break;
            }
            case 'debug': {
                this.debug_log(text);
                break;
            }
            case 'log__': {
                this.log(text);
                break;
            }
            case 'warn_': {
                this.warn_log(text);
                break;
            }
            case 'error': {
                this.error_log(text);
                break;
            }
        }
    }
    clean_chunk(chunk) {
        const plain_text = chunk
            .toString()
            .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
            .replace(/\r?\n|\r/g, ' ');
        return plain_text;
    }
    // private _match_loglevel(text:string):RegExpExecArray|undefined{
    // 	const regex = new RegExp(/\[(trace|debug|log__|warn_|error)\]/);
    // 	const match = regex.exec(text);
    // 	if(!match){
    // 		return undefined;
    // 	}
    // 	return match;
    // }
    _prefixes(text, type, prefix) {
        let final_text = text;
        if (prefix) {
            final_text = `${prefix} ${final_text}`;
        }
        if (this.params.prefix) {
            final_text = `${this.params.prefix.toString()} ${final_text}`;
        }
        if (this.params.prefix_loglevel === true) {
            final_text = `${prefix_type_by_type[type]} ${final_text}`;
        }
        return final_text;
    }
    // private _prefix_color(text:string, type:LogLevel){
    // 	if(this.params.prefix_color === false){
    // 		return text;
    // 	}
    // 	let color = '';
    // 	switch(type){
    // 		case 'log':{
    // 			// color = '#magenta';
    // 			// color = '#green';
    // 			color = '#cyan';
    // 			break;
    // 		}
    // 		case 'verbose':{
    // 			color = '#blue';
    // 			break;
    // 		}
    // 		case 'debug':{
    // 			color = '#gray';
    // 			break;
    // 		}
    // 		case 'error':{
    // 			color = '#red';
    // 			break;
    // 		}
    // 		case 'warn':{
    // 			color = '#yellow';
    // 			break;
    // 		}
    // 	}
    // 	return `[c${color}]${text}`;
    // }
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
            process.stdout.write(text);
            if (this.params.spin === true && was_spinning) {
                spinner_1.spinner.start();
            }
        }
    }
    _format_text(text) {
        let time = (0, dateformat_1.default)(new Date(), defaults_1.defaults.time_format);
        time = (this.params.time === true) ? `[${time}]` : '';
        text = this._replace_root_string(text);
        if (this.params.fullwidth === true) {
            return this._full_width(text, time);
        }
        let output_text = '';
        output_text += time;
        if (time.length > 0) {
            output_text += ' ';
        }
        output_text += text;
        output_text += `\n`;
        return output_text;
    }
    _full_width(text, time) {
        let output_text = '';
        let text_lenght = 0;
        if (text.length > process.stdout.columns - 4) {
            text = text.substring(0, process.stdout.columns - 6);
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
        // if(this._has_prefixed_color(text) && this._has_prefixed_logtype(text)){
        // 	text_lenght -= this._prefixed_color_length(text) + 10;
        // }else if(this._has_prefixed_color(text)){
        // 	text_lenght -= this._prefixed_color_length(text);
        // }else if(this._has_prefixed_logtype(text)){
        // 	text_lenght -= 8;
        // }
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
    // 		colored_text = this._color_type(colored_text);
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
    // private _filter_log_level(text:string, level:LogLevel){
    // 	const prefixed_loglevel = this._get_prefixed_loglevel(text);
    // 	if(prefixed_loglevel > level){
    // 		return '';
    // 	}
    // 	return text;
    // }
    // private _has_prefixed_loglevel(text:string):boolean{
    // 	for(const pre of prefix_types){
    // 		if(text.indexOf(pre) !== -1){
    // 			return true;
    // 		}
    // 	}
    // 	return false;
    // }
    // private _has_prefixed_logtype(text:string):boolean{
    // 	for(const pre of prefix_types){
    // 		if(text.indexOf(pre) !== -1){
    // 			return true;
    // 		}
    // 	}
    // 	return false;
    // }
    // private _prefixed_color_length(text:string):number{
    // 	const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
    // 	const match = regex.exec(text);
    // 	if(!match){
    // 		return 0;
    // 	}
    // 	const color = match[1];
    // 	return color.length + 4;
    // }
    // private _has_prefixed_color(text:string):boolean{
    // 	const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
    // 	const match = regex.exec(text);
    // 	if(!match){
    // 		return false
    // 	}
    // 	return true;
    // }
    // private _remove_prefixed_color(text:string):string{
    // 	const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
    // 	const match = text.match(regex);
    // 	if(!match){
    // 		return text;
    // 	}
    // 	return text.replaceAll(match[0], '');
    // }
    /**
     * If there in the text there is something in the format [c#----]
     * i.e.: [c#magenta] | [c#FF6655]
     * or
     * uranio type i.e.: [debug___] | [log_____] | ...
     * it will return the text without the [c#----] | [<type>__] and with the
     * corrisponing color.
     */
    // private _color_type(text:string):string{
    // 	if(this._has_prefixed_logtype(text)){
    // 		return this._color_type(text);
    // 	}
    // 	// const regex = new RegExp(/\[c#([^\]]+)\] ?/g);
    // 	// const match = regex.exec(text);
    // 	// if(!match){
    // 	// 	return text;
    // 	// }
    // 	// const removed = text.replaceAll(match[0], '');
    // 	// const color = match[1];
    // 	// if(colors_16.includes(color) && typeof (chalk as any)[color] !== 'undefined'){
    // 	// 	return (chalk as any)[color](removed);
    // 	// }else{
    // 	// 	return chalk.hex(`#${color}`)(removed);
    // 	// }
    // }
    _color_type(text, level) {
        if (this.params.prefix_loglevel === true) {
            return text;
        }
        // const regex = new RegExp(/\[(trace|debug___|warn____|error___|ERROR)\]/);
        // const match = regex.exec(text);
        // if(!match){
        // 	return text;
        // }
        // if(this._has_prefixed_color(text)){
        // 	text = this._remove_prefixed_color(text);
        // }
        // const removed = text.replaceAll(match[0], '');
        // const type = match[1];
        switch (level) {
            case types_1.LogLevel.TRACE: {
                return chalk_1.default.gray(text);
            }
            case types_1.LogLevel.DEBUG: {
                return chalk_1.default.blue(text);
            }
            case types_1.LogLevel.LOG: {
                return chalk_1.default.cyan(text);
            }
            case types_1.LogLevel.WARN: {
                return chalk_1.default.yellow(text);
            }
            case types_1.LogLevel.ERROR: {
                return chalk_1.default.red(text);
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
        return (this.params.no_colors === false) ? chalk_1.default.magenta(text) : text;
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
// 				case '[trace]':{
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