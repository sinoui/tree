import TreeModel from '../TreeModel';
import treeData from './treeData';
import TreeNodeType from '../TreeNodeType';
import TreeModelEventType from '../TreeModelEventType';

function assertTreeNode(expectedNode: TreeNodeType, actualNode: TreeNodeType) {
  const result = Object.keys(expectedNode).every(
    (key) => actualNode[key] === expectedNode[key],
  );

  if (!result) {
    // eslint-disable-next-line no-undef
    fail(
      `树节点比较失败，期望的模型：${JSON.stringify(
        expectedNode,
        null,
        2,
      )}，但实际上却是：${JSON.stringify(actualNode, null, 2)}`,
    );
  }
}

it('创建静态的树模型', () => {
  const treeModel = new TreeModel(treeData);

  expect(treeModel.nodes.length).toBe(7);

  assertTreeNode(
    {
      level: 0,
      id: 'root',
      title: 'root',
      leaf: false,
    },
    treeModel.nodes[0],
  );

  assertTreeNode(
    {
      level: 1,
      id: 'node1',
      title: 'node1',
      leaf: true,
    },
    treeModel.nodes[1],
  );

  assertTreeNode(
    {
      level: 2,
      id: 'node4',
      title: 'node4',
      leaf: true,
    },
    treeModel.nodes[4],
  );
});

it('获取可见的节点：跟节点收缩情况下', () => {
  const visibleNodes = new TreeModel(treeData).getVisibleNodes();

  expect(visibleNodes.length).toBe(1);
});

it('获取可见的节点：根节点展开的情况', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandNode(treeModel.nodes[0].id);
  const visibleNodes = treeModel.getVisibleNodes();

  expect(visibleNodes.length).toBe(5);
});

it('获取可见的节点：展开多层节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandNode('node6', true);

  const visibleNodes = treeModel.getVisibleNodes();

  expect(visibleNodes.length).toBe(6);
});

it('获取可见的节点：收缩节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandAll();

  treeModel.collapseNode('node3');
  const visibleNodes = treeModel.getVisibleNodes();

  expect(visibleNodes.length).toBe(6);
});

it('获取可见的节点：收缩节点再展开节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandAll();

  treeModel.collapseNode('root');
  treeModel.expandNode('root');

  expect(treeModel.getVisibleNodes().length).toBe(7);
});

it('展开节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.expandNode('root');

  expect(treeModel.getNodeById('root').expanded).toBe(true);

  treeModel.expandNode('node3');
  expect(treeModel.getNodeById('node3').expanded).toBe(true);
});

it('按照路径向上展开节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandNode('node6', true);

  [6, 5, 0]
    .map((i) => (i === 0 ? 'root' : `node${i}`))
    .map((nodeId) => treeModel.getNodeById(nodeId))
    .map((node) => expect(node.expanded).toBe(true));
});

it('展开所有节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.expandAll();

  expect(treeModel.getVisibleNodes().length).toBe(7);
});

it('收缩节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.expandAll();

  treeModel.collapseNode('root');

  expect(treeModel.getNodeById('root').expanded).toBe(false);
});

it('获取根节点', () => {
  const treeModel = new TreeModel(treeData);

  expect(treeModel.rootNodes.length).toBe(1);
  expect(treeModel.rootNodes[0].id).toBe('root');
});

it('获取节点在其父节点的位置', () => {
  const treeModel = new TreeModel(treeData);

  expect(treeModel.getNodeIdxOfParent('root')).toBe(0);
  expect(treeModel.getNodeIdxOfParent('node1')).toBe(0);
  expect(treeModel.getNodeIdxOfParent('node2')).toBe(1);
  expect(treeModel.getNodeIdxOfParent('node4')).toBe(0);
  expect(treeModel.getNodeIdxOfParent('node6')).toBe(0);
});

it('添加节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.addNode('root', {
    id: 'node7',
    title: 'node7',
  });

  expect(treeModel.nodes.length).toBe(8);
  expect(treeModel.getNodeIdxOfParent('node7')).toBe(4);
  expect(treeModel.getNodeById('node7').level).toBe(1);
});

it('添加一组节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.addNode(
    'root',
    {
      id: 'node7',
      title: 'node7',
    },
    {
      id: 'node8',
      title: 'node8',
    },
    {
      id: 'node9',
      title: 'node9',
    },
  );

  expect(treeModel.nodes.length).toBe(10);
  expect(treeModel.getNodeIdxOfParent('node7')).toBe(4);
  expect(treeModel.getNodeIdxOfParent('node8')).toBe(5);
  expect(treeModel.getNodeIdxOfParent('node9')).toBe(6);
});

it('在指定位置添加节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.addNodeAt(
    'root',
    1,
    {
      id: 'node7',
      title: 'node7',
    },
    {
      id: 'node8',
      title: 'node8',
    },
  );

  expect(treeModel.nodes.length).toBe(9);
  expect(treeModel.getNodeIdxOfParent('node7')).toBe(1);
  expect(treeModel.getNodeIdxOfParent('node8')).toBe(2);
  expect(treeModel.getNodeIdxOfParent('node2')).toBe(3);
});

it('添加一个层级的节点', () => {
  const treeModel = new TreeModel(treeData);
  treeModel.addNode(
    'root',
    {
      id: 'node7',
      title: 'node7',
      children: [
        {
          id: 'node9',
          title: 'node9',
          children: [
            {
              id: 'node10',
              title: 'node10',
            },
          ],
        },
      ],
    },
    {
      id: 'node8',
      title: 'node8',
    },
  );

  expect(treeModel.nodes.length).toBe(11);
  expect(treeModel.getNodeById('node9').parent.id).toBe('node7');
  expect(treeModel.getNodeById('node10').parent.id).toBe('node9');
});

it('新增一个根节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.addNode(null, {
    id: 'root2',
    title: 'root2',
  });

  expect(treeModel.rootNodes.length).toBe(2);
  expect(treeModel.rootNodes[1].id).toBe('root2');
});

it('删除叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.removeNode('node1');

  expect(treeModel.nodes.length).toBe(6);
  expect(treeModel.getNodeById('root').children.length).toBe(3);
  expect(treeModel.getNodeById('node1')).toBeUndefined();
});

it('删除非叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.removeNode('node3');

  expect(treeModel.nodes.length).toBe(5);
});

it('移动节点：在同一级之间移动叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.moveNode('node2', 'root', 0);
  treeModel.expandAll();

  expect(treeModel.nodes.length).toBe(7);

  expect(treeModel.getVisibleNodes().map((node) => node.id)).toEqual([
    'root',
    'node2',
    'node1',
    'node3',
    'node4',
    'node5',
    'node6',
  ]);
  expect(treeModel.getNodeIdx(treeModel.getNodeById('node2'))).toBe(1);
  expect(treeModel.getNodeIdx(treeModel.getNodeById('node1'))).toBe(2);
});

it('移动节点：在同一级之间移动非叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.moveNode('node3', 'root', -1);

  expect(treeModel.getNodeIdx(treeModel.getNodeById('node5'))).toBe(3);
  expect(treeModel.getNodeIdx(treeModel.getNodeById('node3'))).toBe(5);
});

it('移动节点：在不同级别移动叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.moveNode('node2', 'node1', 0);

  expect(treeModel.getNodeById('root').children.length).toBe(3);
  expect(treeModel.getNodeById('node1').children.length).toBe(1);
  expect(treeModel.getNodeById('node1').children[0].id).toBe('node2');
  expect(treeModel.getNodeById('node2').level).toBe(2);
  expect(treeModel.getNodeById('node2').parent.id).toBe('node1');
});

it('移动节点：在不同级别移动非叶子节点', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.moveNode('node3', 'node6', 0);

  expect(treeModel.getNodeById('root').children.length).toBe(3);
  expect(treeModel.getNodeById('node6').leaf).toBe(false);
  expect(treeModel.getNodeById('node6').children.length).toBe(1);
  expect(treeModel.getNodeById('node3').level).toBe(3);
  expect(treeModel.getNodeById('node4').level).toBe(4);
});

it('移动节点：将节点移动到其子节点中', () => {
  const treeModel = new TreeModel(treeData);

  const result = treeModel.moveNode('node3', 'node4', 0);

  expect(result).toBe(false);
});

it('移动节点：将节点移动跟节点上', () => {
  const treeModel = new TreeModel(treeData);

  treeModel.moveNode('node3', null, 1);

  expect(treeModel.rootNodes.length).toBe(2);
  expect(treeModel.rootNodes[1].id).toBe('node3');
});

it('判断两个节点是否在同一层级路径中', () => {
  const treeModel = new TreeModel(treeData);

  expect(treeModel.isInheritanceRelationship('node3', 'node4')).toBe(true);
  expect(treeModel.isInheritanceRelationship('root', 'node6')).toBe(true);
});

it('同步加载器加载子节点数据：加载一级数据', () => {
  const loadChildren = jest.fn();
  loadChildren.mockReturnValueOnce([
    {
      id: 'root1',
      title: 'root1',
    },
    {
      id: 'root2',
      title: 'root2',
    },
  ]);
  const treeModel = new TreeModel(undefined, loadChildren);

  expect(treeModel.rootNodes.length).toBe(2);
  expect(treeModel.rootNodes.map((node) => node.id)).toEqual([
    'root1',
    'root2',
  ]);
});

it('同步加载器加载子节点数据：加载多级数据', () => {
  const loadChildren = jest.fn();
  loadChildren.mockReturnValueOnce([
    {
      id: 'root1',
      title: 'root1',
      children: [
        {
          id: 'node1',
          title: '节点1',
        },
      ],
    },
  ]);
  const treeModel = new TreeModel(undefined, loadChildren);

  expect(treeModel.rootNodes.length).toBe(1);
  expect(treeModel.getNodeById('node1').level).toBe(1);
});

it('同步加载器加载子节点：展开节点时加载数据', () => {
  const loadChildren = jest.fn();
  loadChildren.mockReturnValueOnce([
    {
      id: 'node1',
      title: '节点1',
    },
  ]);

  const treeModel = new TreeModel(
    [
      {
        id: 'root',
        title: 'root',
        leaf: false,
      },
    ],
    loadChildren,
  );

  treeModel.expandNode('root');

  expect(treeModel.getNodeById('root').loaded).toBe(true);
  expect(treeModel.nodes.length).toBe(2);
});

describe('是否需要加载子节点', () => {
  let treeModel: TreeModel;

  beforeEach(() => {
    treeModel = new TreeModel(treeData, jest.fn());
  });

  it('叶子节点不需要加载子节点', () => {
    expect(treeModel.needLoadChildren(treeModel.getNodeById('node1'))).toBe(
      false,
    );
  });

  it('已经有子节点的节点不需要加载子节点', () => {
    expect(treeModel.needLoadChildren(treeModel.getNodeById('node3'))).toBe(
      false,
    );
  });

  it('在加载中的节点不需要加载子节点', () => {
    treeModel.updateNode('node2', {
      loading: true,
    });
    expect(treeModel.needLoadChildren(treeModel.getNodeById('node2'))).toBe(
      false,
    );
  });

  it('已经加载的节点不需要加载子节点', () => {
    treeModel.updateNode('node2', {
      loaded: true,
    });

    expect(treeModel.needLoadChildren(treeModel.getNodeById('node2'))).toBe(
      false,
    );
  });

  it('未加载子节点的非叶子节点需要加载子节点', () => {
    treeModel.addNode('root', {
      id: 'node7',
      title: 'node7',
      leaf: false,
    });

    expect(treeModel.needLoadChildren(treeModel.getNodeById('node7'))).toBe(
      true,
    );
  });
});

it('更新节点信息', () => {
  const treeModel = new TreeModel(treeData);

  const newNode = treeModel.updateNode('node2', {
    title: '标题123',
  });

  expect(treeModel.getNodeById('node2').title).toBe('标题123');
  expect(treeModel.getNodeById('node2')).toBe(newNode);
});

it('异步加载子节点：异步加载根节点', async () => {
  const loadChildren = jest.fn();
  const loadRootNodesPromise = Promise.resolve([
    {
      id: 'root',
      title: '根节点',
    },
  ]);
  loadChildren.mockReturnValueOnce(loadRootNodesPromise);

  const treeModel = new TreeModel(undefined, loadChildren);

  expect(loadChildren).toHaveBeenCalled();

  await loadRootNodesPromise;

  expect(treeModel.rootNodes.length).toBe(1);
});

it('异步加载子节点：异步加载多级子节点', async () => {
  const loadChildren = jest.fn();
  const loadChildrenPromise = Promise.resolve([
    {
      id: 'node7',
      title: '节点7',
      children: [
        {
          id: 'node8',
          title: '节点8',
        },
      ],
    },
    {
      id: 'node9',
      title: '节点9',
    },
  ]);
  loadChildren.mockReturnValueOnce(loadChildrenPromise);
  const treeModel = new TreeModel(treeData, loadChildren);
  treeModel.updateNode('node1', {
    leaf: false,
  });

  await treeModel.expandNode('node1');

  expect(treeModel.nodes.length).toBe(10);
});

describe('监听树模型变化', () => {
  let treeModel: TreeModel;

  beforeEach(() => {
    treeModel = new TreeModel(treeData);
  });

  it('监听新增节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.ADD_NODE, listener);

    const node7 = {
      id: 'node7',
      title: '节点7',
    };

    treeModel.addNode('root', node7);

    expect(listener).toHaveBeenCalledWith('root', -1, node7);
  });

  it('监听删除节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.REMOVE_NODE, listener);

    treeModel.removeNode('node1');

    expect(listener).toHaveBeenCalledWith('node1');
  });

  it('监听节点位移事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.MOVE_NODE, listener);

    treeModel.moveNode('node2', 'root', -1);

    expect(listener).toHaveBeenCalledWith('node2', 'root', -1);
  });

  it('更新节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.UPDATE_NODE, listener);

    const nodeUpdateInfo = {
      title: '123',
    };

    treeModel.updateNode('node2', nodeUpdateInfo);

    expect(listener).toHaveBeenCalledWith('node2', nodeUpdateInfo);
  });

  it('监听展开节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.EXPAND_NODE, listener);

    treeModel.expandNode('node3');

    expect(listener).toHaveBeenCalledWith('node3');
  });

  it('监听展开所有节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.EXPAND_NODE, listener);

    treeModel.expandAll();

    expect(listener).toHaveBeenCalledWith(-1);
  });

  it('监听收缩节点事件', () => {
    const listener = jest.fn();
    treeModel.on(TreeModelEventType.COLLAPSE_NODE, listener);

    treeModel.collapseNode('node3');

    expect(listener).toHaveBeenCalledWith('node3');
  });

  it('开始加载子节点事件', () => {
    const listener = jest.fn();
    const loadChildren = jest.fn();
    loadChildren.mockReturnValue(
      Promise.resolve([
        {
          id: 'node7',
          title: 'node7',
        },
      ]),
    );

    treeModel = new TreeModel(
      [
        {
          id: 'root',
          title: 'root',
          leaf: false,
        },
      ],
      loadChildren,
    );

    treeModel.on(TreeModelEventType.BEGIN_LOAD_NODE_CHILDREN, listener);
    treeModel.expandNode('root');

    expect(listener).toHaveBeenCalledWith('root');
  });
});
