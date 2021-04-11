[链表](https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/linked-list/README.zh-CN.md)


上述连接包含了对链表的借本介绍和常规操作的伪代码，本篇文章的主要目的是用js对各种操作实现一遍，并记录其中一些问题。


### 观察链表在JS中的对象结构
实现的第一个链表操作是 `add` 方法，具体的实现操作参见[这里](./index.js)。

当add 方法实现之后，我们尝试实现一个有数据的链表

```javascript
const linkedList = new LinkedList()

linkedList.add(1)
linkedList.add(2)
linkedList.add(3)

```
这系列操作下来，我们观察链表在js的世界里实际上是一个多层嵌套的对象：

```javascript

linkedList = {
  head:{
    value: 1, 
    next: {
      value: 2, 
      next: {
        value: 3, 
        next: null
      }
    }
  },
  tail: {
    value: 3, 
    next: null
  }
}
```
嵌套的数据结构看起来不是很美观，但这是因为JS中没有**指针**的概念。在C语言中，节点的next可以只存储下一个节点的指针，这样链表的数据结构就是线性的，而不是js中这种嵌套的了。

再往下探讨一下，js中的这个对象结构看起来是嵌套的，但实际上，再内存中他也是线性的。








