import LinkedList from "../linkedList"



export default class Stack {
  linkedList = null

  constructor() {
    this.linkedList = new LinkedList()
  }

  
  push(value) {
    this.linkedList.prepend(value)
  }
  
  pop() {
    const removedHead = this.linkedList.deleteHead()
    return removedHead ? removedHead.value : null
  }

  peek() {
    if (!this.linkedList.head) {
      return null
    }
    return this.linkedList.head.value
  } 
}