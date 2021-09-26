/**
 * Util Watch
 *
 * @packageDocumentation
 */

import chokidar from 'chokidar';

type WatchProcessObject = {
	child: chokidar.FSWatcher
	text: string,
	context: string
}

export const watch_child_list:WatchProcessObject[] = [];

type WatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';

export function watch(
	watch_path: string,
	watch_text: string,
	on_ready: () => void,
	on_all: (_event:WatchEvent, _path:string) => void
):void{
	const watch_server = chokidar.watch(watch_path).on('ready', on_ready).on('all', on_all);
	watch_child_list.push({
		child: watch_server,
		context: `wtch`,
		text: watch_text
	});
}

