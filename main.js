import MainModuleFactory from './sum.js';

MainModuleFactory().then(Module => {
  console.log('Wasm module loaded.');
  const result = Module._sum(10, 10);
  console.log('Result of sum(5, 10) is:', result);
  document.body.innerHTML += 'Result of sum(5, 10) is: ' + result;
});
