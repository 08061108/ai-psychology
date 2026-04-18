import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 初始化：尝试从本地存储恢复数据
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 设置用户信息（登录时调用）
  const setUser = (data, userToken) => {
    token.value = userToken
    userInfo.value = data
    localStorage.setItem('token', userToken)
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  // 清除用户信息（登出时调用）
  const clearUser = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 计算属性：判断是否已登录
  const isLogin = () => !!token.value

  // 计算属性：获取用户类型 (1:普通用户, 2:管理员)
  const userType = () => userInfo.value.userType || 0

  return {
    token,
    userInfo,
    setUser,
    clearUser,
    isLogin,
    userType
  }
})