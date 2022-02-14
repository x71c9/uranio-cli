#!/usr/bin/env node

import {parser} from './args/index';

import {uranio_process} from './process';

const args = parser(process.argv.slice(2));

uranio_process(args);
