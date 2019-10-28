/**
 * 获取树节点
 *
 * @param {number} level 层级
 * @param {number} deep 深度
 * @param {string} parentId 父元素的id
 * @returns
 */
export function getTreeNodes(
  level: number,
  deep: number,
  parentId: string,
  leaf: boolean = deep === 0,
) {
  const children: any = [];
  for (let i = 0; i < (level === 1 ? 1 : 10); i += 1) {
    const child = {
      id: `${parentId}_${i}`,
      title: `${parentId}_${i}`,
      leaf,
      children: [],
      selectType: 'checkbox',
      selected: i % 3 === 0,
    };
    children.push(child);
    if (deep !== 0) {
      child.children = getTreeNodes(level + 1, deep - 1, child.id);
    }
  }
  return children;
}

const treeData = getTreeNodes(0, 3, 'node');

export default treeData;
