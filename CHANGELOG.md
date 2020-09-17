# 版本变更记录

## v1.0.2 - 2020.9.17

- fix(tree-model): 修复新增节点后再删除节点，出现误删除的缺陷

## v1.0.1 - 2020.4.26

- fix(tree): 修复未添加`@sinoui/tree-models`依赖的缺陷

## v1.0.0 -- 2020.4.26

- feat: 采用新的 sinoui 基础组件库`@sinoui/core`替换`sinoui-components`
- feat: 使用`@sinoui/icons`替换`react-icons`
- feat: 使用新版本的主题定制库`@sinoui/theme`

## 破坏性变更

### 主题定制使用方式发生破坏性变更

由于新版本`@sinoui/theme`中发生了一系列破坏性变更，而`@sinoui/tree`使用的是新版本的`@sinoui/theme`，因此我们在使用`@sinoui/tree`时，需要将`@sinoui/theme`的版本从`0.x`升级到`1.x`。有关变更详情请参考[@sinoui/theme | 破坏性变更](https://github.com/sinoui/theme/blob/master/CHANGELOG.md#v100-beta1-2020224)
