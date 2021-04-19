import { EventEmitter } from 'events';
import TreeNodeType from './TreeNodeType';
import TreeNodeConfigType from './TreeNodeConfigType';
import TreeModelEventType from './TreeModelEventType';

export type LoadChildrenEventListener = (
  node: TreeNodeType | null | undefined,
  nodes: TreeNodeType[],
) => void;

const VIRTUAL_ROOT_NODE = 'VIRTUAL_ROOT_NODE';

/**
 * 树模型
 *
 * 负责树结构数据的：
 *
 * * 节点数据的增删改查
 * * 节点数据之间的从属关系
 * * 节点可见性控制
 */
export default class TreeModel {
  private eventEmitter: EventEmitter = new EventEmitter();

  private virtualRootNode: TreeNodeType = {
    id: VIRTUAL_ROOT_NODE,
    title: '虚拟根节点',
    level: -1,
    nodeConfig: {
      id: VIRTUAL_ROOT_NODE,
      title: '虚拟根节点',
    },
  };

  public nodes: TreeNodeType[] = [];

  /**
   * 添加监听
   */
  public on: (
    eventName: TreeModelEventType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ) => void;

  /**
   * 删除所有监听
   */
  public removeAllListeners: (event?: TreeModelEventType) => void;

  /**
   * 删除监听
   */
  public removeListener: (
    event: TreeModelEventType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ) => void;

  /**
   * 创建树模型
   * @param treeNodes
   */
  constructor(
    treeNodes: TreeNodeConfigType[] = [],
    public readonly loadChildren?: (
      treeNode?: TreeNodeType,
    ) => Promise<TreeNodeConfigType[]> | TreeNodeConfigType[],
  ) {
    this.nodes = [];
    if (treeNodes.length === 0 && loadChildren) {
      this.virtualRootNode.children = [];
      this.loadNodeChildren(this.virtualRootNode);
    } else {
      this.addNode(VIRTUAL_ROOT_NODE, ...treeNodes);
    }

    this.on = this.eventEmitter.on.bind(this.eventEmitter);
    this.removeAllListeners = this.eventEmitter.removeAllListeners.bind(
      this.eventEmitter,
    );
    this.removeListener = this.eventEmitter.removeListener.bind(
      this.eventEmitter,
    );
  }

  /**
   * 更新根节点
   */
  public updateRootNodes(treeNodes: TreeNodeConfigType[]) {
    (this.rootNodes || []).forEach((node) => this.removeNode(node.id));
    this.addNode(VIRTUAL_ROOT_NODE, ...treeNodes);
  }

  /**
   * 获取根节点
   */
  public get rootNodes() {
    return this.virtualRootNode.children;
  }

  /**
   * 获取可见的节点
   */
  public getVisibleNodes(): TreeNodeType[] {
    const visibleNodes: TreeNodeType[] = [];

    const push = (node: TreeNodeType) => {
      visibleNodes.push(node);
      if (node.expanded && node.children) {
        node.children.forEach(push);
      }
    };

    (this.rootNodes || []).forEach(push);

    return visibleNodes;
  }

  /**
   * 展开节点
   *
   * @param nodeId 节点id
   * @param upToRoot 向上遍历展开所有的祖先节点
   */
  public expandNode(nodeId: string, upToRoot = false) {
    const node = this.getNodeById(nodeId);
    node.expanded = true;
    if (upToRoot && node.parent) {
      let { parent } = node;
      while (parent) {
        parent.expanded = true;
        parent = parent.parent as TreeNodeType;
      }
    }

    this.eventEmitter.emit(TreeModelEventType.EXPAND_NODE, nodeId);

    return this.loadNodeChildren(node);
  }

  /**
   * 展开所有节点
   */
  public expandAll() {
    this.nodes
      .filter((node) => !node.leaf)
      .forEach((node) => {
        // eslint-disable-next-line no-param-reassign
        node.expanded = true;
      });

    this.eventEmitter.emit(TreeModelEventType.EXPAND_NODE, -1);
  }

  /**
   * 收缩节点
   * @param nodeId 节点id
   */
  public collapseNode(nodeId: string) {
    const node = this.getNodeById(nodeId);
    node.expanded = false;

    this.eventEmitter.emit(TreeModelEventType.COLLAPSE_NODE, nodeId);
  }

  /**
   * 获取id为nodeId的节点
   *
   * @param nodeId 节点id
   */
  public getNodeById(nodeId: string): TreeNodeType {
    return nodeId === VIRTUAL_ROOT_NODE
      ? this.virtualRootNode
      : (this.nodes.find((node) => node.id === nodeId) as TreeNodeType);
  }

  /**
   * 获取节点在其父元素中的位置
   */
  public getNodeIdxOfParent(nodeId: string): number {
    const node = this.getNodeById(nodeId);
    const { parent } = node;
    if (parent) {
      return (parent.children || []).indexOf(node);
    }
    return (this.rootNodes || []).indexOf(node);
  }

  /**
   * 新增节点
   *
   * @param parentNodeId 父节点id
   * @param nodeConfigs 新增的节点
   */
  public addNode(
    parentNodeId: string | null | undefined,
    ...nodeConfigs: TreeNodeConfigType[]
  ) {
    this.addNodeAt(parentNodeId, -1, ...nodeConfigs);
  }

  /**
   * 在指定位置上添加节点。
   *
   * 说明一下指定位置的用法：
   *
   * * 如果指定了大于0的位置数字，则表示在位置数字所指示的位置上插入新节点，此位置上的原树节点则往后移动一位；
   * * 如果指定了-1，表示插入在最后的位置上。
   *
   * @param parentNodeId 父节点id
   * @param pos 新增节点在父节点的位置，-1表示插入在父节点的孩子节点最后位置上
   * @param nodeConfigs 新增的节点
   */
  public addNodeAt(
    parentNodeId: string | null | undefined,
    pos: number,
    ...nodeConfigs: TreeNodeConfigType[]
  ) {
    const parent = parentNodeId
      ? this.getNodeById(parentNodeId)
      : this.virtualRootNode;
    const idx = this.getInsertNodePos(parent, pos);
    if (idx === -1) {
      throw new Error('指定的插入位置不正确');
    }

    const nodes = this.transformTreeNodesToArray(parent, nodeConfigs);

    nodes.forEach((node) => {
      if (!node.loaded && node.expanded) {
        this.loadNodeChildren(node);
      }
    });

    this.nodes.splice(idx, 0, ...nodes);
    parent.children = this.getChildren(parent);

    this.eventEmitter.emit(
      TreeModelEventType.ADD_NODE,
      parentNodeId,
      pos,
      ...nodeConfigs,
    );
  }

  /**
   * 更新节点信息
   *
   * @param nodeId 节点id
   * @param extraNodeInfo 额外的节点信息
   */
  public updateNode(
    nodeId: string,
    extraNodeInfo: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [x: string]: any;
    },
  ) {
    const node = this.getNodeById(nodeId);
    Object.assign(node, extraNodeInfo);

    this.eventEmitter.emit(
      TreeModelEventType.UPDATE_NODE,
      nodeId,
      extraNodeInfo,
    );

    return node;
  }

  public getLastPosterityNode(node: TreeNodeType): TreeNodeType {
    if (node.children && node.children.length > 0) {
      return this.getLastPosterityNode(node.children[node.children.length - 1]);
    }
    return node;
  }

  /**
   * 获取插入节点的位置
   *
   * @param parent 父节点
   * @param pos 节点位置
   */
  public getInsertNodePos(parent: TreeNodeType, pos: number) {
    const siblingNode = this.getNodeAt(parent, pos);

    const getNodeEndPos = (node: TreeNodeType): number => {
      return this.getNodeIdx(this.getLastPosterityNode(node));
    };

    if (!siblingNode && pos === -1) {
      return getNodeEndPos(parent) + 1;
    }
    if (!siblingNode) {
      return -1;
    }
    if (siblingNode && pos === -1) {
      return getNodeEndPos(siblingNode) + 1;
    }
    return getNodeEndPos(siblingNode);
  }

  /**
   * 获取相对于父元素位置的节点
   *
   * @param parent 父节点
   * @param pos 相对于父节点的位置
   */
  // eslint-disable-next-line class-methods-use-this
  public getNodeAt(parent: TreeNodeType, pos: number) {
    const children = parent.children || [];
    if (pos === -1) {
      return children[children.length - 1];
    }
    return children[pos];
  }

  /**
   * 获取节点在整棵树中的位置
   *
   * @param node 节点
   */
  public getNodeIdx(node: TreeNodeType) {
    return this.nodes.indexOf(node);
  }

  /**
   * 删除节点
   *
   * @param nodeId 节点id
   */
  public removeNode(nodeId: string) {
    const node = this.getNodeById(nodeId);
    const parent = node.parent || this.virtualRootNode;
    const start = this.getNodeIdx(node);
    const deleteCount = this.getDescendantCount(node) + 1;

    this.nodes.splice(start, deleteCount);

    parent.children = this.getChildren(parent);

    this.eventEmitter.emit(TreeModelEventType.REMOVE_NODE, nodeId);
  }

  /**
   * 移动节点
   *
   * @param nodeId 节点id
   * @param [parentId] 父节点id
   * @param pos 新位置
   */
  public moveNode(nodeId: string, parentId: string, pos = -1) {
    if (this.isInheritanceRelationship(nodeId, parentId)) {
      // 不允许将节点移动至其孩子节点上
      return false;
    }

    const node = this.getNodeById(nodeId);
    const prevParent = node.parent || this.virtualRootNode;
    const nextParent = parentId
      ? this.getNodeById(parentId)
      : this.virtualRootNode;
    const prevIdx = this.getNodeIdx(node);
    const nextIdx = this.getInsertNodePos(nextParent, pos);

    const count = this.getDescendantCount(node) + 1;
    const movingNodes = this.nodes.splice(prevIdx, count);
    this.nodes.splice(nextIdx, 0, ...movingNodes);

    if (prevParent !== nextParent) {
      const levelDelta = nextParent.level - prevParent.level;
      if (levelDelta !== 0) {
        movingNodes.forEach((movingNode) => {
          // eslint-disable-next-line no-param-reassign
          movingNode.level += levelDelta;
        });
      }

      node.parent = nextParent;
      nextParent.leaf = false;

      prevParent.children = this.getChildren(prevParent);
    }

    nextParent.children = this.getChildren(nextParent);

    this.eventEmitter.emit(TreeModelEventType.MOVE_NODE, nodeId, parentId, pos);

    return true;
  }

  /**
   *
   *
   * @param {string} dragNodeId 拖拽节点的id
   * @param {string} hoverNodeId 目标节点的id
   * @param {('after' | 'before')} [position='after'] 拖拽节点相对于目标节点的位置
   * @return {*}
   * @memberof TreeModel
   */
  public moveNodeByPosition(
    dragNodeId: string,
    hoverNodeId: string,
    position: 'after' | 'before' = 'after',
  ) {
    if (!dragNodeId || !hoverNodeId) {
      return false;
    }

    if (this.isInheritanceRelationship(dragNodeId, hoverNodeId)) {
      return false;
    }

    const dragNode = this.getNodeById(dragNodeId);
    let hoverNode = this.getNodeById(hoverNodeId);

    const dragIdx = this.getNodeIdx(dragNode);
    const dragCount = this.getDescendantCount(dragNode) + 1;
    const movingNodes = this.nodes.splice(dragIdx, dragCount);

    let hoverIdx = this.getNodeIdx(hoverNode);

    /*
      1. 位置为before，默认拖拽到当前hover节点的同级节点
      2. 位置为after
        2.1 如果存在子节点，且目标节点处于展开状态，认为拖拽到当前hover节点的下级节点
        2.2 如果不存在子节点，或者目标节点处于折叠状态，认为拖拽到当前hover节点的统计节点
    */
    if (position === 'after') {
      if (
        hoverNode.expanded &&
        hoverNode.children &&
        hoverNode.children.length > 0
      ) {
        [hoverNode] = hoverNode.children;
        hoverIdx += 1;
      } else {
        hoverIdx += this.getDescendantCount(hoverNode) + 1;
      }
    }

    const prevParent = dragNode.parent ?? this.virtualRootNode;
    const nextParent = hoverNode.parent ?? this.virtualRootNode;
    this.nodes.splice(hoverIdx, 0, ...movingNodes);

    if (prevParent !== nextParent) {
      const levelDelta = nextParent.level - prevParent.level;
      if (levelDelta !== 0) {
        movingNodes.forEach((movingNode) => {
          // eslint-disable-next-line no-param-reassign
          movingNode.level += levelDelta;
        });
      }

      dragNode.parent = nextParent;
      nextParent.leaf = false;

      prevParent.children = this.getChildren(prevParent);
    }

    nextParent.children = this.getChildren(nextParent);

    this.eventEmitter.emit(
      TreeModelEventType.MOVE_NODE,
      dragNodeId,
      hoverNodeId,
      position,
    );

    return true;
  }

  /**
   * 判断两个节点是否在同一个层级路径中
   *
   * @param parentId 父节点
   * @param nodeId 子节点
   */
  public isInheritanceRelationship(parentId: string, nodeId: string) {
    const parent = this.getNodeById(parentId);
    let node = this.getNodeById(nodeId);

    while (node) {
      if (node === parent) {
        return true;
      }
      node = node.parent as TreeNodeType;
    }

    return false;
  }

  /**
   * 获取节点的子节点
   *
   * @param node 节点
   */
  public getChildren(node: TreeNodeType) {
    return this.nodes.filter((item) => item.parent === node);
  }

  /**
   * 获取节点的后代节点数量
   *
   * @param node 节点
   */
  public getDescendantCount(node: TreeNodeType) {
    let count = 0;
    this.traverseNodeChildren(node, (treeNodes) => {
      count += treeNodes.length;
    });
    return count;
  }

  /**
   * 遍历孩子节点
   * @param treeNode 树节点
   * @param callback 回调函数
   */
  private traverseNodeChildren(
    treeNode: TreeNodeType,
    callback: (treeNodes: TreeNodeType[]) => void,
  ) {
    if (treeNode.children) {
      callback(treeNode.children);
      // eslint-disable-next-line no-restricted-syntax
      for (const child of treeNode.children) {
        this.traverseNodeChildren(child, callback);
      }
    }
  }

  /**
   * 深度优先遍历孩子节点
   *
   * @param {TreeNodeType} treeNode
   * @param {(treeNodes: TreeNodeType[]) => void} callback
   * @memberof TreeModel
   */
  public traverseNodeChildrenByDeep(
    treeNode: TreeNodeType,
    callback: (treeNodes: TreeNodeType) => void,
  ) {
    if (treeNode.children) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of treeNode.children) {
        this.traverseNodeChildrenByDeep(child, callback);
      }
    }
    callback(treeNode);
  }

  /**
   * 是否需要加载子节点
   *
   * @param node 树节点
   */
  public needLoadChildren(node: TreeNodeType) {
    return (
      !node.leaf &&
      (!node.children || node.children.length === 0) &&
      !node.loading &&
      !node.loaded &&
      !!this.loadChildren
    );
  }

  /**
   * 加载节点的子节点数据
   *
   * @param node 节点
   */
  public loadNodeChildren(node: TreeNodeType) {
    if (!this.needLoadChildren(node)) {
      return undefined;
    }
    // eslint-disable-next-line no-param-reassign
    node.loading = true;
    this.eventEmitter.emit(
      TreeModelEventType.BEGIN_LOAD_NODE_CHILDREN,
      node.id,
    );
    const result = this.loadChildren
      ? this.loadChildren(node === this.virtualRootNode ? undefined : node)
      : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyResult = (treeNodes: any) => {
      this.addNode(node.id, ...treeNodes);
      // eslint-disable-next-line no-param-reassign
      node.loaded = true;
      // eslint-disable-next-line no-param-reassign
      node.loading = false;
      this.eventEmitter.emit(
        TreeModelEventType.LOAD_NODE_CHILDREN_SUCCESS,
        node.id,
      );
    };

    if (result instanceof Array) {
      applyResult(result);
    } else {
      result.then(applyResult).catch((error) => {
        this.eventEmitter.emit(
          TreeModelEventType.LOAD_NODE_CHILDREN_FAILURE,
          node.id,
          error,
        );
      });
    }

    return applyResult;
  }

  /**
   * 转换树节点数据
   *
   * @param treeNode 待转换的树节点数据
   * @param parentNode 父节点
   */
  // eslint-disable-next-line class-methods-use-this
  private transformNode(
    treeNode: TreeNodeConfigType,
    parentNode?: TreeNodeType,
  ) {
    const { children, ...restConfig } = treeNode;
    const node: TreeNodeType = {
      ...restConfig,
      nodeConfig: restConfig,
      parent: parentNode,
      level: parentNode ? parentNode.level + 1 : 0,
      leaf:
        typeof treeNode.leaf === 'boolean'
          ? treeNode.leaf
          : !treeNode.children || treeNode.children.length === 0,
    };
    return node;
  }

  /**
   * 将树形结构数据转化成一维数组
   *
   * @param parent 父节点
   * @param treeNodes 需要转化的节点配置
   */
  private transformTreeNodesToArray(
    parent: TreeNodeType,
    treeNodes: TreeNodeConfigType[],
  ): TreeNodeType[] {
    const nodes: TreeNodeType[] = [];

    const transform = (
      treeNode: TreeNodeConfigType,
      parentNode?: TreeNodeType,
    ) => {
      const node = this.transformNode(treeNode, parentNode);
      nodes.push(node);

      if (treeNode.children) {
        node.children = treeNode.children.map((child) =>
          transform(child, node),
        );
      }
      return node;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const treeNode of treeNodes) {
      transform(treeNode, parent);
    }

    return nodes;
  }
}
