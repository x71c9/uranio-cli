/**
 * Module for parsing arguments
 *
 * @packageDocumentation
 */

import minimist from 'minimist';

import {Arguments, ParseOptions} from '../types';

export function parser(args:string[] | undefined, options?:ParseOptions)
		:Arguments{
	return minimist(args, options);
}
