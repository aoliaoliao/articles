据说是面试常考的手写题。

在对一个数据进行深拷贝之前，有几点必须加以说明，一般来讲，我们对一个对象进行深拷贝的主要目的是用来支持数据的持久化，在JS中实现一个包含各种类型（函数，正则，dom节点等等）的对象的深拷贝是一件极其费力的事情， 或者说在一个小小的`clone`方法中对JS中所有的数据对象进行深拷贝是一件几乎不能完成的事情。所以我们**必须先声明一个这个clone方法的功能范围**。现在社区最常用的`lodash`库， 也是在明确了一个精确的定义语义之后才封装实现了`cloneDeep`方法， 这个方法对dom节点，函数的拷贝其实是舍弃的。

在日常的业务开发中，我们的对象一般都是一些可以被序列化和反序列化的数据，所以，借助于`JSON.stringify()`和`JSON.parse()`可以实现大部分的需求。至于手写深拷贝方法，我想大部分默认的都是`cloneDeep`实现的功能了。但我这篇不想写成lodash的源码评论鉴赏，网上已经有很多精彩的文章了，比如[Lodash是如何实现深拷贝的
](https://github.com/yygmind/blog/issues/31), 源码入口可以点[这里](https://github.com/lodash/lodash/blob/master/cloneDeep.js)


本文主要是想写一个简易粗糙的深拷贝方法，会实现这些功能，**循环引用的处理**，**对象原型链的维护**， **Symbol键值的拷贝**，**Date, Set, Map，Buffer 等类型的处理**， [最终成型的代码在这里](./index.js)


JS中的值类型：
- Number
- String
- Boolean
- Symbol
- Undefined
- Null

常见的引用类型：
- Object
  - Array
  - Object
  - Function
  - Date
  - RegExp

## 常规对象，数组的全属性拷贝

深拷贝的主要问题是对于各种各样的数据类型的处理。要先判断值属于什么类型，对于值类型，就直接复制就好

```javascript
/**
 * 检查是否是值类型
 * @param {Object} value 
 */
function checkValueType(value) {
  // JS中的值类型：
  const valueTypes = ['Number', 'String', 'Boolean', 'Symbol', 'Undefined', 'Null']
  const type = getValueType(value)
  return valueTypes.includes(type)
}

/**
 * 获取参数的数据格式类型
 * @param {*} value 
 */
function getValueType(value) {
  const type = Object.prototype.toString.call(value).slice('object'.length + 2, -1)
  return type
}

```


要想获取一个对象一共有多少属性，还有一个需要注意的点，这个点就是针对属性键是Symbol类型的，因为常规的针对对象的遍历会忽略Symbol类型。我们新建一个方法，获取对象自身的所有属性值
```javascript
function getSymbolKeys(value) { 
  if (value == null) {
    return []
  }
  value = Object(value)
  const syms = Object.getOwnPropertySymbols(value) || []
  return syms.filter((symbol) => Object.prototype.propertyIsEnumerable.call(value, symbol)) 
}


function getAllKeys(value) {
  let result = []
  result = Object.keys(value)
  result.push(...getSymbolKeys(value))
  return result
}

```

准备了一些必要的方法，可以先针对普通的数组和对象进行一些深拷贝。

```javascript 

function deepClone(source) {
  let target = undefined

  if (checkValueType(source)) {
    return source
  } 

  // 对要拷贝的类型进行初始化
  if (Array.isArray(source)) {
    target = new source.constructor(source.length)
  } else {
    target = {}
  } 

  if (Array.isArray(source)) {
    source.forEach((value, i) => {
      target[i] = deepClone(value)
    })
  } else {
    const keys = getAllKeys(source)
    keys.forEach(key => {
      const value = source[key]
      target[key] = deepClone( value )
    }) 
  } 

  return target
} 

```


### 处理循环引用

上述深拷贝方法主要是采用递归方法，将对象的属性值一层层的拷贝下去，但这里也有个问题很明显，如果一个对象中的某个属性值等于了自身，那么这里将陷入死循环。所以我们必须再引入一种合理的退出机制，也就是对循环引用的处理。

在lodash中采用自己设计的`Stack`存储已经克隆过的值，然后在下次拷贝的时候检查是否已经克隆过，如果是直接返回

```javascript 

const stack = new Map()

function deepClone(source) {
  // ...

  // 对要拷贝的类型进行初始化
  if (Array.isArray(source)) {
    target = new source.constructor(source.length)
  } else {
    target = {}
  } 

  // 检查 source 是否已经克隆过
  const stacked = stack.get(source)
  if (stacked) {
    return stacked
  }
  stack.set(source, target)

  // ...
} 


```

### 对象原型链的维护

以上述方法克隆出来的person属性为例，检查对象属性的原型链是否有被维护：

```javascript
targetObject.person.__proto__ === sourceObject.person.__proto__ // false
```

其实看代码也很明显，如果要复制的值是对象则直接以一个字面量对象赋了初值，那么原始值的原型链自然被舍弃了。为了解决这个问题，我们赋初始值的时候需要换一个方法：

```javascript

// 对要拷贝的类型进行初始化
if (Array.isArray(source)) {
  target = new source.constructor(source.length)
} else {
  // target = {}
  target = Object.create(Object.getPrototypeOf(source)) // 使用source的原型新建一个对象
} 

// 用上述对象验证
targetObject.person.__proto__ === sourceObject.person.__proto__ // true

```

### Function, Date, RegExp, Set, Map 等等类型的复制

上述方法只是简单的处理了数组Array和对象Object等类型，但对于其他的内置对象是不能正确进行拷贝的，比如 Function, Date, RegExp 等等这些对象只能获取到一个具有同样原型链的空对象，并不能获取到正确的值。

对于这些内置对象的复制也要具体内容具体分析，所以封装一个方法，专门做这些事情：

```javascript
// 对各种对象进行初始化
function initCloneByTag(value) {
  const tag = getValueType(value)
  const Ctor = value.constructor

  switch (tag) {
    case 'Function':
      return value  // function 不进行拷贝操作
    case 'Date': 
      return new Ctor(+value)
    case 'Set': case 'Map':
      return new Ctor
    case 'RegExp':
      const result = new Ctor(value.source, /\w*$/.exec(value))
      result.lastIndex = value.lastIndex
      return result
    default:
      return Object.create(Object.getPrototypeOf(value))
  }
}

// 对要拷贝的类型进行初始化
if (Array.isArray(source)) {
  target = new source.constructor(source.length)
} else {
  // target = {}
  // target = Object.create(Object.getPrototypeOf(source)) // 使用source的原型新建一个对象
  target = initCloneByTag()
} 

// 在 deepClone 中增加对 set 和 map 的遍历处理
function deepClone(source) {
  // ...
  if (tag === 'Set') {
    source.forEach((subValue) => {
      target.add(deepClone(subValue))
    }) 
  } else if (tag === 'Map') {
    source.forEach(function(subValue, key) {
      target.set(key, deepClone(subValue));
    })
  }

  // ...
}


```
 
### 对二进制数据的拷贝

在JS中使用`ArrayBuffer`对象来表示通用的，固定长度的原始二进制数据缓存区。对于一个`ArrayBuffer`对象，我们不能直接对其进行操作，JS中提供了一个`DataView`对象和N个`TypedArray`对象来操作二进制数据， 也就是说 DataView 和 TypedArray 对象都是建立在 ArrayBuffer 其上的视图实例。所以，如果我们想要深拷贝一份 DataView 或 TypedArray 数据，我们要先对其对应的 ArrayBuffer 进行一次深拷贝。

```javascript

// Creates a clone of `arrayBuffer`.
function cloneArrayBuffer(arrayBuffer) {
  // 根据 ArrayBuffer 构造函数新建一个空的内存缓存区
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  // 为内存缓存区赋值
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  // 返回内存缓存区
  return result;
}

function cloneTypedArray(typedArray) {
  // 克隆 类型化数组 的内存缓存区
  var buffer = cloneArrayBuffer(typedArray.buffer)
  // 将内存缓存区设置为对应的类型化数组对象并返回
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

function cloneDataView(dataView) {
  var buffer = cloneArrayBuffer(dataView.buffer);
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
} 

```

在`initCloneByTag`方法中增加对这几种类型的拷贝

```javascript
function initCloneByTag(value) {
  // ...
  switch (tag) {
    // ...
    case 'ArrayBuffer':
      return cloneArrayBuffer(value);
    case 'DataView':
      return cloneDataView(value);
    case 'Float32Array': case 'Float64Array':
    case 'Int8Array': case 'Int16Array': case 'Int32Array':
    case 'Uint8Array': case 'Uint8ClampedArray': case 'Uint16Array': case 'Uint32Array':
      return cloneTypedArray(value);   
    // ...
  }
}
```

## 验证


用一个普通对象验证一下：

```javascript
class Person {
  constructor() {
    this.name = 'Join'
    this.age = 28
    this.like = [12, 34, 56]
  }
}

const person = new Person()
const symKey = Symbol('key')

var sourceObject = {
  num: 1,
  str: '1',
  nu: null,
  un: undefined,
  bool: false,
  sym: Symbol(1),
  [symKey]: 'key',
  obj: { num: 1 },
  arr: [1, person],
  person: person,
  date: new Date(),
  fun: function () { },
  set: new Set([1, person]),
  map: new Map([[1, person], [person, 2]]),
  buff: new Int16Array(2).fill(512)
}

const targetObject = deepClone(sourceObject)

targetObject.num === sourceObject.num // true
targetObject.fun === sourceObject.fun // true
+targetObject.date === +sourceObject.date // true

targetObject.date === sourceObject.date // false
targetObject.obj === sourceObject.obj // false
targetObject.arr === sourceObject.arr // false
targetObject.arr[1] === sourceObject.arr[1] // false


```


 