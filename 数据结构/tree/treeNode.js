
export default class BinaryTreeNode {
  left = null
  right = null
  parent = null
  value = null

  constructor(value = null) {
    this.value = value

  }

  /**
   * 左节点的深度
   */
  get leftHeight() {

  }

  /**
   * 右节点深度
   */
  get rightHeight() {

  }

  /**
   * 最大的深度
   */
  get height() {

  }

  /**
   * 平衡因子
   */
  get balanceFactor() {

  }

  /**
   * 父节点的下一个兄弟节点
   */
  get uncle() {

  }

  /**
   * 更新节点的value值
   * @param {*} value 
   */
  setValue(value) {
    this.value = value

    return this
  }

  /**
   * 更新节点的左节点
   * @param {BinaryTreeNode} node 
   */
  setLeft(node) {
    // 重置子节点的父节点
    if (this.left) {
      this.left.node = node
    }

    this.left = node

    if (this.left) {
      this.left.parent = this
    }

    return this
  }

  /**
   * 更新节点的右节点
   * @param {BinaryTreeNode} node 
   */
  setRight(node) {
    if (this.right) {
      this.right.parent = null
    }

    this.right = node

    if (this.right) {
      this.right.parent = this
    }

    return this
  }

  /**
   * 移除节点的子节点
   * @param {BinaryTreeNode} node 
   */
  removeChild(node) {
    if (this.left && this.left.value === node.value) {
      this.left = null
      return true
    }

    if (this.right && this.right.value === node.value) {
      this.right = null
      return true
    }
    
    return false
  }


  /**
   * 替换节点的子节点
   * @param {BinaryTreeNode} nodeToReplace 
   * @param {BinaryTreeNode} replacementNode 
   */
  replaceChild(nodeToReplace, replacementNode) {
    if (!nodeToReplace || !replacementNode) {
      return false
    }

    if (this.left && this.left.value === nodeToReplace.value) {
      this.left = replacementNode
      return true
    }

    if (this.right && this.right.value === nodeToReplace.value) {
      this.right = replacementNode
      return true
    }

    return false
  }

  /**
   * 从根节点开始遍历子节点
   */
  traverseInOrder() {
    let traverse = []

    if (this.left) {
      traverse = traverse.concat(this.left.traverseInOrder())
    }

    traverse.push(this.value)

    if (this.right) {
      traverse = traverse.concat(this.right.traverseInOrder())
    }

    return traverse
    
  }

  toString() {

  } 





}









































