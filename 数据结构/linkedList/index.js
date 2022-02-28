class LinkedNode {
  value = null
  next = null

  constructor(value) {
    this.value = value
  }

  next(next) {
    this.next = next
  }
}

export default class LinkedList {
  head = null
  tail = null

  // 尾部追加
  append(value) {
    const node = new LinkedNode(value)
    if (!this.head) {
      this.head = node
      this.tail = node
    } else {
      this.tail.next = node
      this.tail = node
    }
    return this
  }

  // 首部追加
  prepend(value) {
    const node = new LinkedNode(value)
    node.next = this.head
    this.head = node
    
    if (!this.tail) { 
      this.tail = node
    }
    return this
  }

  // 是否包含
  contains(head, value) {
    let node = head

    while (node && node.value !== value) {
      node = node.next
    }

    return !!node
  }

  // 删除
  remove(head, value) {
    if (!head) {
      return false
    }

    let node = head

    // 删除head时，更新链表的head
    if (node.value === value) {
      if (this.head === this.tail) {
        this.head = null
        this.tail = null
      } else {
        // 删除节点
        this.head = this.head.next
      }
      return true
    }

    // 遍历查找待删除值所属的节点
    while (node.next && node.next.value !== value) {
      node = node.next
    }

    // node.next 有值的话，表示 node.next 为待删除节点
    if (node.next) {
      // 如果待删除的节点node.next是尾部节点时，更新尾部节点
      if (node.next === this.tail) {
        this.tail = node
      }
      // 删除节点
      node.next = node.next.next
      return true
    }

    // 找不到数据时
    return false
  }

  deleteHead() {
    if (!this.head) {
      return null
    }
    let deleteNode = this.head

    if (this.head === this.tail) {
      this.head = null
      this.tail = null 
    } else {
      this.head = deleteNode.next
    }
    return deleteNode
  }

  // 遍历
  traverse(head) {
    let node = head

    while (node) {
      console.log(node.value)
      node = node.next
    }
  } 

  // 反向遍历
  reverseTraversal(head, tail) {
    if (!tail) return

    let curr = tail

    while (curr !== head) {
      let prev = head
      while (prev.next !== curr) {
        prev = prev.next
      }
      console.log(curr.value)
      curr = prev
    }

    console.log(curr.value)    
  }

  // 反转
  reverse() {
    let currNode = this.head
    let prevNode = null
    let nextNode = null

    while (currNode) {
      nextNode = currNode.next  // 记录初始链表的下一个节点

      currNode.next = prevNode  // 更新当前节点
      prevNode = currNode // 将更新后的当前节点作为新链表中的【下一节点】

      currNode = nextNode // 重新赋值当前节点，开始下一循环
    }

    this.tail = this.head
    this.head = prevNode

  }

  /**
   * 查找指定value的节点
   */
  find({ value = undefined, callback = undefined}) {
    if (!this.head) return null
    
    let currNode = this.head

    while (currNode) {
      if (callback && callback(currNode.value)) {
        return currNode
      }
      if ( value !== undefined && currNode.value === value) {
        return currNode
      }
      
      currNode = currNode.next
    }

    return null
  }


  toArray() {
    const nodes = [];

    let currentNode = this.head;
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }

    return nodes;
  }

}



