/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { DragSource, DragSourceConnector, DragSourceMonitor } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { TreeNodeProps } from '@sinoui/tree';

/**
 * Implements the drag source contract.
 */
const treeNodeDrag = {
  beginDrag() {
    return {
      nodeId: '001',
    };
  },
};

// eslint-disable-next-line react/prefer-stateless-function
class DraggableTreeNode extends React.Component<
  TreeNodeProps & {
    connectDragSource: any;
    isDragging: boolean;
    connectDropTarget: any;
    isOvering: boolean;
  }
> {
  public render() {
    const { connectDragSource } = this.props;
    return (
      <div
        style={{ height: 36 }}
        ref={(instance) => {
          // eslint-disable-next-line react/no-find-dom-node
          const domNode = findDOMNode(instance);
          if (domNode) {
            connectDragSource(domNode);
          }
        }}
      >
        新增节点
      </div>
    );
  }
}
function collect(connect: DragSourceConnector, monitor: DragSourceMonitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export default DragSource('sinoui-tree-node', treeNodeDrag, collect)(
  DraggableTreeNode as any,
);
