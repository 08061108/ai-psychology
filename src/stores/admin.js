import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const isCollapse = ref(false)

  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value  // 切换侧边栏折叠状态
  }

  return {
    isCollapse,
    toggleCollapse
  }
})