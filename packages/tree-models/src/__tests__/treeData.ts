import TreeNodeConfigType from '../TreeNodeConfigType';

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

export default treeData;
