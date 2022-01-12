/**
 * Output class
 *
 * @packageDocumentation
 */

import ora from 'ora';

export const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

export const spinner_texts:string[] = [];
