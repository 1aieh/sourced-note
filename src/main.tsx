import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './app/mantine.css';
import './app/global.css';
import { App } from './app/App';
import { COLOR_SCHEME_KEY } from './app/colorScheme';
import { cssVariablesResolver, theme } from './app/theme';

const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_KEY });

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="light"
    >
      <App />
    </MantineProvider>
  </StrictMode>,
);
