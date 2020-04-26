import type { TreeNodeType } from '@sinoui/tree-models';

interface Options {
  useExpandIconToNodeIcon?: boolean;
  hiddenNodeIcon?: boolean;
  hideSelectedButtonIcon?: boolean;
  multiple?: boolean;
  nodeIcon?:
    | React.ReactNode
    | ((treeNode: TreeNodeType) => React.ReactNode | undefined);
}

/**
 * 是否需要渲染节点图标
 *
 * @param {TreeNodeType} node 节点
 * @param {Options} props 配置
 * @returns
 */
function isRenderNodeIcon(node: TreeNodeType, props: Options) {
  if (props.hiddenNodeIcon) {
    return false;
  }
  if (node.leaf || !props.useExpandIconToNodeIcon) {
    return !!(
      node.icon ||
      (props.nodeIcon &&
        (typeof props.nodeIcon === 'function'
          ? props.nodeIcon(node)
          : props.nodeIcon))
    );
  }
  return false;
}

/**
 * 是否需要渲染选择图标
 *
 * @param {TreeNodeType} node
 * @param {Options} props
 * @returns
 */
function isRenderCheckboxIcon(node: TreeNodeType, props: Options) {
  if (props.hideSelectedButtonIcon) {
    return false;
  }
  return props.multiple && node.selectable !== false;
}

/**
 * 计算树节点的缩进
 *
 * @param {TreeNodeType[]} allNodes
 * @param {Options} props
 * @returns
 */
function calcNodesIndent(allNodes: TreeNodeType[], props: Options) {
  const indents: {
    [id: string]: number;
  } = {};
  const relativeIndents: {
    [id: string]: number;
  } = {};

  const getChildren = (item: TreeNodeType) => {
    const children = !item.leaf
      ? allNodes.filter((node) => node.parent && node.parent.id === item.id)
      : undefined;

    return children;
  };

  function inner(nodes: TreeNodeType[]) {
    const nodeIcons: {
      [id: string]: {
        expanded: boolean;
        node: boolean;
        checkbox?: boolean;
      };
    } = {};

    let containsExpandedIcon = false;
    let containsNodeIcon = false;
    let containsCheckboxIcon = false;

    nodes.forEach((item) => {
      const nodeExpanded = !item.leaf;
      const nodeIcon = isRenderNodeIcon(item, props);
      const nodeCheckbox = isRenderCheckboxIcon(item, props);
      nodeIcons[item.id] = {
        expanded: nodeExpanded,
        node: nodeIcon,
        checkbox: nodeCheckbox,
      };
      if (nodeExpanded) {
        containsExpandedIcon = true;
      }
      if (nodeIcon) {
        containsNodeIcon = true;
      }
      if (nodeCheckbox) {
        containsCheckboxIcon = true;
      }
    });

    nodes.forEach((item) => {
      const relativeIndent =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (item.level === 0 ? 0 : relativeIndents[item.parent!.id]) +
        (item.level > 0 ? 0.7 : 0);
      relativeIndents[item.id] = relativeIndent;
      let indent = relativeIndent;

      if (containsExpandedIcon && !nodeIcons[item.id].expanded) {
        indent += 1;
      } else if (!containsExpandedIcon && item.leaf) {
        indent += 0.8;
      }

      if (containsNodeIcon && !nodeIcons[item.id].node) {
        indent += 1;
      }

      if (containsCheckboxIcon && !nodeIcons[item.id].checkbox) {
        indent += 1;
      }

      indents[item.id] = indent;

      const children = getChildren(item);
      if (children && children.length > 0) {
        inner(children);
      }
    });
  }

  inner(allNodes.filter((node) => node.level === 0));

  return indents;
}

export default calcNodesIndent;
