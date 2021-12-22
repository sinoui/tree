import TreeModel from '../TreeModel';

const treeData: any = [
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
  {
    id: 'node7',
    title: 'node7',
  },
];

it('拖拽目标节点位置 before', () => {
  const model = new TreeModel(treeData);

  model.moveNodeByPosition('node5', 'node3', 'before');
  const result = model.getVisibleNodes();
  expect(result[2].id).toBe('node5');
  expect(result[2].children?.length).toBe(1);
  expect(result[3].id).toBe('node3');
  expect(result[3].children?.length).toBe(1);
});

it('拖拽目标节点位置 after, 目标节点未展开', () => {
  const model = new TreeModel(treeData);
  model.expandNode('node3');
  model.moveNodeByPosition('node7', 'node3', 'after');

  const result = model.getVisibleNodes();

  expect(result[3].id).toBe('node7');
});

it('拖拽目标节点位置 after, 目标节点展开且存在子元素', () => {
  const model = new TreeModel(treeData);

  model.expandNode('node3');
  model.moveNodeByPosition('node7', 'node3', 'after');

  const result = model.getVisibleNodes();
  expect(result[2].children?.length).toBe(2);
  expect(result[2].children?.[0].id).toBe('node7');
});

it('拖拽目标节点位置 after, 目标节点展开且不存在子元素', () => {
  const model = new TreeModel(treeData);

  model.expandNode('node1');
  model.moveNodeByPosition('node7', 'node1', 'after');

  const result = model.getVisibleNodes();
  expect(result[0].children?.length).toBe(1);
  expect(result[0].children?.[0].id).toBe('node7');
});

it('拖拽目标节点 after, 目标节点展开，源节点与目标节点都存在子节点', () => {
  const model = new TreeModel(treeData);

  model.expandNode('node3');
  model.moveNodeByPosition('node5', 'node3', 'after');

  const nodeIds = model.nodes.map((node) => node.id);
  expect(nodeIds).toEqual([
    'node1',
    'node2',
    'node3',
    'node5',
    'node6',
    'node4',
    'node7',
  ]);
});
