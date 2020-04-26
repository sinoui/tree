import React from 'react';
import Progress from '@sinoui/core/Progress';
import Body2 from '@sinoui/core/Body2';
import CheckboxButton from '@sinoui/core/Checkbox';
import RadioButton from '@sinoui/core/Radio';
import classNames from 'classnames';
import TreeModel from '@sinoui/tree-models';
import type { TreeNodeType, TreeSelectStrategy } from '@sinoui/tree-models';
import ExpandIconButton from './ExpandIconButton';
import TreeNodeLayout from './TreeNodeLayout';

export interface TreeNodeProps {
  node: TreeNodeType;
  treeModel: TreeModel;
  treeSelectStrategy: TreeSelectStrategy;
  multiple?: boolean;
  useExpandIconToNodeIcon?: boolean;
  hiddenNodeIcon?: boolean;
  nodeIcon?: React.ReactChild | ((props: TreeNodeProps) => React.ReactNode);
  dense?: boolean;
  renderNodeTitle?: (props: TreeNodeProps) => React.ReactNode;
  renderTreeNodeRightSection?: (props: TreeNodeProps) => React.ReactNode;
  className?: string;
  onClick?: (
    event: React.MouseEvent<HTMLElement>,
    treeNodeProps: TreeNodeProps,
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: (instance?: any) => void;
  disableSelectedNodeStyle?: boolean;
  nodeHeight?: number;
  style?: React.CSSProperties;
  selectedWhenNodeClick?: boolean;
  hideSelectedButtonIcon?: boolean;
  /**
   * 监听树节点双击事件
   *
   * @memberof TreeProps
   */
  onDblClick?: (
    event: React.MouseEvent<HTMLElement>,
    treeNodeProps: TreeNodeProps,
  ) => void;

  /**
   * 缩进
   *
   * @type {number}
   * @memberof TreeNodeProps
   */
  indent: number;
}

/**
 * 渲染节点图标
 */
function renderNodeIcon(props: TreeNodeProps) {
  const {
    node,
    useExpandIconToNodeIcon,
    hiddenNodeIcon,
    nodeIcon: nodeIconProp,
  } = props;
  const showExpandIcon = !node.loading && !node.leaf;
  const showNodeIcon = showExpandIcon
    ? !useExpandIconToNodeIcon
    : !hiddenNodeIcon;

  if (!showNodeIcon) {
    return null;
  }

  let nodeIcon;
  if (node.icon) {
    nodeIcon = props.node.icon;
  } else if (
    typeof nodeIconProp === 'string' ||
    typeof nodeIconProp === 'number'
  ) {
    nodeIcon = props.nodeIcon;
  } else if (typeof nodeIconProp === 'function') {
    nodeIcon = nodeIconProp(props);
  } else {
    nodeIcon = props.nodeIcon;
  }

  if (!nodeIcon) {
    return null;
  }

  return (
    <span className="sinoui-tree-node__icon" key="nodeIcon">
      {nodeIcon}
    </span>
  );
}

/**
 * 渲染展开图标
 */
function renderExpandIcon(props: TreeNodeProps) {
  const { node, treeModel } = props;
  const showExpandIcon = !node.loading && !node.leaf;

  return (
    showExpandIcon && (
      <span className="sinoui-tree-node__icon" key="expandIcon">
        <ExpandIconButton key="expandIcon" node={node} treeModel={treeModel} />
      </span>
    )
  );
}

/**
 * 渲染进度图标
 */
function renderProgress(props: TreeNodeProps) {
  const { node } = props;
  return (
    node.loading && (
      <span className="sinoui-tree-node__icon" key="progressIcon">
        <Progress key="progress" size={16} thickness={1} />
      </span>
    )
  );
}

/**
 * 渲染节点的选择框
 */
function renderCheckbox(props: TreeNodeProps) {
  const { hideSelectedButtonIcon, node, treeSelectStrategy, multiple } = props;
  if (hideSelectedButtonIcon) {
    return null;
  }

  const toggleSelect = (event: React.ChangeEvent<HTMLElement>) => {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    if (node.selectable !== false && !node.disabled) {
      treeSelectStrategy.toggle(node);
    }
  };

  const SelectButton =
    node.selectType === 'radio' ? RadioButton : CheckboxButton;

  return (
    multiple &&
    node.selectable !== false && (
      <span className="sinoui-tree-node__icon" key="checkboxIcon">
        <SelectButton
          dense
          disabled={node.disabled}
          checked={node.selected}
          indeterminate={node.partialSelected}
          onChange={toggleSelect as any}
          onClick={(event) => event.stopPropagation()}
        />
      </span>
    )
  );
}

/**
 * 树节点组件
 */
function TreeNode({
  className,
  onClick,
  onDblClick,
  innerRef,
  renderNodeTitle,
  renderTreeNodeRightSection,
  ...props
}: TreeNodeProps) {
  const { node } = props;
  return (
    <TreeNodeLayout
      {...props}
      ref={innerRef}
      className={classNames('sinoui-tree-node', className)}
      onClick={(event) => {
        if (
          !(props.multiple && !props.selectedWhenNodeClick) &&
          props.node.selectable !== false &&
          !props.node.disabled
        ) {
          props.treeSelectStrategy.toggle(props.node);
          event.stopPropagation();
        }
        if (onClick) {
          onClick(event, props);
        }
      }}
      onDoubleClick={(e) => (onDblClick ? onDblClick(e, props) : undefined)}
    >
      {renderExpandIcon(props)}
      {renderProgress(props)}
      {renderCheckbox(props)}
      {renderNodeIcon(props)}
      <Body2 className="sinoui-tree-node__title">
        {renderNodeTitle ? renderNodeTitle(props) : node.title}
      </Body2>
      {renderTreeNodeRightSection && renderTreeNodeRightSection(props)}
    </TreeNodeLayout>
  );
}

export default TreeNode;
