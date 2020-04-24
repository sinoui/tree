/**
 * 树节点
 */
export default interface TreeNodeConfigType {
  /**
   * 节点id
   */
  id: string;
  /**
   * 节点标题
   */
  title: string;
  /**
   * 孩子节点
   */
  children?: TreeNodeConfigType[];
  /**
   * 是否叶子节点
   */
  leaf?: boolean;

  /**
   * 节点数据
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  /**
   * 加载子节点的url
   */
  url?: string;
  /**
   * 是否可选，默认为true，表示可选。
   */
  selectable?: boolean;
  /**
   * 选择类型，默认为checkbox。
   */
  selectType?: 'radio' | 'checkbox';
  /**
   * 是否已选中，默认为false。
   */
  selected?: boolean;
  /**
   * 是否不可用，不可用情况下，节点不可选中，且不可展开或者收缩。默认为false。
   */
  disabled?: boolean;
  /**
   * 节点的图标
   */
  icon?: string;
  /**
   * 是否可拖拽
   */
  dragable?: boolean;
  /**
   * 是否可以放置拖拽节点
   */
  dropable?: boolean;
  /**
   * 是否已加载数据
   */
  loaded?: boolean;
  /**
   * 是否展开
   */
  expanded?: boolean;
  /**
   * 展开状态下的节点图标
   */
  expandedIcon?: string;
  /**
   * 图标颜色
   */
  iconColor?: string;
  /**
   * 展开图标的颜色
   */
  expandedIconColor?: string;

  /**
   * 是否为虚节点，表示不参与到选中节点中
   */
  virtual?: boolean;
}
