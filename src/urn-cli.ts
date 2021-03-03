#!/usr/bin/env node

import {parser} from './args/';

import {urn_process} from './process';

const args = parser(process.argv.slice(2));

urn_process(args);

// import * as output from './log/';

// output.start_loading('A', 'Some');

// _anot();

// function _anot(){
//   output.start_loading('B', 'Some 2');

//   output.verbose_log('sss', 'VVEVVEVE');
	
//   _som();
	
//   output.done_log('B', 'd', 'AAAAA DOne');
// }

// function _som(){

//   output.start_loading('c', 'Some dkfhjds');
	
//   output.done_log('c', 'ddd', 'AAAAA DOdsalfjlksjafne');
// }
