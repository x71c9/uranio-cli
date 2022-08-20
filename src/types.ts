/**
 * Type module
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

export type Repo = keyof typeof abstract_repos;
export type PacMan = keyof typeof abstract_pacman;
// export type Deploy = keyof typeof abstract_deploy;
export type DB = keyof typeof abstract_db;

export enum LogLevel {
	NONE = 0,
	ERROR = 1,
	WARN = 2,
	INFO = 3,
	DEBUG = 4,
	TRACE = 5
}

export type Params = {
	prod: boolean
	force: boolean
	verbose: boolean
	trace: boolean
	// hide: boolean
	no_colors: boolean
	prefix_logtype: boolean
	fullwidth: boolean
	// native: boolean
	inside_ntl: boolean
	time: boolean
	// context: boolean
	// prefix_color: boolean
	// docker: boolean
	// docker_db: boolean
	// build: boolean
	docker_load: boolean
	filelog: boolean
	spin: boolean
	prefix: string
	branch: string
	config: string
	repo: Repo
	pacman: PacMan
	// deploy: Deploy
	db: DB
	root: string
	docker_tag: string
	log_level: LogLevel
}

export type Arguments = minimist.ParsedArgs;

export type ParseOptions = minimist.Opts;

export const abstract_repos = {
	core: '',
	api: '',
	trx: '',
	adm: ''
} as const;

export const abstract_deploy_repos = {
	api: '',
	trx: '',
	adm: ''
} as const;

export const abstract_hooks_repos = {
	trx: '',
	adm: ''
} as const;

export const abstract_admin_repos = {
	adm: ''
} as const;

export const abstract_pacman = {
	npm: '',
	yarn: '',
	pnpm: ''
} as const;

// export const abstract_deploy = {
//   netlify: '',
//   express: '',
// } as const;

export const abstract_db = {
	mongo: ''
} as const;

export const abstract_loglevel = {
	none: '',
	error: '',
	warn: '',
	info: '',
	debug: '',
	trace: ''
} as const;

export function valid_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_deploy_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_deploy_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_client_repos()
		:string[]{
	return valid_hooks_repos();
}

export function valid_hooks_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_hooks_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_admin_repos()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_admin_repos){
		vals.push(k);
	}
	return vals;
}

export function valid_pacman()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_pacman){
		vals.push(k);
	}
	return vals;
}

// export function valid_deploy()
//     :string[]{
//   const vals:string[] = [];
//   for(const k in abstract_deploy){
//     vals.push(k);
//   }
//   return vals;
// }

export function valid_db()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_db){
		vals.push(k);
	}
	return vals;
}

export function valid_loglevel()
		:string[]{
	const vals:string[] = [];
	for(const k in abstract_loglevel){
		vals.push(k);
	}
	return vals;
}
// export type InitParams = Partial<Params> & {
//   root: string
//   repo?: Repo
//   deploy?: Deploy
//   pacman?: PacMan
//   branch?: string
// }

export type Aliases = {
	[key:string]: string[]
}

export type PacManExec = {
	[k in PacMan]: string
}

