import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)   // 创建应用实例
const pinia = createPinia()
app.use(pinia)

app.use(ElementPlus)         // 使用 Element Plus 插件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.mount('#app')             // 挂载应用实例到 #app 元素  必须挂载后才能使用 Element Plus 组件库 才能渲染
