import LinkedList from '../index.js'

const linkedList = new LinkedList()

linkedList.append(1)
linkedList.append(2)
linkedList.append(3)
linkedList.prepend(0.5)
linkedList.prepend(0)

// linkedList.reverseTraversal(linkedList.head, linkedList.tail)
linkedList.reverse()
console.log('========================================')
linkedList.traverse(linkedList.head)

console.log('contains', linkedList.contains(linkedList.head, 1))
console.log('contains', linkedList.contains(linkedList.head, '1'))

console.log('remove 0', linkedList.remove(linkedList.head, 0))
console.log('remove 1', linkedList.remove(linkedList.head, 1))
console.log('remove 1', linkedList.remove(linkedList.head, 1))
console.log('remove 3', linkedList.remove(linkedList.head, 3))

linkedList.traverse(linkedList.head)