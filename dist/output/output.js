"use strict";
/**
 * Log module
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.verbose_log = exports.wrong_end_log = exports.end_log = exports.error_log = exports.done_verbose_log = exports.done_log = exports.spinner_text = exports.stop_loading = exports.start_loading = void 0;
const dateformat_1 = __importDefault(require("dateformat"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const defaults_1 = require("../conf/defaults");
function _spinner_text_color(text) {
    if (!text) {
        return '';
    }
    return (defaults_1.conf.blank === false) ? chalk_1.default.magenta(text) : text;
}
const spinner = ora_1.default({ text: 'Loading...', color: 'magenta', interval: 40 });
const spinner_texts = [];
function start_loading(text) {
    if (defaults_1.conf.hide === true) {
        return;
    }
    if (defaults_1.conf.blank === true) {
        spinner.color = 'white';
    }
    spinner_texts.push(text);
    spinner_text(text);
    if (defaults_1.conf.spinner === true && !spinner.isSpinning) {
        spinner.start();
    }
}
exports.start_loading = start_loading;
function stop_loading() {
    spinner.stop();
}
exports.stop_loading = stop_loading;
function spinner_text(text) {
    spinner.text = _spinner_text_color(text);
}
exports.spinner_text = spinner_text;
function _go_previous() {
    spinner_texts.pop();
    spinner_text(spinner_texts[spinner_texts.length - 1]);
}
function done_log(context, text) {
    _go_previous();
    log(context, `${defaults_1.defaults.check_char} ${text}`);
}
exports.done_log = done_log;
function done_verbose_log(context, text) {
    _go_previous();
    verbose_log(context, `${text}`);
}
exports.done_verbose_log = done_verbose_log;
function error_log(context, text) {
    stop_loading();
    const error_text = `${chalk_1.default.red(`[ERROR] ${text}`)}`;
    log(context, error_text);
}
exports.error_log = error_log;
function end_log(text) {
    stop_loading();
    const end_text = `${defaults_1.defaults.check_char} ${text}`;
    log('end', (!defaults_1.conf.blank) ? chalk_1.default.yellow(end_text) : end_text);
}
exports.end_log = end_log;
function wrong_end_log(text) {
    stop_loading();
    const end_text = `${defaults_1.defaults.wrong_char} ${text}`;
    log('end', (!defaults_1.conf.blank) ? chalk_1.default.red(end_text) : end_text);
}
exports.wrong_end_log = wrong_end_log;
function verbose_log(context, text) {
    const color_text = (!defaults_1.conf.blank) ? chalk_1.default.hex('#668899')(text) : text;
    _log(context, color_text, (defaults_1.conf.verbose === true));
}
exports.verbose_log = verbose_log;
function log(context, text) {
    _log(context, text, true);
}
exports.log = log;
function _log(context, text, out = false) {
    const output_text = _format_text(context, text);
    _log_to_file(output_text);
    if (out) {
        let was_spinning = false;
        if (spinner.isSpinning) {
            was_spinning = true;
            stop_loading();
        }
        if (defaults_1.conf.hide === false) {
            process.stdout.write(output_text);
        }
        if (defaults_1.conf.spinner === true && was_spinning) {
            spinner.start();
        }
    }
}
function _format_text(context, text) {
    let time = dateformat_1.default(new Date(), defaults_1.defaults.time_format);
    if (context.length < 4) {
        context = context.padEnd(4, '_');
    }
    else if (context.length > 4) {
        context = context.substr(0, 4);
    }
    text = _replace_root_string(text);
    const prefix = defaults_1.conf.prefix;
    context = `[${context}]`;
    time = `[${time}]`;
    let text_lenght = 0;
    text_lenght += prefix.length;
    text_lenght += context.length;
    text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length; // eslint-disable-line no-control-regex
    text_lenght += time.length;
    text_lenght += 4;
    if (defaults_1.conf.fullwidth === true) {
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
            const remain = process.stdout.columns
                - prefix.length
                - context.length
                - time.length
                - 4;
            text = text.substr(0, remain) + ' ...';
            text_lenght = remain - 6;
        }
    }
    let output_text = prefix;
    let dot = '.';
    if (defaults_1.conf.blank === false) {
        context = chalk_1.default.grey(context);
        text = chalk_1.default.green(text);
        dot = chalk_1.default.gray('.');
        time = chalk_1.default.blue(time);
    }
    if (defaults_1.conf.fullwidth === true) {
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
function _log_to_file(text) {
    fs_1.default.appendFileSync(defaults_1.defaults.log_filepath, text);
}
function _replace_root_string(str) {
    if (str.indexOf('$URNROOT$') !== -1) {
        return str.replace('$URNROOT$', '');
    }
    if (defaults_1.conf.root == '.') {
        return str;
    }
    const regex = new RegExp(`${defaults_1.conf.root}`, 'g');
    return str.replace(regex, 'ROOT');
}
//# sourceMappingURL=output.js.map