/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import TreeModel, {
  TreeNodeConfigType,
  TreeNodeType,
  TreeModelEventType,
  TreeSelectStrategy,
} from '@sinoui/tree-models';
import SingleTreeSelectStrategy from './SingleTreeSelectStrategy';
import MultipleTreeSelectStrategy from './MultipleTreeSelectStrategy';
import TreeNode, { TreeNodeProps } from './TreeNode';
import CascadeTreeSelectStrategy from './CascadeTreeSelectStrategy';
import calcNodesIndent from './calcNodesIndent';

const Wrapper = styled.div`
  position: relative;

  .sinoui-tree-item-moving {
    transition: transform 195ms cubic-bezier(0, 0, 0.32, 1) !important;
  }

  .sinoui-tree__expand-icon-button__ripple-layout {
    width: 32px;
    height: 32px;
    top: -6px;
    left: -6px;
  }

  .sinoui-tree__expand-icon-button__ripple {
    width: 32px;
    height: 32px;
  }
`;

export interface TreeProps {
  /**
   * 树节点数据
   */
  nodes?: TreeNodeConfigType[];
  /**
   * 渲染树节点
   */
  renderNode?: (props: TreeNodeProps) => React.ReactNode;
  /**
   * 渲染树节点的标题
   *
   * @memberof TreeProps
   */
  renderNodeTitle?: (props: TreeNodeProps) => React.ReactNode;
  /**
   * 给树应用css类名
   */
  className?: string;
  /**
   * 给树应用css样式
   */
  style?: React.CSSProperties;
  /**
   * 树模型监听
   */
  treeRef?: (treeModel?: TreeModel) => void;
  /**
   * 是否为多选
   */
  multiple?: boolean;
  /**
   * 级联选中
   */
  cascade?: boolean;
  /**
   * 监听选中节点事件。
   */
  onSelect?: (nodeIds: string[], nodes: TreeNodeType[]) => void;
  /**
   * 选中的节点
   */
  selectedItems?: string[];
  /**
   * 节点高度
   */
  nodeHeight?: number;
  /**
   * 加载子节点
   */
  loadChildren?: (
    treeNode?: TreeNodeType,
  ) => Promise<TreeNodeConfigType[]> | TreeNodeConfigType[];

  /**
   * 紧凑型
   */
  dense?: boolean;
  /**
   * 使用展开图标作为节点图标。默认为true。
   */
  useExpandIconToNodeIcon?: boolean;
  /**
   * 节点图标。
   */
  nodeIcon?: React.ReactChild | ((props: TreeNodeProps) => React.ReactNode);
  /**
   * 渲染节点的右侧部分。
   */
  renderTreeNodeRightSection?: (props: TreeNodeProps) => React.ReactNode;
  /**
   * 选择之后不给节点加上样式
   *
   * @type {boolean}
   * @memberof TreeProps
   */
  disableSelectedNodeStyle?: boolean;
  nodeStyle?: React.CSSProperties;
  /**
   * 当节点点击时选中
   */
  selectedWhenNodeClick?: boolean;
  /**
   * 不显示选中按钮图标
   */
  hideSelectedButtonIcon?: boolean;
  /**
   * 监听树节点点击事件
   */
  onNodeClick?: (
    event: React.MouseEvent<HTMLElement>,
    treeNodeProps: TreeNodeProps,
  ) => void;
  /**
   * 监听树节点双击事件
   *
   * @memberof TreeProps
   */
  onNodeDblClick?: (
    event: React.MouseEvent<HTMLElement>,
    treeNodeProps: TreeNodeProps,
  ) => void;
  /**
   * 展开根节点
   *
   * @type {boolean}
   * @memberof TreeProps
   */
  expandRootNodes?: boolean;

  /**
   * 当属性发生变化时更新树
   *
   * @type {boolean}
   * @memberof TreeProps
   */
  updateAfterPropsChange?: boolean;

  /**
   * 是否允许选择的节点为空
   *
   * @type {boolean}
   * @memberof TreeProps
   */
  isAllowEmpty?: boolean;
}

export interface TreeState {
  nodes: TreeNodeType[];
  selectedItems: string[] | undefined;
  treeSelectStrategy: TreeSelectStrategy;
  prevProps: TreeProps;
}

function monitorFnCall<
  T extends {
    [x: string]: Function;
  }
>(obj: T, fns: string[], callback: (obj: T) => void) {
  const proxyFn = (fnName: string) => {
    const fn = obj[fnName];
    // eslint-disable-next-line no-param-reassign
    (obj as any)[fnName] = (...args: any[]) => {
      fn.apply(obj, args);
      callback(obj);
    };
  };
  fns.forEach(proxyFn);

  return obj;
}

const TREE_MODE_CHANGE_EVENTS = [
  TreeModelEventType.ADD_NODE,
  TreeModelEventType.REMOVE_NODE,
  TreeModelEventType.MOVE_NODE,
  TreeModelEventType.EXPAND_NODE,
  TreeModelEventType.COLLAPSE_NODE,
  TreeModelEventType.UPDATE_NODE,
  TreeModelEventType.BEGIN_LOAD_NODE_CHILDREN,
  TreeModelEventType.LOAD_NODE_CHILDREN_SUCCESS,
];

/**
 * 树组件
 */
export default class Tree extends React.Component<TreeProps, TreeState> {
  /**
   * 树模型
   */
  private treeModel: TreeModel = {} as TreeModel;

  /**
   * 树组件是否处于受控状态
   */
  private isControlled: boolean;

  // eslint-disable-next-line react/static-property-placement
  public static defaultProps = {
    renderNode: TreeNode,
    dense: true,
    useExpandIconToNodeIcon: true,
    expandRootNodes: true,
  };

  constructor(props: TreeProps) {
    super(props);
    const { selectedItems } = props;

    this.onTreeModelUpate = this.onTreeModelUpate.bind(this);
    this.createTreeModel();
    this.isControlled =
      typeof props.selectedItems !== 'undefined' &&
      typeof props.onSelect === 'function';

    this.state = {
      nodes: this.treeModel.getVisibleNodes(),
      selectedItems,
      prevProps: props,
      treeSelectStrategy: this.createTreeSelectStrategy(),
    };
  }

  public componentDidMount() {
    const { treeRef } = this.props;
    if (treeRef) {
      treeRef(this.treeModel);
    }
  }

  public static getDerivedStateFromProps(
    nextProps: TreeProps,
    prevState: TreeState,
  ) {
    if (nextProps.selectedItems !== prevState.prevProps.selectedItems) {
      const { treeSelectStrategy } = prevState;
      treeSelectStrategy.selectedItems = nextProps.selectedItems;
      return {
        selectItems: nextProps.selectedItems,
      };
    }

    return null;
  }

  public componentDidUpdate(prevProps: TreeProps) {
    const { updateAfterPropsChange, nodes } = this.props;
    if (updateAfterPropsChange && prevProps.nodes !== nodes) {
      this.treeModel.updateRootNodes(nodes || []);
    }
  }

  public componentWillUnmount() {
    TREE_MODE_CHANGE_EVENTS.forEach((event) =>
      this.treeModel.removeListener(event, this.onTreeModelUpate),
    );
  }

  private onTreeModelUpate() {
    this.setState({
      nodes: this.treeModel.getVisibleNodes(),
    });
  }

  public updateNode = (
    nodeId: string,
    extraNodeInfo: {
      [x: string]: any;
    },
  ) => {
    this.treeModel.updateNode(nodeId, extraNodeInfo);
  };

  private isVisible = (node: { isVisible: string }) => {
    return node.isVisible === '1';
  };

  /**
   * 更新选中的节点
   *
   * @private
   * @param {string[]} selectedItems
   * @memberof Tree
   */
  private updateSelectedItems(selectedItems: string[]) {
    const { selectedItems: selectedItemsProps, onSelect } = this.props;
    const { selectedItems: selectedItemsState } = this.state;
    const changed = this.isControlled
      ? selectedItemsProps !== selectedItems
      : selectedItemsState !== selectedItems;
    if (!this.isControlled && changed) {
      this.setState({
        selectedItems,
      });
    }
    if (changed && onSelect) {
      onSelect(selectedItems, selectedItems
        .map((id) => this.treeModel.nodes.find((node) => node.id === id))
        .filter(Boolean) as TreeNodeType[]);
    }
  }

  /**
   * 节点是否选中
   *
   * @private
   * @param {TreeNode} node 树节点
   * @returns
   */
  private isSelected(node: TreeNodeType) {
    const { treeSelectStrategy } = this.state;
    return treeSelectStrategy.isSelected(node);
  }

  private isPartialSelected(node: TreeNodeType) {
    const { treeSelectStrategy } = this.state;
    return treeSelectStrategy.isPartialSelected(node);
  }

  /**
   * 创建树模型
   */
  private createTreeModel() {
    const { nodes, loadChildren, expandRootNodes } = this.props;
    this.treeModel = new TreeModel(nodes, loadChildren);
    TREE_MODE_CHANGE_EVENTS.forEach((event) =>
      this.treeModel.on(event, this.onTreeModelUpate),
    );

    if (nodes && expandRootNodes) {
      nodes.forEach((node) => this.treeModel.expandNode(node.id));
    }
  }

  /**
   * 创建树节点选择策略
   */
  private createTreeSelectStrategy() {
    const { multiple, cascade, selectedItems, isAllowEmpty } = this.props;
    let strategy;
    if (multiple && cascade) {
      strategy = new CascadeTreeSelectStrategy(selectedItems, this.treeModel);
    } else if (multiple) {
      strategy = new MultipleTreeSelectStrategy(selectedItems, this.treeModel);
    } else {
      strategy = new SingleTreeSelectStrategy(selectedItems, isAllowEmpty);
    }

    return monitorFnCall(strategy as any, ['toggle'], () => {
      const { treeSelectStrategy } = this.state;
      this.updateSelectedItems(treeSelectStrategy.selectedItems || []);
    });
  }

  /**
   * 渲染树节点
   *
   * @param node 节点
   * @param index 顺序号
   */
  private renderTreeNode(
    node: TreeNodeType,
    indents: {
      [id: string]: number;
    },
  ) {
    const selected = this.isSelected(node);
    const partialSelected = !selected && this.isPartialSelected(node);
    const isVisible = this.isVisible(node as any);
    const style = isVisible ? { textDecoration: 'line-through' } : {};
    const {
      nodeHeight,
      nodeIcon,
      useExpandIconToNodeIcon,
      dense,
      multiple,
      renderTreeNodeRightSection,
      disableSelectedNodeStyle,
      nodeStyle,
      selectedWhenNodeClick,
      hideSelectedButtonIcon,
      onNodeClick,
      onNodeDblClick,
      renderNodeTitle,
      renderNode,
    } = this.props;

    const { treeSelectStrategy } = this.state;

    const treeNodeProps = {
      key: node.id,
      nodeHeight,
      node: { ...node, selected, partialSelected },
      nodeIcon,
      treeModel: this.treeModel,
      treeSelectStrategy,
      useExpandIconToNodeIcon,
      dense,
      multiple,
      renderTreeNodeRightSection,
      disableSelectedNodeStyle,
      style: { ...nodeStyle, ...style },
      selectedWhenNodeClick,
      hideSelectedButtonIcon,
      onClick: onNodeClick,
      onDblClick: onNodeDblClick,
      renderNodeTitle,
      indent: indents[node.id],
    };

    if (renderNode) {
      return renderNode(treeNodeProps);
    }
    return null;
  }

  public render() {
    const { nodes } = this.state;
    const { style, className } = this.props;
    const indents = calcNodesIndent(nodes, this.props);
    return (
      <Wrapper style={style} className={classNames('sinoui-tree', className)}>
        {nodes.map((node) => this.renderTreeNode(node, indents))}
      </Wrapper>
    );
  }
}
