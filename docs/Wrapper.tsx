/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@sinoui/theme';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import './Wrapper.css';

interface WrapperProps {
  children: React.ReactNode;
}

function Wrapper(props: WrapperProps) {
  const { children } = props;
  return (
    <ThemeProvider theme={defaultTheme}>
      <>{children}</>
    </ThemeProvider>
  );
}

export default DragDropContext(HTML5Backend)(Wrapper as any);
