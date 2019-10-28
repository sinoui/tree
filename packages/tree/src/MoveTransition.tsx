import React from 'react';
import { findDOMNode } from 'react-dom';

export interface Props {
  pos: number;
}

/**
 * 利用[FLIP](https://aerotwist.com/blog/flip-your-animations/)技巧实现元素的移动动画。
 *
 * 注意：此接口依赖于[transitionend事件](https://developer.mozilla.org/zh-CN/docs/Web/Events/transitionend)，所以只支持到IE10+。
 */
export default class MoveTransition extends React.Component<Props, {}> {
  private rafId = -1;

  constructor(props: Props) {
    super(props);

    this.onTransitionEnd = this.onTransitionEnd.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    const { pos } = this.props;
    if (prevProps.pos === pos) {
      return;
    }
    // eslint-disable-next-line react/no-find-dom-node
    const el = findDOMNode(this) as HTMLElement;
    const invert = prevProps.pos - pos;
    this.stopTransition(el);
    el.style.transform = `translateY(${invert}px)`;
    this.rafId = requestAnimationFrame(() => {
      el.classList.add('sinoui-tree-item-moving');
      el.style.transform = '';
    });
    el.addEventListener('transitionend', this.onTransitionEnd);
  }

  public componentWillUnmount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.stopTransition(findDOMNode(this) as HTMLElement);
  }

  private onTransitionEnd(event: TransitionEvent) {
    this.stopTransition(event.target as HTMLElement);
  }

  private stopTransition(el: HTMLElement) {
    cancelAnimationFrame(this.rafId);
    // eslint-disable-next-line no-param-reassign
    el.style.transform = '';
    el.removeEventListener('transitionend', this.onTransitionEnd);
    el.classList.remove('sinoui-tree-item-moving');
  }

  public render() {
    const { children } = this.props;
    return React.Children.only(children);
  }
}
