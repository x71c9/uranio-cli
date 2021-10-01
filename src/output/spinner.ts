/**
 * Output class
 *
 * @packageDocumentation
 */

import ora from 'ora';

export const spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});

export const spinner_texts:string[] = [];

// export function start_loading(text:string)
//     :void{
//   if(params.hide === true){
//     return;
//   }
//   if(params.blank === true){
//     spinner.color = 'white';
//   }
//   spinner_texts.push(text);
//   spinner_text(text);
//   if(params.spin === true && !this.spinner.isSpinning){
//     spinner.start();
//   }
// }

// export function stop_loading()
//     :void{
//   spinner.stop();
// }

// export function spinner_text(text:string)
//     :void{
//   spinner.text = this._spinner_text_color(text);
// }

