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
// import ora from 'ora';
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const defaults_1 = require("../conf/defaults");
// import {merge_params} from '../cmd/common';
const spinner_1 = require("./spinner");
// import {OutputParams} from './types';
class Output {
    // public spinner:ora.Ora
    // public spinner_texts:string[]
    constructor(params) {
        // this.spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});
        // this.spinner_texts = [];
        this.params = params;
    }
    log(text, context = 'log', color) {
        const final_color = (typeof color === 'string') ? color : this.params.color;
        const colored_text = (!this.params.blank) ? chalk_1.default.hex(final_color)(text) : text;
        this._log(colored_text, context, true);
    }
    verbose_log(text, context = 'vlog', color) {
        const final_color = (typeof color === 'string') ? color : this.params.color_verbose;
        const colored_text = (!this.params.blank) ? chalk_1.default.hex(final_color)(text) : text;
        this._log(colored_text, context, (this.params.verbose === true));
    }
    debug_log(text, context = 'dlog', color) {
        const final_color = (typeof color === 'string') ? color : this.params.color_debug;
        const colored_text = (!this.params.blank) ? chalk_1.default.hex(final_color)(text) : text;
        this._log(colored_text, context, (this.params.debug === true));
    }
    done_log(text, context = 'done') {
        this._go_previous();
        this.log(`${defaults_1.defaults.check_char} ${text}`, context);
    }
    done_verbose_log(text, context = 'vdne') {
        this._go_previous();
        this.verbose_log(`${text}`, context);
    }
    error_log(text, context = 'errr') {
        this.stop_loading();
        // const error_text = `${chalk.bgHex(`#4a3030`).hex(`#8b6666`)(`[ERROR] ${text}`)}`;
        // const error_text = `${chalk.hex(`#922424`)(`[ERROR] ${text}`)}`;
        const error_text = `${chalk_1.default.hex(`#874040`)(`[ERROR] ${text}`)}`;
        this.log(error_text, context);
    }
    end_log(text) {
        this.stop_loading();
        const end_text = `${defaults_1.defaults.check_char} ${text}`;
        this.log((!this.params.blank) ? chalk_1.default.yellow(end_text) : end_text, 'end');
    }
    wrong_end_log(text) {
        this.stop_loading();
        const end_text = `${defaults_1.defaults.wrong_char} ${text}`;
        this.log((!this.params.blank) ? chalk_1.default.red(end_text) : end_text, 'end');
    }
    start_loading(text) {
        if (this.params.hide === true) {
            return;
        }
        if (this.params.blank === true) {
            spinner_1.spinner.color = 'white';
        }
        spinner_1.spinner_texts.push(text);
        this.spinner_text(text);
        if (this.params.spin === true && !spinner_1.spinner.isSpinning) {
            spinner_1.spinner.start();
        }
    }
    stop_loading() {
        spinner_1.spinner.stop();
    }
    spinner_text(text) {
        spinner_1.spinner.text = this._spinner_text_color(text);
    }
    _log(text, context = 'log', out = false) {
        const output_text = (!this.params.native) ?
            this._format_text(text, context) : text + '\n';
        if (this.params.filelog) {
            _log_to_file(output_text);
        }
        if (out) {
            let was_spinning = false;
            if (spinner_1.spinner.isSpinning) {
                was_spinning = true;
                this.stop_loading();
            }
            if (this.params.hide === false) {
                process.stdout.write(output_text);
            }
            if (this.params.spin === true && was_spinning) {
                spinner_1.spinner.start();
            }
        }
    }
    _format_text(text, context = 'frmt') {
        let time = dateformat_1.default(new Date(), defaults_1.defaults.time_format);
        if (context.length < 4) {
            context = context.padEnd(4, '_');
        }
        else if (context.length > 4) {
            context = context.substr(0, 4);
        }
        text = this._replace_root_string(text);
        const prefix = this.params.prefix;
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
        if (this.params.fullwidth === true) {
            const gap_lenght = process.stdout.columns - text_lenght;
            if (gap_lenght < 0 && gap_lenght > -9) {
                time = time.replace(dateformat_1.default(new Date, "yy-mm-dd'T'"), '');
                text_lenght -= 9;
            }
            else if (gap_lenght <= -9 && gap_lenght > -21) {
                time = '';
                text_lenght -= 24;
            }
            else if (gap_lenght <= -21) {
                time = '';
                let remain = process.stdout.columns + 2;
                if (this.params.blank === true) {
                    remain -= 19;
                }
                text = text.substr(0, remain) + '...';
                text_lenght = remain + 4;
                if (this.params.blank === true) {
                    text_lenght += 19;
                }
            }
        }
        let output_text = prefix;
        let dot = '.';
        if (this.params.blank === false) {
            context = chalk_1.default.grey(context);
            text = chalk_1.default.green(text);
            dot = chalk_1.default.gray('.');
            time = chalk_1.default.blue(time);
        }
        if (this.params.fullwidth === true) {
            output_text += context + ' ';
            output_text += text + ' ';
            for (let i = 0; i < process.stdout.columns - text_lenght; i++) {
                output_text += dot;
            }
            output_text += ' ';
            output_text += time;
        }
        else {
            output_text += time + ' ';
            output_text += context + ' ';
            output_text += text + ' ';
        }
        output_text += `\n`;
        return output_text;
    }
    _replace_root_string(str) {
        if (str.indexOf('$URNROOT$') !== -1) {
            return str.replace('$URNROOT$', '');
        }
        if (this.params.root == '.') {
            return str;
        }
        const regex = new RegExp(`${this.params.root}`, 'g');
        return str.replace(regex, 'ROOT');
    }
    _spinner_text_color(text) {
        if (!text) {
            return '';
        }
        return (this.params.blank === false) ? chalk_1.default.magenta(text) : text;
    }
    _go_previous() {
        spinner_1.spinner_texts.pop();
        if (spinner_1.spinner_texts.length > 0) {
            this.spinner_text(spinner_1.spinner_texts[spinner_1.spinner_texts.length - 1]);
        }
    }
}
function _log_to_file(text) {
    fs_1.default.appendFileSync(defaults_1.defaults.log_filepath, text);
}
function create(params) {
    // const full_params = merge_params(params);
    return new Output(params);
}
exports.create = create;
//# sourceMappingURL=class.js.map