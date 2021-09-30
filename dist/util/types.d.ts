/**
 * Util types
 *
 * @packageDocumentation
 */
import chokidar from 'chokidar';
import { Repo, Deploy, PacMan } from '../types';
export declare type OnReadyCallback = () => void;
export declare type OnAllCallback = (event: WatchEvent, path: string) => void;
export declare type WatchProcessObject = {
    child: chokidar.FSWatcher;
    text: string;
    context: string;
};
export declare type WatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export declare type UtilParams = {
    root: string;
    repo: Repo;
    deploy: Deploy;
    pacman: PacMan;
};
