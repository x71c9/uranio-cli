import {
	init,
	transpose,
	alias,
	generate
} from './cmd/';

export default {
	init: init.run,
	transpose: transpose.run,
	alias: alias.run,
	generate: generate.run
};
