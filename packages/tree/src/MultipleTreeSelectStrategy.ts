import TreeModel from '@sinoui/tree-models';
import type { TreeNodeType } from '@sinoui/tree-models';

export default class MultipleTreeSelectStrategy {
  constructor(public selectedItems: string[] = [], treeModel: TreeModel) {
    const radioSelectedItem = selectedItems
      .map((nodeId) => treeModel.getNodeById(nodeId))
      .filter(Boolean)
      .find((node) => node.selectType === 'radio');
    if (radioSelectedItem) {
      this.radioSelectedItem = radioSelectedItem.id;
    }
  }

  public radioSelectedItem = '';

  private toggleItemFromItems(nodeId: string) {
    const idx = this.selectedItems.indexOf(nodeId);
    if (idx === -1) {
      this.selectedItems = [...this.selectedItems, nodeId];
    } else {
      this.selectedItems = [
        ...this.selectedItems.slice(0, idx),
        ...this.selectedItems.slice(idx + 1),
      ];
    }
  }

  public toggle(node: TreeNodeType) {
    if (!node || node.selectable === false || node.disabled) {
      return;
    }

    if (node.selectType === 'radio') {
      if (this.radioSelectedItem) {
        this.toggleItemFromItems(this.radioSelectedItem);
      }
      this.radioSelectedItem = node.id;
      this.toggleItemFromItems(this.radioSelectedItem);
    } else {
      this.toggleItemFromItems(node.id);
    }
  }

  public isSelected(treeNode: TreeNodeType) {
    return this.selectedItems && this.selectedItems.indexOf(treeNode.id) !== -1;
  }

  // eslint-disable-next-line class-methods-use-this
  public isPartialSelected() {
    return false;
  }
}
