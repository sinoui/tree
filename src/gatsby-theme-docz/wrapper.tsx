/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, createTheme } from '@sinoui/theme';
import { useThemeUI } from 'theme-ui';
import lightBlue from '@sinoui/theme/colors/lightBlue';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: lightBlue,
  },
});

const App = ({ children }: { children: React.ReactNode }) => {
  const { colorMode } = useThemeUI();
  return (
    <ThemeProvider theme={colorMode === 'dark' ? darkTheme : defaultTheme}>
      <div>{children}</div>
    </ThemeProvider>
  );
};

export default DragDropContext(HTML5Backend)(App as any);
