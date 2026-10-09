import type { Preview } from '@storybook/react-vite';
import '../src/tokens/index.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i }, expanded: true },
    backgrounds: {
      options: {
        base: { name: 'background/base', value: '#F5F5F5' },
        white: { name: 'base/white', value: '#FFFFFF' },
        dark: { name: 'text/secondary (фото)', value: '#6F6E6E' },
      },
    },
    options: { storySort: { order: ['Foundation', 'Components', 'Sandboxes'] } },
    a11y: { test: 'todo' },
  },
  initialGlobals: { backgrounds: { value: 'base' } },
};

export default preview;
