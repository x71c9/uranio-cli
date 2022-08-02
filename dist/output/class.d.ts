/**
 * Output class
 *
 * @packageDocumentation
 */
import { Params } from '../types';
declare class Output {
    params: Params;
    constructor(params: Params);
    log(text: string, _context?: string, _color?: string): void;
    verbose_log(text: string, _context?: string, _color?: string): void;
    debug_log(text: string, _context?: string, _color?: string): void;
    done_log(text: string, context?: string): void;
    done_verbose_log(text: string, context?: string): void;
    error_log(text: string, context?: string): void;
    warn_log(text: string, context?: string): void;
    end_log(text: string): void;
    wrong_end_log(text: string): void;
    start_loading(text: string): void;
    stop_loading(): void;
    spinner_text(text: string): void;
    private _spinner_text_color;
    private _go_previous;
}
export declare type OutputInstance = InstanceType<typeof Output>;
export declare function create(params: Params): OutputInstance;
export {};
