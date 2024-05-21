import { fileURLToPath, URL } from 'node:url'
import svgPlugin from './plugins/svgInject'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import mock from './mock/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [mock(), vue(), svgPlugin()],
  build: {
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@img': fileURLToPath(new URL('./src/assets/img', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '^/(api|cdn)': {
        target: 'http://www.beta.bitgaming.cc',
        changeOrigin: true,
      },
    },
  },
})
