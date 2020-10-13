/**
 * vue3 的发布订阅demo
 */

// Deps 消息订阅中心
let targetMap = new WeakMap()
const activeReactiveEffectStack = []

// 创建 Observer
function reactive(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      track(target, prop)
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver)
      trigger( target, prop )
      return result
    }
  })
} 

/**
 * 订阅者执行订阅，信息将被存储在消息中心
 */
function track(target, key) {

  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]

  if (effect) {
    let depsMap = targetMap.get(target) 
    if (!depsMap) {
      targetMap.set( target, depsMap = new Map() )
    }
    let dep = depsMap.get(key)
    if (dep === void 0) {
      depsMap.set(key, (dep = new Set()))
    }

    if (!dep.has(effect)) {
      dep.add(effect)
    } 
  }
 
  
}


// 触发
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (depsMap) {
    const deps = depsMap.get(key)
    if (deps) { 
      deps.forEach( effect => effect() )
    }
    
  }
} 

function wrapper(fn) {
  const effect = function reactiveEffect(...args) {
    // effect 是每个订阅者的update方法
    activeReactiveEffectStack.push(effect) 
    fn(...args)
    activeReactiveEffectStack.pop()
  }
  effect()
  return effect
}
 

let dummy
const counter = reactive({ num: 5 }) 

function update(v) {
  dummy = counter.num + v
}

wrapper(update.bind(this, 3))


console.log('dummy1', dummy)

console.log('counter', counter.num)
counter.num = 7
console.log('dummy2', dummy)

console.log('counter', counter.num)


