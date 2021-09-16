import {
	init,
	transpose,
	alias,
	hooks,
} from './cmd/';

export default {
	init: init.run,
	transpose: transpose.run,
	alias: alias.run,
	hooks: hooks.run,
};
