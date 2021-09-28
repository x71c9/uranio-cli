/**
 * Util types
 *
 * @packageDocumentation
 */

import chokidar from 'chokidar';

export type OnReadyCallback = () => void;

export type OnAllCallback = (event:WatchEvent, path:string) => void;

export type WatchProcessObject = {
	child: chokidar.FSWatcher
	text: string,
	context: string
}

export type WatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';

