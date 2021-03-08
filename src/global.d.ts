/**
 * Extending global type
 *
 * @packageDocumentation
 */

export {};

import {Repo} from './types';

declare global {
	namespace NodeJS {
		interface Global {
				uranio: {
					root: string,
					repo: Repo
				}
		}
  }
}
