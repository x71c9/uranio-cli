// import urn_cli from './index';

// urn_cli.init('./');
// urn_cli.transpose('/home/nbl7/repos/urn-tst');

// SPAWN IN SPINNER
// SPAWN AND LOG
// SPAWN NATIVE LOG
// EXECUTE / SPAWN NO LOG
// LOG NATIVE
// COPY FILE FILES FOLDERS DELETE ...

// import * as spawn from './util/spawn';

// import * as out from './output/';

// const output = out.create({
//   verbose: true,
//   spin: true,
//   native: false,
//   blank: false,
//   hide: false,
//   fullwidth: false
// });

// const spa = spawn.create(output);

// spa.exec_sync('rm -rf /home/nbl7/tmp/urn-dot');

// const cmd = 'git clone ssh+git://git@bitbucket.org/nbl7/urn-dot.git /home/nbl7/tmp/urn-dot';
// // const cmd = 'ls -a';

// function run(){
//   return new Promise((res, rej) => {
//     spa.spin(cmd, 'tst', 'action', undefined, res, rej);
//   });
// }

// run().then(() => {
//   // output.stop_loading();
//   // console.log('DONE');
// }).catch((err) => {
//   // output.stop_loading();
//   console.log('ERROR', err);
// });

// console.log('TEST');
