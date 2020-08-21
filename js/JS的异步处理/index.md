# JS中处理异步的四种方式
1. 回调
2. 事件
3. Promise
    - 几个关键字：async, await, promise.resolve(), promise.reject()
    - promise的原理，手写一个promise
4. Generator
    - 函数的介绍和基本用法，next执行后的现象，
    - thunk函数
    - co模块


```javascript
function* gen(x){
  var y = yield x + 2;
  console.log(y * 10)
  var z = yield y + 2
  return z
}

```

JS 原生的实现异步的方式大概有这么几种：
 - setTimeout, setImmediate, requestAnimationFrame: 回调
 - Image加载，Script 加载，iFrame 加载， Ajax: 事件
 - Fetch： Promise

因为JS是单线程的，所以，异步处理机制在JS中扮演着极其重要的角色，JS语言发展到几天，ES6标准正式公布，ES7、8的标准也在不断的更新，异步处理机制主要有四种实现方式。

第一种就是常规的回调函数，使用在一般场景，但复杂场景下，容易导致回调地狱。也正式因为这个问题，社区才有动力讨论Promise和Generator等解决方案。对应的 JS 原生方法有：` setTimeout, setImmediate, requestAnimationFrame`

第二种方案就是事件绑定和监听，很常规的做法，不多讲。对应的 JS 原生方法有：` Image加载，Script 加载，iFrame 加载， Ajax`等等。

重点探讨记录一下`Promise`和`Generator`两种方式。

## Promise

Promise的常规用法不再多讲，通过`Promise`可以将以前的回调地狱改为链式操作，在代码的建筑美学方面的确是很大的提升。

记录几个Promise的原型方法：

`const p = Promise.all([p1, p2, p3])`： 当所有的参数的状态都变成`fulfilled`时， `p`的状态变成`fulfilled`, 返回值对应参数顺序的一个数组； 当任何一个参数的状态变成`rejected`时， `p`的状态变成`rejected`，返回值是第一个rejected的实例的返回值。

`const p = Promise.race([p1, p2, p3])`: 当任一参数的状态改变（变为`fulfilled`或`rejected`），则p的状态随之更改为`fulfilled`或`rejected`

`const p = Promise.allSettled([p1, p2, p3])`: 当所有参数的状态改变（变为`fulfilled`或`rejected`）之后，p的状态随之更改为`fulfilled`， p的状态永远不会改为`rejected`。

`const p = Promise.any([p1, p2, p3])`： 当任一参数的状态变为`fulfilled`，p的状态变为`fulfilled`，如果所有参数的状态都是`rejected`，则p的状态变为`rejected`， 类似与数组的`array.some()`方法。

### 关键字 async, await

这两个关键字是ECMAScript 2017 JavaScript版的一部分，他们是基于Promise的语法糖，使异步操作的代码在形式上更加接近于同步方法。

`async` 关键字使一个普通方法变为`async function`, 对于async function, 它将始终返回一个`Promise`对象，即使这个方法中并没有`return`语句。那么自然的，对于任何 `async function` 的返回值都可以使用promise实例上的方法。

`await` 关键字放在一个`Promise`对象或返回`Promise`值的方法之前，它会告诉JS引擎在这一行上暂停，直到后面的`Promise`的状态改变，然后解析出promise的返回值，`let a = await promise.resolve(1)`，再这之后，这一行后面代码可以继续执行。

> `await` 只出现在 `async function`中 

### 手写一个Promise

先引用一段MDN上关于Promise的参数excutor的解释，这有助于我们分析手写的这个MyPromise类需要有哪些功能。

> executor是带有 resolve 和 reject 两个参数的函数 。Promise构造函数执行时立即调用executor 函数， resolve 和 reject 两个函数作为参数传递给executor（executor 函数在Promise构造函数返回所建promise实例对象前被调用）。resolve 和 reject 函数被调用时，分别将promise的状态改为fulfilled（完成）或rejected（失败）。executor 内部通常会执行一些异步操作，一旦异步操作执行完毕(可能成功/失败)，要么调用resolve函数来将promise状态改成fulfilled，要么调用reject 函数将promise的状态改为rejected。如果在executor函数中抛出一个错误，那么该promise 状态为rejected。executor函数的返回值被忽略。

逐步分析一些MyPromise：
1. MyPromise 有三种状态，pending, fulfilled, rejected, pending是初始状态，一个MyPromise的状态只能改变一次，即变为fulfilled 或 rejected

2. MyPromise是一个类，类的初始化选项executor是一个函数，并且在类进行实例化的时候，executor会被立即执行；

3. executor 有两个函数参数，resolve 和 reject，在executor内执行 resolve 表示 异步执行完毕且获得了成功的结果。reject 同理。

4. 不考虑原生JS的话，我们要想知道异步方法什么时候结束，只有借助回调或事件的方式，然后再异步方法执行完毕之后，手动调用 resolve 或 reject 方法来传递异步执行完毕的信息。

5. 每个MyPromise的实例 p 都有 then 方法 ，这个方法接受一个方法作为参数，这个参数会对异步执行的结果做进一步处理，

6. MyPromise 支持链式调用，所以要求，then 方法每次的返回值也是 MyPromise 实例，但注意一下，then 方法每次返回的是一个**新的MyPromise的实例**。

单独解析一下MyPromise的 then 方法：

1. then(onFulfilled, onRejected) 方法可以接收两个参数，如果第二个参数存在，作为捕捉 rejection 的回调；then 方法的返回值默认情况下是 Promise.resolve(res) ，当然也可以显式的指定返回一个 rejection 状态的 Promise。

2. 当 MyPromise 的实例 p 是 pending 状态时，执行 p.then 是 **添加**回调方法到Promise。 这里利用的是发布订阅模式，then()方法在MyPromise实例 p 上添加订阅方法，当用户调用了 resolve() 改变其状态之后，会执行之前的订阅方法。

3. 对象 p 可以添加多个 then 方法，p.then(fn1), p.then(fn2), p.then(fn3)， fn1, fn2, fn3... 都将在resolve之后得以执行。

4. 如果在p对象的状态改变之后再次使用then()方法添加，那么此时添加的方法将立即执行。

> catch 方法的返回值默认情况下也是 Promise.resolve(res)

根据上面的分析，写一个简单的MyPromise, 这个例子中只用来说明Promise的主要流程，相对完整的 MyPromise [在这里](./promise.js)

```javascript
const STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
}


class MyPromise { 

  constructor(executor) {
    this._status = STATUS.PENDING

    this._value = null  // 成功后的返回值

    this._reason = null  // 失败后的返回值

    this.resolveFn = [] // 存储所有成功的订阅方法

    this.rejectFn = []

    executor(this.resolve.bind(this), this.reject.bind(this))
  }

  // 由用户调用执行
  resolve( value ) {
    if (this._status === STATUS.PENDING) {
      this._status = STATUS.FULFILLED
      this._value = value
      this.execuFnArr( this.resolveFn, this._value)
    }
  }

  // 由用户调用执行
  reject( reason) {
    if (this._status === STATUS.PENDING) {
      this._status = STATUS.REJECTED
      this._reason = reason 
      this.execuFnArr( this.rejectFn, this._value)
    }
  } 

  execuFnArr(fnArr, value) {
    for (let fn of fnArr) {
      fn.call(this, value)
    }
  }
  
  // 返回新的 MyPromise 实例，支持链式调用
  // 注意不同状态下，then 方法的不同处理方式
  then(onFulfilled, onRejected) { 
    const _this = this
    return new MyPromise((resolve, reject) => {
      if (_this._status === STATUS.PENDING) {
        this.resolveFn.push(onFulfilled)
        this.rejectFn.push(onRejected)
      } 
      if (_this._status === STATUS.FULFILLED) {
        resolve(onFulfilled(_this._value))
      } 
      
      if ( _this._status === STATUS.REJECTED) {
        reject(onRejected(_this._reason))
      }
    })
  }

  catch(onRejected) {
    const _this = this
    return new MyPromise((resolve, reject) => {
      if (_this._status === STATUS.PENDING) {
        this.rejectFn.push(onRejected) 
      } 
      if (_this._status === STATUS.FULFILLED) { 
      } 
      
      if ( _this._status === STATUS.REJECTED) {
        reject(onRejected(_this._reason))
      }
    })
  }

}


```


## Generator的异步管理方案

`Generator`号称JS 异步的终极解决方案，但很遗憾，在实际的项目中，我用到的并不是很多，对其理解的可能不是很到位，姑妄言之。

单独一个`Generator`函数并不能实现异步处理的功能，一个完整的异步管理功能，需要三个功能配合：`Generator`, `yield`, `Thunk`。我们把`Generator`函数的内部代码逻辑叫做主程，`yield` 关键字后面的代码叫做协程，当主程执行遇到 `yield` 关键字时就交出执行权，暂停执行主程内容。此时，程序开始执行协程的内容，而通过规定协程部分的代码只能是`Thunk`函数的形式，我们可以对执行权进行标准化管理，知道何时可以收回执行权到主程并继续执行后面的逻辑。 

### Generator 和 yield

```javascript
function* myGenerator() {
  console.log('before')
  const a = yield 'hello'
  console.log('a', a)
  const b = yield 'world'
  console.log('b', b)
  return 'end'
}

const gen = myGenerator()
const genA = gen.next() // before
const genB = gen.next() // a, undefined
const genC = gen.next(genB.value) // b, world

// genA = {value: "hello", done: false}
// genB = {value: "world", done: false}
// genC = {value: "end", done: true}

```
从外形上看，和标准的函数没有大的区别，多了一个 `*` 和 `yield`。但当我们去调用这个函数的时候，这里Generator函数的独特性才体现出来。

如果是一般的函数，当我们调用它的时候会立刻得到返回值。但这里我们执行`var gen = myGenerator()` 不会看到函数内部会有任何输出，我们得到的是一个遍历器对象（其本质是一个指向内部状态的指针）。

这么设计是为了实现 Generator 的核心功能：**交出函数的执行权**，具体表现是，可以暂停函数内部代码的执行。

当我们第一次执行 `gen.next()` 方法时，遍历器开始执行内部的方法，当代码执行遇到`yield`关键字的时候，暂停执行，交出执行权， 程序开始执行 `yield` 后面的协程。

但是，协程部分的返回值会直接赋值给变量`const a`吗 ？仔细想一下并不会，因为`const a `是在主程中声明的，协程中的返回值怎么能赋值给主程中的变量呢？

> 你拿前朝的剑怎么能斩本朝的官呢？

事实上，`gen.next()` 方法是将协程中的返回值抛出了 `myGenerator`函数，赋值给了变量 `const genA`。如果我们想要在主程内使用协程中的返回值，可以将返回值作为参数，在下次调用`gen.next()`函数的时候传入到主程中。就像上例的`gen.next(genB.value)`

### Thunk



 













