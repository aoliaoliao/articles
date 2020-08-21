`this`的值到底是什么，是JS中经常被讨论和考查的一个点。

# this值的简单总结
我们都知道，JavaScript 函数中的 this 指向并不是在函数定义的时候确定的，而是在调用的时候确定的。换句话说，函数的调用方式决定了 this 指向。如果我们简单一点来讲的话，可以总结为以下几点：
```javascript
var obj = {
  a: 1, 
  b: function(){
      console.log(this);
    }
}
```
1. 作为对象调用时，指向该对象 obj.b(); // 指向obj
2. 作为函数调用, var b = obj.b; b(); // 指向全局window
3. 作为构造函数调用 var b = new Fun(); // this指向当前实例对象
4. 作为call与apply调用 obj.b.apply(object, []); // this指向当前的object



# this值的本质
上一节讲述的是this特性的外在表现，而并没有说明为什么会是这样。为了从根本上理解this值的指向，我们要引入一个JS的内部类型——引用类型（Reference type）

### 引用类型 Reference type
Reference type 并不能让我们在编码的时候直接引用，它是存在JS语法规范层面的一个概念，其目的是为了更好的描述语言的底层行为逻辑。但我们为了方便理解和说明，可以将其理解为一个对象，该对象有两个属性：`base` 和 `propertypName`,用伪代码表示如下：

```javascript
var valueOfReferenceType =  {
  base: <base object>, // 属性所在的对象或当前的上下文环境，
  propertyName: <propertyp name> // 属性的名称
} 

valueOfReferenceType.property.GetBase = Function // 返回base的值
valueOfReferenceType.property.IsPropertyReference = Function // 判断base是否为reference类型
valueOfReferenceType.property.GetValue = Function // 返回对象属性真正的值。

``` 

举个例子说明一下：
```javascript 
var foo = {  
  fun() {
    return this
  }
}
function bar() {
  return this
}

foo.fun() // foo
bar() // window

```

对应的`valueOfReferenceType`的值是：

```javascript
fooOfReferenceType = {
  base: window,
  propertyName: 'foo'
}
fooOfReferenceType.GetValue() // foo

funOfReferenceType = {
  base: foo,
  propertyName: 'fun'
}
funOfReferenceType.GetValue() // foo.fun

barReferenceType = {
  base: window,
  propertyName: 'bar'
}
barReferenceType.GetValue() // bar
```

### 引用类型如何确定this
1. 先引入一个变量`ref`, 其值等于`调用括号()`的左边部分，比如上例中的`fun`,`bar`;
2. 根据`ref`的不同类型进行判断：
    - 如果 ref 是 Reference，并且 IsPropertyReference(ref) 是 true, 那么 this 的值为 GetBase(ref)
    - 如果 ref 是 Reference，并且 base value 值是 Environment Record, 那么this的值为 ImplicitThisValue(ref)
    - 如果 ref 不是 Reference，那么 this 的值为 undefined

> ImplicitThisValue(ref) 的值永远是undefineds

> this 为 undefined，非严格模式下，this 的值为 undefined 的时候，其值会被隐式转换为全局对象

那么现在的问题是，该如何判断一个`ref`是不是`引用类型Reference`呢？

总结来说：当`ref`是一个**标识符**或**属性访问器**的时候，`ref`就是一个引用类型； 当`ref`部分中有赋值运算、位运算或组运算等会调用到`GetValue`的操作时，`ref`将等于一个具体的值，而不再是引用类型。

> 标识符是变量名，函数名，函数参数名和全局对象中未识别的属性名

再用上面的例子做个说明

```javascript
var foo = {  
  fun() {
    return this
  }
}
function bar() {
  return this
}

foo.fun() // `fun` 是一个属性访问器，所以`ref`是引用类型，那么对应 fun 的GetBase是 foo, 所以 this的值是 foo

bar() // `bar`是一个标识符，所以`ref`是引用类型，对应 bar 的GetBase是 Environment Record, 所以 this的值是 window

// 以下三例均有`GetValue`参与，所以`ref`都不是引用类型
(foo.bar = foo.bar)(); // window
(false || foo.bar)(); // window
(foo.bar, foo.bar)(); // window

```



# 参考文章
https://github.com/mqyqingfeng/Blog/issues/7

https://www.cnblogs.com/TomXu/archive/2012/01/17/2310479.html 
















