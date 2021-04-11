import HashTable from '../index.js'

const hashTable = new HashTable()


hashTable.set('a', 1)
hashTable.set('b', 2)
hashTable.set('ab', 12)
hashTable.set('ab', 12.1)
hashTable.set('ba', 21)


console.log(hashTable.getValues())