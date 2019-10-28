import TreeModel, {
  TreeNode,
  TreeSelectStrategy,
  TreeModelEventType,
} from '@sinoui/tree-models';

enum COLOR {
  /**
   * 选中状态
   */
  RED = 1,
  /**
   * 部分选中状态
   */
  GREY = 2,
  /**
   * 未选中状态
   */
  WHITE = 3,
}

const TREE_MODE_NODE_CHANGE_EVENTS = [
  TreeModelEventType.ADD_NODE,
  TreeModelEventType.REMOVE_NODE,
  TreeModelEventType.MOVE_NODE,
  TreeModelEventType.LOAD_NODE_CHILDREN_SUCCESS,
];

/**
 *
 *
 * @export
 * @class CascadeTreeSelectStrategy
 * @implements {TreeSelectStrategy}
 */
export default class CascadeTreeSelectStrategy implements TreeSelectStrategy {
  /**
   * 存储各个节点的状态颜色
   *
   * @private
   * @type {{
   *     [nodeId: string]: COLOR;
   *   }}
   * @memberof CascadeTreeSelectStrategy
   */
  private colors: {
    [nodeId: string]: COLOR;
  };

  /**
   * 存储节点的虚实状态
   *
   * @private
   * @type {{
   *     [nodeId: string]: boolean;
   *   }}
   * @memberof CascadeTreeSelectStrategy
   */
  private virtualNodes: {
    [nodeId: string]: boolean;
  };

  constructor(
    public selectedItemsfromStrategy: string[] = [],
    private treeModel: TreeModel,
  ) {
    this.colors = {};
    this.virtualNodes = {};

    this.initColors();
    this.calcVirtualNodes();

    TREE_MODE_NODE_CHANGE_EVENTS.forEach((event) => {
      this.treeModel.on(event, () => {
        this.initColors();
        this.calcVirtualNodes();
      });
    });
  }

  public get selectedItems() {
    return this.selectedItemsfromStrategy;
  }

  public set selectedItems(selectedItems: string[]) {
    if (selectedItems !== this.selectedItemsfromStrategy) {
      this.selectedItemsfromStrategy = selectedItems;
      this.initColors();
    }
  }

  /**
   * 将包含不可用和不可选子节点的节点重置成虚节点
   *
   * @private
   * @memberof CascadeTreeSelectStrategy
   */
  private calcVirtualNodes() {
    (this.treeModel.rootNodes || []).forEach((rootNode) => {
      this.treeModel.traverseNodeChildrenByDeep(rootNode, (treeNode) => {
        if (
          treeNode.virtual ||
          treeNode.id.startsWith('VIRTUAL_LEADER_NODE') ||
          treeNode.disabled ||
          treeNode.selectable === false
        ) {
          this.virtualNodes[treeNode.id] = true;
        }

        const containsParent = treeNode.level > 0;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!containsParent || this.virtualNodes[treeNode.parent!.id]) {
          return;
        }

        const isParentVirtual =
          (this.virtualNodes[treeNode.id] &&
            !treeNode.id.startsWith('VIRTUAL_LEADER_NODE')) ||
          ((treeNode.disabled || treeNode.selectable === false) &&
            this.colors[treeNode.id] === COLOR.WHITE);

        if (isParentVirtual) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.virtualNodes[treeNode.parent!.id] = true;
        }
      });
    });
  }

  /**
   * 初始化节点颜色
   *
   * @memberof CascadeTreeSelectStrategy
   */
  private initColors() {
    this.colors = {};
    this.treeModel.nodes.forEach((node) => {
      this.colors[node.id] = COLOR.WHITE;
    });
    const selectedItems = this.selectedItemsfromStrategy;
    selectedItems.forEach((nodeId) => {
      this.colorNode(nodeId, COLOR.RED, true);
    });

    if (selectedItems.length > 0) {
      (this.treeModel.rootNodes || []).forEach((node) => {
        this.treeModel.traverseNodeChildrenByDeep(node, (child) => {
          if (this.colors[child.id] === COLOR.WHITE) {
            this.colors[child.id] = this.getNodeColorWithChildren(child);
          }
        });
      });
    }
  }

  /**
   * 将节点及其子孙节点着色
   *
   * @param {string} nodeId
   *
   * @private
   * @param {string} nodeId
   * @param {COLOR} color
   * @param {boolean} [skipDisabled]
   * @memberof CascadeTreeSelectStrategy
   */
  private colorNode(nodeId: string, color: COLOR, skipDisabled?: boolean) {
    this.colors[nodeId] = color;

    const node = this.treeModel.getNodeById(nodeId);

    if (!node) {
      return;
    }

    this.treeModel.traverseNodeChildrenByDeep(node, (child) => {
      if (skipDisabled && (child.disabled || child.selectable === false)) {
        return;
      }
      this.colors[child.id] = color;
    });
  }

  /**
   * 根据子节点情况推断出节点的颜色
   *
   * @param {TreeNode} node
   * @returns
   * @memberof CascadeTreeSelectStrategy
   */
  private getNodeColorWithChildren(node: TreeNode) {
    const { children } = node;

    const selectableChildren = children
      ? children.filter(
          (child) => !child.disabled && child.selectable !== false,
        )
      : [];

    let color = COLOR.WHITE;
    if (selectableChildren.length > 0) {
      let isRed = true;
      let isWhite = true;
      // eslint-disable-next-line no-restricted-syntax
      for (const child of selectableChildren) {
        const childId = child.id;
        if (this.colors[childId] === COLOR.GREY) {
          isRed = false;
          isWhite = false;
          break;
        } else if (this.colors[childId] === COLOR.RED) {
          isWhite = false;
        } else {
          isRed = false;
        }
      }

      if (isRed) {
        color = COLOR.RED;
      } else if (isWhite) {
        color = COLOR.WHITE;
      } else {
        color = COLOR.GREY;
      }
    }
    return color;
  }

  /**
   * 切换节点的选中状态
   *
   * @param {TreeNode} treeNode
   * @memberof CascadeTreeSelectStrategy
   */
  public toggle(treeNode: TreeNode) {
    const color = this.colors[treeNode.id];
    this.colorNode(
      treeNode.id,
      color === COLOR.RED ? COLOR.WHITE : COLOR.RED,
      true,
    );

    let { parent } = treeNode;

    while (parent) {
      this.colors[parent.id] = this.getNodeColorWithChildren(parent);
      parent = parent.parent;
    }

    this.syncSelectedItems();
  }

  /**
   * 同步选中的节点
   *
   * @private
   * @memberof CascadeTreeSelectStrategy
   */
  private syncSelectedItems() {
    const selectedItems: string[] = [];
    const callback = (node: TreeNode) => {
      if (
        !node.id.startsWith('VIRTUAL_LEADER_NODE') &&
        !node.virtual &&
        !this.virtualNodes[node.id] &&
        this.colors[node.id] === COLOR.RED
      ) {
        selectedItems.push(node.id);
      } else if (
        node.children &&
        (this.virtualNodes[node.id] || this.colors[node.id] !== COLOR.WHITE)
      ) {
        node.children.forEach(callback);
      }
    };

    (this.treeModel.rootNodes || []).forEach(callback);

    this.selectedItemsfromStrategy = [
      ...this.selectedItemsfromStrategy.filter(
        (id) => !this.treeModel.getNodeById(id),
      ),
      ...selectedItems,
    ];
  }

  /**
   * 节点是否选中
   *
   * @param {TreeNode} treeNode
   * @returns
   * @memberof CascadeTreeSelectStrategy
   */
  public isSelected(treeNode: TreeNode) {
    const { id, parent } = treeNode;
    const color = this.colors[id];
    if (!color) {
      this.colors[id] =
        parent && this.colors[parent.id] === COLOR.RED && !this.virtualNodes[id]
          ? COLOR.RED
          : COLOR.WHITE;
    }
    return this.colors[treeNode.id] === COLOR.RED;
  }

  /**
   * 节点的子节点是否部分选中
   *
   * @param {TreeNode} treeNode
   * @returns
   * @memberof CascadeTreeSelectStrategy
   */
  public isPartialSelected(treeNode: TreeNode) {
    return this.colors[treeNode.id] === COLOR.GREY;
  }
}
