var _ = require('lodash');

var source = {
  fun: function() {
    console.log(1)
  },
  date: new Date()
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
  fun: function () { },
  set: new Set([1,3]),
  buff: new Int16Array(2).fill(512)
}
// sourceObject.data = sourceObject
sourceObject.arr.push(sourceObject)

const target = _.cloneDeep(sourceObject)

console.log(target)
