/**
 * Output class
 *
 * @packageDocumentation
 */
import { Params } from '../types';
declare class Output {
    params: Params;
    constructor(params: Params);
    white_log(text: string): void;
    error_log(text: string, prefix?: string): void;
    warn_log(text: string, prefix?: string): void;
    info_log(text: string, prefix?: string): void;
    debug_log(text: string, prefix?: string): void;
    trace_log(text: string, prefix?: string): void;
    done_log(text: string, prefix?: string): void;
    done_debug_log(text: string, prefix?: string): void;
    done_trace_log(text: string, prefix?: string): void;
    end_log(text: string, prefix?: string): void;
    wrong_end_log(text: string, prefix?: string): void;
    start_loading(text: string): void;
    stop_loading(): void;
    spinner_text(text: string): void;
    translate_loglevel(text: string, over?: string): void;
    clean_chunk(chunk: string): string;
    private _prefixes;
    private _log;
    private _format_text;
    private _full_width;
    /**
     * If there in the text there is something in the format [c#----]
     * i.e.: [c#magenta] | [c#FF6655]
     * or
     * uranio type i.e.: [debug___] | [info_] | ...
     * it will return the text without the [c#----] | [<type>__] and with the
     * corrisponing color.
     */
    private _color_type;
    private _replace_root_string;
    private _spinner_text_color;
    private _go_previous;
}
export declare type OutputInstance = InstanceType<typeof Output>;
export declare function create(params: Params): OutputInstance;
export {};
