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
exports.log = exports.verbose_log = exports.end_log = exports.error_log = exports.done_verbose_log = exports.done_log = exports.spinner_text = exports.stop_loading = exports.start_loading = void 0;
const dateformat_1 = __importDefault(require("dateformat"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const defaults_1 = require("../conf/defaults");
function _spinner_text_color(text) {
    if (!text) {
        return '';
    }
    return (defaults_1.conf.colors === true) ? chalk_1.default.magenta(text) : text;
}
const spinner = ora_1.default({ text: 'Loading...', color: 'magenta', interval: 40 });
const spinner_texts = [];
function start_loading(text) {
    if (defaults_1.conf.colors === false) {
        spinner.color = 'white';
    }
    spinner_texts.push(text);
    spinner_text(text);
    if (!spinner.isSpinning) {
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
    log('end', (defaults_1.conf.colors) ? chalk_1.default.yellow(end_text) : end_text);
}
exports.end_log = end_log;
function verbose_log(context, text) {
    const color_text = (defaults_1.conf.colors) ? chalk_1.default.hex('#668899')(text) : text;
    _log(context, color_text, (defaults_1.conf.verbose === true));
}
exports.verbose_log = verbose_log;
function log(context, text) {
    _log(context, text, true);
}
exports.log = log;
function _log(context, text, out = false) {
    const time_text = _format_text(context, text);
    _log_to_file(time_text);
    if (out) {
        let was_spinning = false;
        if (spinner.isSpinning) {
            was_spinning = true;
            stop_loading();
        }
        if (defaults_1.conf.output === true) {
            process.stdout.write(_replace_root_string(time_text));
        }
        if (was_spinning) {
            spinner.start();
        }
    }
}
function _format_text(context, text) {
    const time = dateformat_1.default(new Date(), defaults_1.defaults.time_format);
    if (context.length < 4) {
        context = context.padEnd(4, '_');
    }
    else if (context.length > 4) {
        context = context.substr(0, 4);
    }
    let time_text = '';
    if (defaults_1.conf.colors === true) {
        time_text += `${chalk_1.default.blue(`[${time}]`)} `;
        time_text += `${chalk_1.default.grey(`[${context}]`)} `;
        time_text += `${chalk_1.default.green(text)}`;
    }
    else {
        time_text += `[${time}] `;
        time_text += `[${context}] `;
        time_text += text;
    }
    time_text += `\n`;
    return time_text;
}
function _log_to_file(text) {
    fs_1.default.appendFileSync(defaults_1.defaults.log_filepath, text);
}
function _replace_root_string(str) {
    if (str.indexOf('$URNROOT$') !== -1) {
        return str.replace('$URNROOT$', '');
    }
    const regex = new RegExp(`${global.uranio.root}`, 'g');
    return str.replace(regex, 'ROOT');
}
//# sourceMappingURL=log.js.map