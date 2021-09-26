/**
 * Log module
 *
 * @packageDocumentation
 */
export declare function start_loading(text: string): void;
export declare function stop_loading(): void;
export declare function spinner_text(text: string): void;
export declare function done_log(text: string, context?: string): void;
export declare function done_verbose_log(text: string, context?: string): void;
export declare function error_log(text: string, context?: string): void;
export declare function end_log(text: string): void;
export declare function wrong_end_log(text: string): void;
export declare function verbose_log(text: string, context?: string, color?: string): void;
export declare function log(text: string, context?: string, color?: string): void;
