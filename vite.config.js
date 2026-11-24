import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Change this to your GitHub repository name before deploying.
const REPO_NAME = 'winme';

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
});
