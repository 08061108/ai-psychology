import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'  // 引入resolve函数 - 是 node.js 提供的模块解析函数
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 配置 @ 为 src 目录的别名  __dirname 是 Node.js 的全局变量，表示当前文件所在的目录
    },
  },
  // 配置代理
  server: {
    proxy: {
      '/api': {
        target: 'http://159.75.169.224:1235',
        changeOrigin: true     // 改变源地址，将请求转发到目标地址 
      }
    }
  }
})
