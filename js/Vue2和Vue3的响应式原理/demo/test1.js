/**
 * Proxy 简单的get set
 */

const handler = {
  set: function (obj, prop, value) {
    console.log('set value by proxy')
    return Reflect.set(obj, prop, value)
  },
  get: function(obj, prop) {
      return prop in obj ? obj[prop] : 37;
  }
};

const target = {}
const p = new Proxy(target, handler);
p.a = 1;
p.b = undefined;

target.c  = 2

console.log('p normal value', p.a, p.b);      // 1, undefined
console.log('p special value', 'c' in p, p.c); // false, 37

console.log('target normal value', target.a, target.b);      // 1, undefined
console.log('target special value', 'c' in target, target.c); // false, 37



