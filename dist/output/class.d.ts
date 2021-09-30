/**
 * Output class
 *
 * @packageDocumentation
 */
import ora from 'ora';
import { Params } from '../types';
declare class Output {
    params: Params;
    spinner: ora.Ora;
    spinner_texts: string[];
    constructor(params: Params);
    log(text: string, context?: string, color?: string): void;
    verbose_log(text: string, context?: string, color?: string): void;
    done_log(text: string, context?: string): void;
    done_verbose_log(text: string, context?: string): void;
    error_log(text: string, context?: string): void;
    end_log(text: string): void;
    wrong_end_log(text: string): void;
    start_loading(text: string): void;
    stop_loading(): void;
    spinner_text(text: string): void;
    private _log;
    private _format_text;
    private _replace_root_string;
    private _spinner_text_color;
    private _go_previous;
}
export declare type OutputInstance = InstanceType<typeof Output>;
export declare function create(params: Partial<Params>): OutputInstance;
export {};
