/**
 * Output class
 *
 * @packageDocumentation
 */
import { Params } from '../types';
declare class Output {
    params: Params;
    constructor(params: Params);
    log(text: string, prefix?: string): void;
    verbose_log(text: string, prefix?: string): void;
    debug_log(text: string, prefix?: string): void;
    done_log(text: string, prefix?: string): void;
    done_verbose_log(text: string, prefix?: string): void;
    end_log(text: string, prefix?: string): void;
    error_log(text: string, prefix?: string): void;
    warn_log(text: string, prefix?: string): void;
    wrong_end_log(text: string, prefix?: string): void;
    start_loading(text: string): void;
    stop_loading(): void;
    spinner_text(text: string): void;
    clean_chunk(chunk: string): string;
    private _read_and_color;
    private _prefix_color;
    private _log;
    private _format_text;
    private _full_width;
    private _has_prefixed_type;
    private _prefixed_color_length;
    private _has_prefixed_color;
    private _remove_prefixed_color;
    /**
     * If there in the text there is something in the format [c#----]
     * i.e.: [c#magenta] | [c#FF6655]
     * or
     * uranio type i.e.: [debug___] | [log_____] | ...
     * it will return the text without the [c#----] | [<type>__] and with the
     * corrisponing color.
     */
    private _read_color;
    private _color_type;
    private _replace_root_string;
    private _spinner_text_color;
    private _go_previous;
}
export declare type OutputInstance = InstanceType<typeof Output>;
export declare function create(params: Params): OutputInstance;
export {};
