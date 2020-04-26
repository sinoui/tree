import type { TreeSelectStrategy, TreeNodeType } from '@sinoui/tree-models';

export default class SingleTreeSelectStrategy implements TreeSelectStrategy {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public selectedItems: string[] = [],
    public isAllowEmpty: boolean = false,
  ) {}

  public toggle(treeNode: TreeNodeType) {
    if (!treeNode || treeNode.disabled || treeNode.selectable === false) {
      return;
    }
    if (this.selectedItems[0] === treeNode.id) {
      if (this.isAllowEmpty) {
        this.selectedItems = [];
      }
      return;
    }
    this.selectedItems = [treeNode.id];
  }

  public isSelected(treeNode: TreeNodeType) {
    return this.selectedItems && this.selectedItems.indexOf(treeNode.id) !== -1;
  }

  // eslint-disable-next-line class-methods-use-this
  public isPartialSelected() {
    return false;
  }
}
