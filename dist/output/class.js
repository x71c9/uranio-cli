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
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const defaults_1 = require("../conf/defaults");
class Output {
    constructor(root, native = false, blank = false, hide = false, spin = false, verbose = false, fullwidth = false, filelog = true, prefix = '') {
        this.root = root;
        this.native = native;
        this.blank = blank;
        this.hide = hide;
        this.spin = spin;
        this.verbose = verbose;
        this.fullwidth = fullwidth;
        this.filelog = filelog;
        this.prefix = prefix;
        this.spinner = ora_1.default({ text: 'Loading...', color: 'magenta', interval: 40 });
        this.spinner_texts = [];
    }
    log(text, context = 'log', color = '#859900') {
        const colored_text = (!this.blank) ? chalk_1.default.hex(color)(text) : text;
        this._log(colored_text, context, true);
    }
    verbose_log(text, context = 'vlog', color = '#668899') {
        const colored_text = (!this.blank) ? chalk_1.default.hex(color)(text) : text;
        this._log(colored_text, context, (this.verbose === true));
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
        this.log('end', (!this.blank) ? chalk_1.default.yellow(end_text) : end_text);
    }
    wrong_end_log(text) {
        this.stop_loading();
        const end_text = `${defaults_1.defaults.wrong_char} ${text}`;
        this.log('end', (!this.blank) ? chalk_1.default.red(end_text) : end_text);
    }
    start_loading(text) {
        if (this.hide === true) {
            return;
        }
        if (this.blank === true) {
            this.spinner.color = 'white';
        }
        this.spinner_texts.push(text);
        this.spinner_text(text);
        if (this.spin === true && !this.spinner.isSpinning) {
            this.spinner.start();
        }
    }
    stop_loading() {
        this.spinner.stop();
    }
    spinner_text(text) {
        this.spinner.text = this._spinner_text_color(text);
    }
    _log(text, context = 'log', out = false) {
        const output_text = (!this.native) ?
            this._format_text(text, context) : text;
        if (this.filelog) {
            _log_to_file(output_text);
        }
        if (out) {
            let was_spinning = false;
            if (this.spinner.isSpinning) {
                was_spinning = true;
                this.stop_loading();
            }
            if (this.hide === false) {
                process.stdout.write(output_text);
            }
            if (this.spin === true && was_spinning) {
                this.spinner.start();
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
        if (this.fullwidth === true) {
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
                if (this.blank === true) {
                    remain -= 19;
                }
                text = text.substr(0, remain) + '...';
                text_lenght = remain + 4;
                if (this.blank === true) {
                    text_lenght += 19;
                }
            }
        }
        let output_text = prefix;
        let dot = '.';
        if (this.blank === false) {
            context = chalk_1.default.grey(context);
            text = chalk_1.default.green(text);
            dot = chalk_1.default.gray('.');
            time = chalk_1.default.blue(time);
        }
        if (this.fullwidth === true) {
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
        if (this.root == '.') {
            return str;
        }
        const regex = new RegExp(`${this.root}`, 'g');
        return str.replace(regex, 'ROOT');
    }
    _spinner_text_color(text) {
        if (!text) {
            return '';
        }
        return (this.blank === false) ? chalk_1.default.magenta(text) : text;
    }
    _go_previous() {
        this.spinner_texts.pop();
        this.spinner_text(this.spinner_texts[this.spinner_texts.length - 1]);
    }
}
function _log_to_file(text) {
    fs_1.default.appendFileSync(defaults_1.defaults.log_filepath, text);
}
const default_params = {
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
function create(params) {
    const merged_params = Object.assign(Object.assign({}, default_params), params);
    return new Output(merged_params.root, merged_params.native, merged_params.blank, merged_params.hide, merged_params.spin, merged_params.verbose, merged_params.fullwidth, merged_params.filelog, merged_params.prefix);
}
exports.create = create;
//# sourceMappingURL=class.js.map