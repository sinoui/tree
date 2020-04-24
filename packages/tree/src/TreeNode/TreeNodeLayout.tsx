import styled from 'styled-components';
import { opacify } from 'polished';
import { TreeNodeType } from '@sinoui/tree-models';

export interface Props {
  useExpandIconToNodeIcon?: boolean;
  node: TreeNodeType;
  className?: string;
  style?: React.CSSProperties;
  selected?: boolean;
  dense?: boolean;
  nodeHeight?: number;
  /**
   * 拖拽中
   *
   * @type {boolean}
   * @memberof Props
   */
  isDragging?: boolean;
  multiple?: boolean;
  disableSelectedNodeStyle?: boolean;
  indent: number;
}

const TreeNodeLayout = styled.div<Props>`
  display: flex;
  flex-direction: row;
  min-height: ${(props) => props.nodeHeight || (props.dense ? 32 : 40)}px;
  align-items: center;

  color: ${(props) =>
    props.node.selected
      ? props.theme.palette.primary.main
      : props.theme.palette.text.primary};

  & > .sinoui-tree-node__icon {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;

    > .sinoui-icon,
    > .sinoui-svg-icon {
      font-size: 20px;
    }
  }

  & > .sinoui-tree-node__title {
    flex: 1;
    transition: ${(props) =>
      props.theme.transitions.create('color', {
        duration: props.theme.transitions.duration.shortest,
        easing: props.theme.transitions.easing.easeInOut,
      })};
    color: currentColor;
    cursor: default;
  }

  padding-left: ${(props) => props.indent * 24}px;

  background-color: ${(props) =>
    props.node.selected &&
    !props.disableSelectedNodeStyle &&
    opacify(-0.4, props.theme.palette.primary.main)};

  &:hover {
    color: ${(props) => props.theme.palette.primary.main};
    background-color: ${(props) =>
      opacify(
        props.node.selected && !props.disableSelectedNodeStyle ? -0.4 : -0.8,
        props.theme.palette.primary.main,
      )};
  }

  opacity: ${(props) => (props.isDragging ? 0.1 : 1)};
`;

export default TreeNodeLayout;
