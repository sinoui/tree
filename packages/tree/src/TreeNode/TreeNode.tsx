import React from 'react';
import Progress from 'sinoui-components/Progress';
import Icon, { SimpleIcon } from 'sinoui-components/Icon';
import { P } from 'sinoui-components/Text';
import { CheckboxButton } from 'sinoui-components/Checkbox';
import { RadioButton } from 'sinoui-components/Radio';
import classNames from 'classnames';
import TreeModel, {
  TreeNodeType,
  TreeSelectStrategy,
} from '@sinoui/tree-models';
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
    nodeIcon = <Icon color={props.node.iconColor}>{props.node.icon}</Icon>;
  } else if (
    typeof nodeIconProp === 'string' ||
    typeof nodeIconProp === 'number'
  ) {
    nodeIcon = <SimpleIcon>{props.nodeIcon}</SimpleIcon>;
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
  const showExpandIcon = !props.node.loading && !props.node.leaf;

  return (
    showExpandIcon && (
      <span className="sinoui-tree-node__icon" key="expandIcon">
        <ExpandIconButton
          key="expandIcon"
          node={props.node}
          treeModel={props.treeModel}
        />
      </span>
    )
  );
}

/**
 * 渲染进度图标
 */
function renderProgress(props: TreeNodeProps) {
  return (
    props.node.loading && (
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
  if (props.hideSelectedButtonIcon) {
    return null;
  }

  const toggleSelect = (event: React.ChangeEvent<HTMLElement>) => {
    event.stopPropagation();

    if (props.node.selectable !== false && !props.node.disabled) {
      props.treeSelectStrategy.toggle(props.node);
    }
  };

  const SelectButton =
    props.node.selectType === 'radio' ? RadioButton : CheckboxButton;

  return (
    props.multiple &&
    props.node.selectable !== false && (
      <span className="sinoui-tree-node__icon" key="checkboxIcon">
        <SelectButton
          dense
          disabled={props.node.disabled}
          checked={props.node.selected}
          indeterminate={props.node.partialSelected}
          onChange={toggleSelect}
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
      <P className="sinoui-tree-node__title">
        {renderNodeTitle ? renderNodeTitle(props) : node.title}
      </P>
      {renderTreeNodeRightSection && renderTreeNodeRightSection(props)}
    </TreeNodeLayout>
  );
}

export default TreeNode;
