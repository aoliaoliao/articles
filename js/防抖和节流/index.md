https://juejin.im/entry/5b1d2d54f265da6e2545bfa4

在web的世界里，有些事件会在一次连贯的操作中被短时间内的触发多次，比如，keydown, resize, input, scroll，drag 等；有些场景下，用户出于各种原因或频繁的触发同一个方法，比如多次点击统一按钮，这些场景中的触发频率一般不受开发人员控制，但通过适当的减少这些事件对应方法的执行频率，可以降低一些不必要的消耗，提高系统的性能。

防抖和节流，这两个概念就是为了这种场景而提出来的。

# 防抖

顾名思义，当我们本意只是想点击一下按钮，但不小心手抖或鼠标出问题，连续点击了多次，这个时候只执行最后一次触发的方法。

稍微概念性的说法是： **当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次，如果设定的时间到来之前，又一次触发了事件，就重新开始延时。**

想要实现一个防抖方法，很自然想到要用`setTimeout`

封装一个防抖方法，
1. 入参包括待执行的方法`fn`, 单位时间`wait`
2. 定义变量 `timeoutID`，存储定时器的编号，初始值为null
3. 如果 timeoutID 不等于 null，表明在单位时间内再次触发了事件，那么清空此次计时，重新开始计时。
   
```javascript
const debounce = ( fn, wait ) => {
  let timeoutID = null
  return function() {
    if ( timeoutID !== null ) {
      clearTimeout(timeoutID)
    }
    timeoutID = setTimeout(fn, wait, ...argument)
  }
}
```











































