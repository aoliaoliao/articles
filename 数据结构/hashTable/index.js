import LinkedList from '../linkedList/index.js'

// 哈希表的大小直接影响冲突的数量
// 哈希表越大，冲突就越少
const defaultHashTableSize = 32


export default class HashTable {

  /**
   * 
   * @param {number} hashTableSize 哈希表的大小
   */
  constructor(hashTableSize = defaultHashTableSize) {
    // 链接法 处理冲突
    this.buckets = Array(hashTableSize).fill(null).map(() => new LinkedList());
    this.keys = {};
  }

  /**
   * Hash Function 将key转换为hashTable中的索引
   * @param {string} key 
   */
  hash(key) {
    // Hash Function 是整个哈希表中最重要的一个环节，
    // 哈希方法的优劣直接决定了生成冲突的数量

    // 这里为了简单的演示，只使用字符代码和键的所有字符来计算散列。
    // hash 的计算规则：hash = charCodeAt(0) * PRIME^(n-1) + charCodeAt(1) * PRIME^(n-2) + ... + charCodeAt(n-1)
    // PRIME 是任意的素数

    const hash = Array.from(key).reduce((total, char) => {
      return total + char.charCodeAt()
    }, 0)
    return hash % this.buckets.length
  }

  /**
   * hash表中添加数据
   * @param {string} key 
   * @param {*} value 
   */
  set(key, value) { 
    const res = this.find(key)

    if (!res.node) {
      this.keys[key] = res.keyHash
      // 新增的情况
      res.bucketLinkedList.append({key, value})
    } else {
      // 更新的情况
      res.node.value.value = value
    }

  }

  /**
   * 获取对应的值
   * @param {string} key 
   */
  get(key) { 
    const res = this.find(key)

    return res.node ? res.node.value.value : undefined
  }

  /**
   * 删除对应的值
   * @param {string} key 
   */
  delete(key) { 
    const res = this.find(key)

    if (res.node) {
      delete this.keys[res.key]
      return res.bucketLinkedList.delete(node.value)
    } else {
      return null
    }

  }
  
  /**
   * key 是否存在
   * @param {string} key 
   */
  has(key) {
    return Object.hasOwnProperty.call(this.keys, key);
  }

  /**
   * 获取所有存储的值
   */
  getValues() {
    return this.buckets.reduce((values, bucket) => {
      const bucketValues = bucket.toArray()
        .map((linkedListNode) => linkedListNode.value.value);
      return values.concat(bucketValues);
    }, []);
  }

  // 查找key对应的链表节点
  find(key) {
    const keyHash = this.hash(key)
    const bucketLinkedList = this.buckets[keyHash]

    // bucket 中是否有key值相同的数据
    const node = bucketLinkedList.find({ callback: (nodeValue) => nodeValue.key === key });
    return {
      node,
      keyHash,
      bucketLinkedList
    }
  }

}
























