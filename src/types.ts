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

export type Params = {
	force: boolean
	verbose: boolean
	debug: boolean
	hide: boolean
	blank: boolean
	fullwidth: boolean
	native: boolean
	inside_ntl: boolean
	// is_dot: boolean
	time: boolean
	context: boolean
	prefix_color: boolean
	docker: boolean
	docker_db: boolean
	filelog: boolean
	spin: boolean
	color_uranio: boolean
	prefix: string
	branch: string
	config: string
	repo: Repo
	pacman: PacMan
	// deploy: Deploy
	db: DB
	color_log: string
	color_verbose: string
	color_debug: string
	root: string
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
	yarn: '',
	npm: '',
} as const;

// export const abstract_deploy = {
//   netlify: '',
//   express: '',
// } as const;

export const abstract_db = {
	mongo: ''
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

