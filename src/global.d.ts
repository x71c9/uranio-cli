/**
 * Extending global type
 *
 * @packageDocumentation
 */

export {};

declare global {
	namespace NodeJS {
		interface Global {
				uranio: {
					root: string;
				}
		}
  }
}
