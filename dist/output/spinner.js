"use strict";
/**
 * Output class
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner_texts = exports.spinner = void 0;
const ora_1 = __importDefault(require("ora"));
exports.spinner = ora_1.default({ text: 'Loading...', color: 'magenta', interval: 40 });
exports.spinner_texts = [];
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
//# sourceMappingURL=spinner.js.map