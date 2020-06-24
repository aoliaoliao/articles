
在web的世界里，有些事件会在一次连贯的操作中被短时间内的触发多次，比如，keydown, resize, input, scroll，drag 等；有些场景下，用户出于各种原因或频繁的触发同一个方法，比如多次点击统一按钮，这些场景中的触发频率一般不受开发人员控制，但通过适当的减少这些事件对应方法的执行频率，可以降低一些不必要的消耗，提高系统的性能。

防抖和节流，这两个概念就是为了这种场景而提出来的。

[Demo](./demo.html)

# 防抖

顾名思义，当我们本意只是想点击一下按钮，但不小心手抖或鼠标出问题，连续点击了多次，这个时候只执行最后一次触发的方法。

稍微概念性的说法是： **当持续触发事件时， 这段时间内只执行一次处理函数**


### 非立即执行

想要实现一个防抖方法，很自然想到要用`setTimeout`

封装一个防抖方法，
1. 入参包括待执行的方法`fn`, 单位时间`wait`，返回一个被执行的方法
2. 定义变量 `timeoutID`，存储定时器的编号，初始值为null
3. 如果 timeoutID 不等于 null，表明在单位时间内再次触发了事件，那么清空此次计时，重新开始计时。
4. 设置定时器，当时间到了之后执行事件处理函数
   
```javascript
const debounce = ( fn, wait ) => {
  let timeoutID = null
  return function() {
    if ( timeoutID !== null ) {
      clearTimeout(timeoutID)
    }
    timeoutID = setTimeout(fn, wait, ...arguments)
  }
}
```

### 立即执行
上面的防抖函数，当事件触发是不会执行，只有当事件停止执行一段时间后才会再次执行。针对这一点，有了一种立即执行的防抖函数 ，**当事件触发时，立即执行一次处理函数，如果后续在一定时间内持续触发事件，则不再执行，当设定时间结束后再次触发，则立即执行**

封装一个立即执行的防抖方法：
1. 入参包括待执行的方法`fn`, 单位时间`wait`，返回一个被执行的方法
2. 定义变量 `timeoutID`，存储定时器的编号，初始值为null
3. 定义一个变量`isExecute`, 表示是否立即执行，当timeoutID为空的时候，立即执行
4. 如果isExecute为true，立即执行函数
5. 判断timeoutID是否为空，如果不为空，说明当前有定时器正在执行，则清空定时器，重新计时
6. 设置定时器，当时间到了以后清空 tiemoutID，以使下次事件中可以执行处理函数


```javascript
const debounce = (fn, wait) => {
  let timeoutID = null
  return function() {
    const _this = this
    const arg = arguments
    let isExecute = !timeoutID
    if ( isExecute ) {
      fn.apply(_this, arg)
    }
    if ( timeoutID ) {
      clearTimeout(timeoutID)
    }
    timeoutID = setTimeout(() => {
      timeoutID = null
    }, wait)
  }
}

```

### 最终版———二者结合

防抖函数的立即执行和非立即执行适用于不同的场景，我们可以对其进行一个结合

通过在入参中加入变量`immediate`，控制此次是否立即执行

```javascript
const debounce = (fn, wait, immediate) => {
  let timeoutID = null

  return function () {
    const _this = this
    const arg = arguments

    if (timeoutID) {
      clearTimeout(timeoutID)
    }

    if (immediate) {
      let isExecute = !timeoutID
      if (isExecute) {
        fn.apply(_this, arg)
      }
      timeoutID = setTimeout(() => {
        timeoutID = null
      }, wait)
    } else {
      timeoutID = setTimeout(fn, wait, ...arg)
    }
  }
}
```

# 节流


老实讲，节流和防抖的概念很相似，不是特别容易区分。

**节流是指在连续触发事件时，函数在 N 秒内只执行一次**， 其与防抖最大的区别就是，在一段事件的连续触发时间内，节流会执行多次，而防抖则只会执行一次。

和防抖类似，节流也分为立即执行版和非立即执行版，

两个版本的实现方式不同，立即执行版是利用时间戳实现，非立即执行版利用定时器来实现


### 立即执行版（时间戳版）

1. 入参包括待执行的方法`fn`, 单位时间`delay`，返回一个被执行的方法
2. 定义变量 `timeoutID`，存储上次执行方法时的时间，初始值为0
3. 在返回的方法中，定义变量`now`， 存储当前时间
4. 如果时间差大于指定值，则执行方法，并更新 `lastTime` 

```javascript
const throttle = ( fn, delay ) => {
  let lastTime = 0
  return function() {
    let _this = this
    let arg = arguments

    const now = Date.now()

    if ( now - lastTime > delay ) {
      fn.apply(_this, arg)
      lastTime = now
    }
  }
}

```


### 非立即执行版（定时器版）

1. 入参包括待执行的方法`fn`, 单位时间`delay`，返回一个被执行的方法
2. 定义变量 `timeoutID`，存储定时器的编号，初始值为null
3. 在返回的方法中，判断定时器是否存在，如果存在，忽略，不做处理
4. 如果不存在，设置一个定时器，并在指定时间后执行方法，然后清空 `timeoutID`

```javascript
const throttle = ( fn, delay ) => {
  let timeoutID = null
  return function() {
    let _this = this
    let arg = arguments

    if (!timeoutID ){
      timeoutID = setTimeout(() => {
        fn.apply(_this, arg)
        timeoutID = null
      }, delay)
    } 
  }
}

```


### 综合版

同样的，通过在入参中加入变量`immediate`，控制此次是否立即执行

```javascript 
const throttle = ( fn, delay, immediate ) => {
  let timeoutID = null
  let lastTime = 0
  return function() {
    const _this = this
    const arg = arguments

    if ( immediate ) {
      const now = Date.now()
      if ( now - lastTime > delay ) {
        fn.apply(_this, arg)
        lastTime = now
      }
    } else {
      if (!timeoutID ){
        timeoutID = setTimeout(() => {
          fn.apply(_this, arg)
          timeoutID = null
        }, delay)
      } 
    }
  }
}

```


























