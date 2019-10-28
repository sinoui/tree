import React from 'react';
import { render } from '@testing-library/react';
import Tree from '../Tree';
import { TreeNodeConfigType } from '..';

const treeData: TreeNodeConfigType[] = [
  {
    id: 'root',
    title: 'root',
    children: [
      {
        id: 'node1',
        title: 'node1',
      },
      {
        id: 'node2',
        title: 'node2',
      },
      {
        id: 'node3',
        title: 'node3',
        children: [
          {
            id: 'node4',
            title: 'node4',
          },
        ],
      },
      {
        id: 'node5',
        title: 'node5',
        children: [
          {
            id: 'node6',
            title: 'node6',
          },
        ],
      },
    ],
  },
];

it('render Tree', () => {
  const renderNode = jest.fn();
  render(<Tree nodes={treeData} renderNode={renderNode} />);

  expect(renderNode).toHaveBeenCalled();
});

it('expand tree node', () => {
  let treeModel;
  const renderNode = jest.fn();
  render(
    <Tree
      treeRef={(tree) => {
        treeModel = tree;
      }}
      nodes={treeData}
      renderNode={renderNode}
    />,
  );

  renderNode.mockReset();
  if (treeModel) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (treeModel as any).expandNode('root');
  }

  expect(renderNode).toHaveBeenCalled();
});
