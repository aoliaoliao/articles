const stack = new Map()

function deepClone(source) {
  let target = undefined 

  if (checkValueType(source)) {
    return source
  } 

  const tag = getValueType(source)

  if (tag === 'Array') {
    target = new source.constructor(source.length)
  } else {    
    // target = {}
    // target = Object.create(Object.getPrototypeOf(source))
    target = initCloneByTag(source)
  }

  // 循环引用的处理
  const stacked = stack.get(source)
  if (stacked) {
    return stacked
  }
  stack.set(source, target)
  
  // 赋值
  if (tag === 'Set') {
    source.forEach((subValue) => {
      target.add(deepClone(subValue))
    }) 
  } else if (tag === 'Map') {
    source.forEach(function(subValue, key) {
      target.set(key, deepClone(subValue));
    })
  } else if (tag === 'Array') {
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

/**
 * 检查是否是值类型
 * @param {Object} value 
 */
function checkValueType(value) {
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

/**
 * 获取传入对象的所有键
 * @param {Object} value 
 */
function getAllKeys(value) {
  let result = []
  result = Object.keys(value)
  result.push(...getSymbolKeys(value))
  return result
}

/**
 * 来源于lodash, 获取对象上所有的symbol键
 * @param {Object} value 
 */
function getSymbolKeys(value) { 
  if (value == null) {
    return []
  }
  value = Object(value)
  const syms = Object.getOwnPropertySymbols(value) || []
  return syms.filter((symbol) => Object.prototype.propertyIsEnumerable.call(value, symbol)) 
}


// 对各种对象进行初始化
function initCloneByTag(value) {
  const tag = getValueType(value)
  const Ctor = value.constructor

  switch (tag) {
    case 'Function':
      return value
    case 'Date': 
      return new Ctor(+value)
    case 'Set': case 'Map':
      return new Ctor
    case 'RegExp':
      const result = new Ctor(value.source, /\w*$/.exec(value))
      result.lastIndex = value.lastIndex
      return result
    case 'ArrayBuffer':
      return cloneArrayBuffer(value);
    case 'DataView':
      return cloneDataView(value);
    case 'Float32Array': case 'Float64Array':
    case 'Int8Array': case 'Int16Array': case 'Int32Array':
    case 'Uint8Array': case 'Uint8ClampedArray': case 'Uint16Array': case 'Uint32Array':
      return cloneTypedArray(value);
    default:
      return Object.create(Object.getPrototypeOf(value))
  }
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
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

sourceObject.data = sourceObject

const targetObject = deepClone(sourceObject)
 

console.log(targetObject)