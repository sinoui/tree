# @sinoui/tree

为构建高性能树组件提供基础服务。

## 用法

### 简单用法

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

const treeData = [
  {
    id: 'node1',
    title: '节点1',
    children: [
      {
        id: 'node2',
        title: '节点2',
      },
      {
        id: 'node3',
        title: '节点3',
      },
    ],
  },
  {
    id: 'node4',
    title: '节点4',
  },
];

const TreeNode = ({ node, treeModel }) => {
  return (
    <div
      className="sinoui-demo-tree__node"
      style={{
        paddingLeft: node.level * 24,
      }}
    >
      <ExpandIconButton
        expanded={node.expanded}
        onChange={() => treeModel.toggleExpand(node)}
      />
      <span>{node.title}</span>
    </div>
  );
};

<Tree nodes={treeData} renderNode={TreeNode} />;
```

### 远程数据加载的方式

所有节点，包括根节点均从远程加载数据：

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

const loadNodes = (parentId) => {
  if (parentId) {
    return callLoadChildrenApi(parentId);
  }
  return callLoadTopNodesApi();
};

<Tree loadNodes={loadNodes} renderNode={TreeNode} />;
```

指定根节点，其他节点远程加载：

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

const nodes = [
  { id: 'node1', title: '节点1' },
  { id: 'node2', title: '节点2' },
];

<Tree loadNodes={callLoadChildrenApi} nodes={nodes} />;
```

### 往节点中添加子节点、删除节点、修改节点

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

<Tree nodes={nodes} treeRef={(treeModel) => (this.treeModel = treeModel)} />;

// 添加节点
this.treeModel.addNode(parentNodeId, {
  id: 'node4',
  title: '节点4',
});

// 删除节点
this.treeModel.removeNode(nodeId);

// 修改节点
this.treeModel.updateNode(nodeId, {
  title: '节点5',
});
```

### 节点选中

Tree 默认支持单选和多选。如下：

单选：

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

<Tree
  nodes={nodes}
  onSelect={(nodeId, node) => {
    console.log(`选中的节点:${nodeId}`);
  }}
/>;
```

多选：

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

<Tree
  nodes={nodes}
  multiple
  onSelect={(nodeIds, nodes) => {
    console.log(`选中的节点：${nodeIds}`);
  }}
/>;
```

选择状态受控：

```typescript
import Tree, { ExpandIconButton } from '@sinoui/tree';

this.state = {
  selectedNodeIds: ['001', '002']
}

<Tree
  nodes={nodes}
  selectedNodeIds={['001', '002']}
  onSelect={(nodeIds, nodes) => {
    this.setState({
      selectedNodeIds: nodeIds,
    });
  }}
/>;
```

定制选择策略：

```typescript
import Tree, { TreeSelectStrategy, TreeNode } from '@sinoui/tree';

class AdvancedSelectStrategy implements TreeSelectStrategy {
  this.selectedNodeId = '001';

  isSelect(node: TreeNode) {
    return this.selectedNodeId === node.id;
  }

  toggle(node: TreeNode) {
    this.selectedNodeId = this.selectedNodeId === node.id ? null : node.id;
  }
}

<Tree
  nodes={nodes}
  selectStrategy={AdvancedSelectStrategy}
/>
```

### 渲染大量节点

对于大量节点的渲染优化的总体策略是：只渲染看得见的树节点。这个策略的前提是：

* **能够非常高效的计算出每个节点的高度**。
* 树的高度是可度量的。—— 这一项是可选的，可以参考[react-virtualized/AutoSizer](https://bvaughn.github.io/react-virtualized/#/components/AutoSizer)

可以参考的案例：[react-virtualized](https://github.com/bvaughn/react-virtualized)。

```typescript
import Tree from '@sinoui/Tree';

<Tree nodes={treeNodes} nodeHeight={40} height={500} nodeRender={TreeNod} />;
```
