const { reject } = require("async")

async function test() {
  console.log('start')
  let a = await testPromise()
  console.log('a', a)
}

function testPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('success')
      return 'success'
    })
  })
}

test()