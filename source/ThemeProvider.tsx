/** @jsx jsx */
import { Fragment } from 'react';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import { Global, jsx, css } from '@emotion/core';
import emotionReset from 'emotion-reset';

import { produce } from 'immer';
import preset from '@rebass/preset';

const theme: any = produce(preset, (draft: any) => {
    draft.colors.background = '#18191a';
    draft.colors.text = '#d3d3d3';
    draft.fontSizes.shift();
    draft.lineHeights.body = 1.33;
  });

const ThemeProvider = ({ children }: React.PropsWithChildren<{}>) => (
  <Fragment>
    <Global
      styles={css`
        ${emotionReset} body {
          background: ${theme.colors.background};
          color: ${theme.colors.text};
          font-size: ${theme.fontSizes[1]}px;
          font-family: Segoe UI, Helvetica, Arial, sans-serif;
          line-height: ${theme.lineHeights.body};
        }
        :root {
          overflow-y: scroll;
        }
        a {
          color: ${theme.colors.primary};
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          line-height: ${theme.lineHeights.heading};
          font-weight: bold;
        }
      `}
    />
    <EmotionThemeProvider theme={theme}>
      {children}
    </EmotionThemeProvider>
  </Fragment>)

export default ThemeProvider;
