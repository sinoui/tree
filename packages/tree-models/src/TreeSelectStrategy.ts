import TreeNode from './TreeNodeType';

/**
 * 树选择策略接口
 *
 * @export
 * @interface TreeSelectStrategy
 */
export default interface TreeSelectStrategy {
  /**
   * 选中的节点
   *
   * @type {string[]}
   * @memberof TreeSelectStrategy
   */
  selectedItems: string[] | undefined;
  /**
   * 切换节点的选中状态
   *
   * @param {TreeNode} treeNode
   * @memberof TreeSelectStrategy
   */
  toggle(treeNode: TreeNode): void;
  /**
   * 节点是否被选中
   */
  isSelected(treeNode: TreeNode): boolean;

  /**
   * 节点是否被部分选中
   *
   * @param {TreeNode} treeNode
   * @memberof TreeSelectStrategy
   */
  isPartialSelected(treeNode: TreeNode): boolean;
}
