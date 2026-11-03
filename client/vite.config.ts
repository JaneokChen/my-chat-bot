import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // @chatui/core 的 browser 字段指向 UMD 产物（无 default 导出），
    // 优先使用 module 字段的 ES 模块入口，避免 Chat 被解析成普通对象
    mainFields: ['module', 'main'],
  },
  server: {
    proxy: {
      // 将所有 /api 开头的请求代理到后端服务
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
