class DoublyLinkedNode {
  previous = null
  next = null
  value = null

  constructor(value) {
    this.value = value
  }
}


export default class DoublyLinkedList {
  head = null
  tail = null

  // 首部增加节点
  prepend(value) {
    const node = new DoublyLinkedNode(value)

    if (this.head) {
      this.head.previous = node
    }
    this.head = node

    if (!this.tail) {
      this.tail = node
    }
    return this
  }

  // 尾部增加节点
  append(value) {
    const node = new DoublyLinkedNode(value)

    if (!this.head) {
      this.head = node
      this.tail = node
    } else {
      node.previous = this.tail
      this.tail.next = node
      this.tail = node
    }
  } 

  // 删除节点
  remove(value) {
    if (!this.head) return null

    let currNode = this.head
    let deleteNode = null

    while (currNode) {
      if (currNode.value === value) {
        deleteNode = currNode
        //  双向链表只有一个节点
        if (this.head === this.tail) {
          this.head = null
          this.tail = null
        } else if (deleteNode === this.head) {
          this.head = deleteNode.next
        } else if (deleteNode === this.tail) {
          this.tail = deleteNode.previous
        } else {
          deleteNode.previous.next = deleteNode.next
          deleteNode.next.previous = deleteNode.previous
        }

        if (this.head) {
          this.head.previous = null
        }

        if (this.tail) {
          this.tail.next = null
        } 
      }
      currNode = currNode.next
    }

    return deleteNode

  }

  // 查找节点
  find(value, callback) {
    if (!this.head) return null
    
    let currentNode = this.head

    while (currentNode) {
      if (callback && callback(currentNode.value)) {
        return currentNode
      }
      if (value !== undefined && currentNode.value === value) {
        return currentNode
      }

      currentNode = currentNode.next
    }

    return null
    
  }

  // 双向链表反转
  reverse() {
    let currNode = this.head
    let prevNode = null
    let nextNode = null

    while (currNode) {
      prevNode = currNode.previous
      nextNode = currNode.next

      currNode.previous = nextNode
      currNode.next = prevNode

      prevNode = currNode
      currNode = nextNode
    }

    this.tail = this.head
    this.head = prevNode

    return this
  }

  // 反向遍历
  reverseTraversal() {

  }

  toArray() {
    const nodes = [];

    let currentNode = this.head;
    while (currentNode) {
      nodes.push(currentNode.value);
      currentNode = currentNode.next;
    }

    return nodes;
  }
}

const doublyLinkedList = new DoublyLinkedList()

doublyLinkedList.append(1)
doublyLinkedList.append(2)
doublyLinkedList.append(3)
doublyLinkedList.append(3)
doublyLinkedList.append(3.1)
doublyLinkedList.append(3.2)
doublyLinkedList.append(4)

doublyLinkedList.remove(1)
doublyLinkedList.remove(3)
doublyLinkedList.remove(4)


console.log(doublyLinkedList.toArray())
