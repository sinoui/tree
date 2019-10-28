import { ColorProp } from 'sinoui-components/types';
import TreeNodeConfigType from './TreeNodeConfigType';

/**
 * 树节点数据结构
 */
export default interface TreeNodeType {
  /**
   * 节点id
   */
  id: string;
  /**
   * 节点标题
   */
  title: string;
  /**
   * 层级关系
   */
  level: number;
  /**
   * 是否为叶子节点
   */
  leaf?: boolean;
  /**
   * 节点数据
   */
  // tslint:disable-next-line:no-any
  data?: any;
  /**
   * 子节点
   */
  children?: TreeNodeType[];
  /**
   * 父节点
   */
  parent?: TreeNodeType;
  /**
   * 加载子节点的url
   */
  url?: string;
  /**
   * 是否可选。默认为true
   */
  selectable?: boolean;
  /**
   * 选择类型。默认为checkbox。
   */
  selectType?: 'radio' | 'checkbox';
  /**
   * 是否选中。默认为false。
   */
  selected?: boolean;
  /**
   * 是否部分子元素选中
   */
  partialSelected?: boolean;
  /**
   * 是否不可用。默认为false。
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
   * 是否加载子节点数据中
   */
  loading?: boolean;
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
  iconColor?: ColorProp;
  /**
   * 展开图标的颜色
   */
  expandedIconColor?: ColorProp;
  /**
   * 节点配置
   *
   * @type {TreeNodeConfigType}
   * @memberof TreeNodeType
   */
  nodeConfig: TreeNodeConfigType;

  /**
   * 是否为虚节点，表示不参与到选中节点中
   */
  virtual?: boolean;
  iconshow?: string;
}
