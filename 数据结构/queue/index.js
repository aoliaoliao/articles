import LinkedList from '../linkedList/index.js'

export default  class Queue {
  linkedList = null

  constructor() {
    this.linkedList = new LinkedList()
  }

  // 入栈
  enqueue(value) {
    this.linkedList.append(value)
  }

  // 出栈
  dequeue() {
    const removedHead = this.linkedList.deleteHead()

    return removedHead ? removedHead.value : null    
  }

  // 读取第一个元素
  peek() {
    if (!this.linkedList.head) {
      return null
    }

    return this.linkedList.head.value
  } 

}

const queue = new Queue()


queue.enqueue(1)
queue.enqueue(2)
queue.enqueue(3)
queue.enqueue(4)

console.log(queue.peek())
console.log(queue.peek())

queue.dequeue()
queue.dequeue()


console.log(queue.peek())
console.log(queue.peek())



