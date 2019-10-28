/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {
  DragSource,
  DropTarget,
  DragSourceConnector,
  DragSourceMonitor,
  DropTargetConnector,
  DropTargetMonitor,
} from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { TreeNodeProps, TreeNode } from '@sinoui/tree';

/**
 * Implements the drag source contract.
 */
const treeNodeDrag = {
  beginDrag(props: TreeNodeProps) {
    return {
      nodeId: props.node.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parentId: props.node.parent!.id,
    };
  },
};

const treeNodeDrop = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  drop() {},
  hover(props: TreeNodeProps, monitor: DropTargetMonitor, component: any) {
    const dragNodeId = monitor.getItem().nodeId;
    const dragIndex = props.treeModel.nodes.findIndex(
      (node) => node.id === dragNodeId,
    );
    const hoverNodeId = props.node.id;
    const hoverIndex = props.treeModel.nodes.findIndex(
      (node) => node.id === hoverNodeId,
    );
    if (hoverIndex === dragIndex) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hoverParentNodeId = props.node.parent!.id;

    // eslint-disable-next-line react/no-find-dom-node
    const hoverBoundingRect = (findDOMNode(
      component,
    ) as HTMLElement).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    if (dragIndex !== -1) {
      const idx = props.treeModel.getNodeIdxOfParent(hoverNodeId);
      props.treeModel.moveNode(dragNodeId, hoverParentNodeId, idx);
    } else {
      props.treeModel.addNode(hoverParentNodeId, {
        id: dragNodeId,
        title: '新增节点',
        leaf: true,
      });
    }
  },

  canDrop(props: TreeNodeProps, monitor: DropTargetMonitor) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return monitor.getItem().parentId === props.node.parent!.id;
  },
};

// eslint-disable-next-line react/prefer-stateless-function
class TreeNodeComponent extends React.Component<
  TreeNodeProps & {
    connectDragSource: any;
    isDragging: boolean;
    connectDropTarget: any;
    isOvering: boolean;
  }
> {
  public render() {
    const { connectDropTarget, connectDragSource } = this.props;
    return (
      <TreeNode
        {...this.props}
        innerRef={(instance) => {
          // eslint-disable-next-line react/no-find-dom-node
          const domNode = findDOMNode(instance);
          if (domNode) {
            connectDropTarget(domNode);
            connectDragSource(domNode);
          }
        }}
      />
    );
  }
}
function collect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

function dropCollect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget('sinoui-tree-node', treeNodeDrop, dropCollect)(
  DragSource('sinoui-tree-node', treeNodeDrag, collect)(
    TreeNodeComponent as any,
  ),
);
