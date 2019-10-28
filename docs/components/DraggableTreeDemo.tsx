/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Tree, { TreeNodeConfigType, TreeNodeType } from '@sinoui/tree';
import styled from 'styled-components';
import { getTreeNodes } from '../treeData';
import TreeNodeComponent from './TreeNode';
import DraggableTreeNode from './DraggableTreeNode';

function loadChildren(
  treeNode?: TreeNodeType,
): Promise<TreeNodeConfigType[]> | TreeNodeConfigType[] {
  if (!treeNode) {
    return getTreeNodes(0, 0, 'node', false);
  }
  const promise: Promise<TreeNodeConfigType[]> = new Promise((resolve) => {
    setTimeout(() => {
      resolve(getTreeNodes(treeNode.level + 1, 0, treeNode.id, false));
    }, 1500);
  });

  return promise;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

function DraggableTreeDemo() {
  return (
    <Wrapper>
      <Tree
        loadChildren={loadChildren}
        renderNode={(props) => <TreeNodeComponent {...props} />}
      />
      <DraggableTreeNode />
    </Wrapper>
  );
}

export default DraggableTreeDemo;
