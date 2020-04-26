import React from 'react';
import IconButton from '@sinoui/core/IconButton';
import TreeModel from '@sinoui/tree-models';
import type { TreeNode } from '@sinoui/tree-models';
import styled from 'styled-components';
import ArrowDropDown from '@sinoui/icons/ArrowDropDown';

export interface Props {
  node: TreeNode;
  treeModel: TreeModel;
  disabled?: boolean;
}

export interface ExpandIconProps {
  expanded?: boolean;
}

const ExpandIcon = styled(IconButton).attrs(({ color }) => ({
  color: color || 'primary',
  dense: true,
}))<ExpandIconProps>`
  cursor: pointer;
  width: 24px;
  height: 24px;
  user-select: none;
  transform: rotate(${(props) => (props.expanded ? '-45' : '-90')}deg);
  transition: ${(props) =>
    props.theme.transitions.create('transform', {
      duration: props.theme.transitions.duration.short,
    })};
`;

export default function ExpandIconButton(props: Props) {
  const { node, treeModel } = props;

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (node.expanded) {
      treeModel.collapseNode(node.id);
    } else {
      treeModel.expandNode(node.id);
    }
  };

  return (
    <ExpandIcon onClick={onClick} expanded={node.expanded}>
      <ArrowDropDown />
    </ExpandIcon>
  );
}
