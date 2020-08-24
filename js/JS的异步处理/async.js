const { async, await } = require("async")
const fs = require('fs')
const path = require('path')
const thunkify = require('thunkify');

async function test() {
  console.log('start')
  let a = await testPromise()
  console.log('a', a)
}

function testPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('success')
      // return 'success'
    })
  })
}

// test()


async function readFile(){
  var d1 = await fs.promises.readFile(path.resolve(__dirname, './package.json'))
  console.log(d1);
  var d2 = await fs.promises.readFile(path.resolve(__dirname, './promise.js'));  
  console.log(d2);
};

readFile()







