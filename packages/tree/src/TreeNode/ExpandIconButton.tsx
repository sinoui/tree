import React from 'react';
import { withRipple } from '@sinoui/ripple';
import IconButton from '@sinoui/core/IconButton';
import TreeModel, { TreeNode } from '@sinoui/tree-models';
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
}))<ExpandIconProps>`
  cursor: pointer;
  user-select: none;
  transform: rotate(${(props) => (props.expanded ? '-45' : '-90')}deg);
  transition: ${(props) =>
    props.theme.transitions.create('transform', {
      duration: props.theme.transitions.duration.short,
    })};
`;

class ExpandIconButton extends React.Component<Props> {
  private onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const { node, treeModel } = this.props;
    if (node.expanded) {
      treeModel.collapseNode(node.id);
    } else {
      treeModel.expandNode(node.id);
    }
  };

  public render() {
    const { node } = this.props;
    return (
      <ExpandIcon onClick={this.onClick} expanded={node.expanded}>
        <ArrowDropDown />
      </ExpandIcon>
    );
  }
}

export default withRipple({
  center: true,
  rippleLayoutClassName: 'sinoui-tree__expand-icon-button__ripple-layout',
  rippleClassName: 'sinoui-tree__expand-icon-button__ripple',
  fixSize: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})(ExpandIconButton) as any;
