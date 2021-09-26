/**
 * Init command module
 *
 * @packageDocumentation
 */

import * as output from '../output/';

import * as util from '../util/';

export const test = {
	
	command: async ():Promise<void> => {
		
		output.stop_loading();
		
		util.read_rc_file();
		
		output.verbose_log('TEST URANIO LOG');
		
	}
	
};

