/**
 * Util Watch
 *
 * @packageDocumentation
 */
import chokidar from 'chokidar';
declare type WatchProcessObject = {
    child: chokidar.FSWatcher;
    text: string;
    context: string;
};
export declare const watch_child_list: WatchProcessObject[];
declare type WatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export declare function watch(watch_path: string, watch_text: string, on_ready: () => void, on_all: (_event: WatchEvent, _path: string) => void): void;
export {};
