/** @jsx jsx */
import { jsx } from '@emotion/core';
import ThemeProvider from '../ThemeProvider';
import Options from './Options';

const App = () => {
  return (
    <ThemeProvider>
      <Options />
    </ThemeProvider>
  );
};

export default App;
