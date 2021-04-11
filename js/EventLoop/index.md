[浅析setTimeout与Promise](https://juejin.im/post/5b7057b251882561381e69bf)


[JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)


这篇笔记主要记录的就是下面这段代码引发的问题：setTimeout 和 Promise 都是异步任务，但到底究竟是谁先执行呢？

这个问题在上面各个参考链接中已经得到解释了，我这里主要做一下记录，方便查阅。


### JS的运行机制：单线程和Event Loop

js是单线程的。线程内有一个**执行栈**，有一个**任务队列**。所有的同步任务都被压入栈内（先进后出），最后压入的同步任务被优先处理并出栈；所有的异步任务都被线程挂起，等到有了结果之后被压入任务队列（先进先出），被称为在队列中放入了一个**事件**，最先压入的事件被优先处理并弹出队列。

所以运行机制为：

1. 宿主环境为JavaScript创建线程时，会创建堆(heap)和栈(stack)，堆内存储JavaScript对象，栈内存储**执行上下文**；
2. 栈内执行上下文的同步任务按序执行，执行完即退栈，而当异步任务执行时，该异步任务进入等待状态（不入栈），同时通知线程：当触发该事件时（或该异步操作响应返回时），需向任务队列插入一个事件消息；
3. 当栈内同步任务执行完毕后，线程从任务队列取出一个事件消息，其对应异步任务（函数）入栈，执行回调函数，如果未绑定回调，这个消息会被丢弃，执行完任务后退栈；
4. 当线程空闲（即执行栈清空）时继续拉取任务队列下一轮消息（next tick，事件循环流转一次称为一次tick）。

关于第4步，主线程从"任务队列"中读取事件，这个过程是循环不断的，又称为Event Loop（事件循环）。

放两张阮一峰老师博客中的图

第一张：主线程和任务队列的示意图
![主线程和任务队列的示意图](./主线程和任务队列的示意图.jpg)

第二张：事件循环示意图
![事件循环示意图](./事件循环示意图.png) 

### Event Loop的详细划分：Macro Task 和 Micro Task

Event Loop 也即任务队列可以在分为两种
1. Macro Task 宏任务队列，主要包括 `setTimeout`, `setInterval`, `setImmediate`,`requestAnimationFrame`, `UI Rendeing`, `I/O`
2. Micro Task 微任务队列，主要包括`Promise`，`Object.observe`（MDN文档显示已废弃），`process.nextTick`(NodeJS中在下次事件循环之前执行)

加上这两个概念，再谈谈js运行机制的第三步：“ 当栈内同步任务执行完毕后，线程从任务队列取出一个事件，其对应异步任务（函数）入栈，执行回调函数”。

这里讲的不够完整，从任务队列取出一个事件是指从**Macro Task Queue**中取出一个事件，将该事件的回调函数压入执行栈；但在此之前会先读取 **Micro Task Queue**并读取该队列中的所有消息，将每个消息的回调函数依次压入执行栈。

之后才会结束这一次事件循环，并在执行栈被清空之后开始下一轮事件循环。

### 示例代码并说明其运行
```javascript
setTimeout(function() {
   console.log(1)
}, 0);

new Promise(function(resolve, reject) {
  console.log(2)
  resolve();
}).then(function() {
   console.log(3)
})

new Promise(function(resolve, reject) {
  console.log(4)
  resolve();
}).then(function() {
   console.log(5)
   setTimeout( function() { console.log(6)}, 0)
})

console.log(7);

// 2， 4， 7，3， 5， 1，6

```
沿着代码顺序从上往下说：
1. `setTimeout`是异步方法，所以其中的任务会被线程挂起。在‘0ms（实际是4ms）’之后，会将一个事件放到**Macro Task Queue**
2. 代码继续执行，第一个`new Promise`其属于“全局执行上下文”，所以讲全局上下文压入栈，然后将Promise构造函数中的方法所属的“执行上下文”压入栈顶，并开始`console.log(2)`和`resolve()`。`reslove`通知线程被挂起的异步任务已经有了结果，线程会在**Micro Task Queue**中放一个事件，对应着then方法中的回调。最后，执行完毕之后出栈。 这一步，输出2 
3. 第二个 `new Promise` 也同理，输出 4，但不同的一点是在`then`方法中的`setTimeout`会被挂起，并将一个消息放入**Macro Task Queue**，此时宏任务队列中有了两个事件。
4. console.log 属于全局执行上下文，将其压入栈顶，并在执行完毕之后弹出，输出7
5. 至此，同步任务执行完毕，线程开始读取任务队列中的事件。
6. 首先从**Micro Task Queue**中读取第一个Promise中then方法对应的回调，输出 3
7. 从**Micro Task Queue**中读取第二个Promise中then方法对应的回调，输出 5
8. 接着从**Macro Task Queue**读取setTimeout的方法，输出 1
9. 然后检查**Micro Task Queue**，发现在此期间并没有新的微任务进入队列，所以跳过并再次检查**Macro Task Queue**执行第二个消息对应的回调，输出6
10. 再次检查**Micro Task Queue**，发现其为空，跳到**Macro Task Queue**发现也为空，执行栈已全部清空，进入下一次tick



本文正文到此结束。
------------------------



在对上面的几个概念做个详细的记录：

**任务**：同步任务和异步任务，一般指函数或代码块，js代码执行就是在完成任务。

**执行栈(execution context stack)**：也可以叫执行上下文栈：JavaScript执行栈，顾名思义，是由执行上下文组成，当函数调用时，创建并插入一个执行上下文，通常称为执行栈帧（frame），存储着函数参数和局部变量，当该函数执行结束时，弹出该执行栈帧。


**执行上下文**：执行上下文这个概念牵涉到常说的`this`，`闭包`等概念，后面再写一篇详细记录下。JS有执行上下文，浏览器首次载入脚本，它将创建全局执行上下文，并压入执行栈栈顶（不可被弹出）；然后每进入其它**作用域**就创建对应的执行上下文并把它压入执行栈的顶部；一旦对应的上下文执行完毕，就从栈顶弹出，并将上下文控制权交给当前的栈。
这样依次执行（最终都会回到全局执行上下文）

当一个执行上下文被压入栈的时候，会被立即执行，在执行该上下文中的代码时，如果遇到另一个执行上下文，则也将其压入栈。有点递归的意思，一层层的进去，一层层的出来。

