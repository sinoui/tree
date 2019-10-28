enum TreeModelEventType {
  /**
   * 新增节点
   */
  ADD_NODE = 'ADD_NODE',
  /**
   * 更新节点
   */
  UPDATE_NODE = 'UPDATE_NODE',
  /**
   * 删除节点
   */
  REMOVE_NODE = 'REMOVE_NODE',
  /**
   * 移动节点
   */
  MOVE_NODE = 'MOVE_NODE',
  /**
   * 展开节点
   */
  EXPAND_NODE = 'EXPAND_NODE',
  /**
   * 收缩节点
   */
  COLLAPSE_NODE = 'COLLAPSE_NODE',
  /**
   * 开始加载子节点
   */
  BEGIN_LOAD_NODE_CHILDREN = 'BEGIN_LOAD_NODE_CHILDREN',
  /**
   * 加载子节点成功
   */
  LOAD_NODE_CHILDREN_SUCCESS = 'LOAD_NODE_CHILDREN_SUCCESS',
  /**
   * 加载子节点失败
   */
  LOAD_NODE_CHILDREN_FAILURE = 'LOAD_NODE_CHILDREN_FAILURE',
}

export default TreeModelEventType;
