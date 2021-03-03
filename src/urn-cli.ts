#!/usr/bin/env node

import {parser} from './args/';

import {urn_process} from './process';

const args = parser(process.argv.slice(2));

urn_process(args);
