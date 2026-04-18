import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api',    // 请求路径前缀
  timeout: 5000,      // 请求的超时时间  超过这个时间请求未响应则报错
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {                       // config(object) 是 axios 请求拦截器的参数 完整的请求配置对象，包含默认配置 + 当前请求配置

    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token               // 身份验证，将 token 添加到请求头中
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么  请求拦截器的 error：请求还没发出去，前端自己报错了。
    return Promise.reject(error)  // 返回拒绝的 Promise，触发错误处理
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {                           // response(object) 是 axios 响应拦截器的参数 完整的响应对象，包含服务器响应数据 + 响应元数据
    // 对响应数据做点什么
    // 检查业务状态码  - 一些业务逻辑出错了 比如登录过期、权限不足、余额不足等，需要处理一下
    const { data, config } = response
    if (data.code === '200') {
      return data.data
    } else {
      if (data.code === '-1') {
        if (!config.url?.includes('/login')) {            //?.includes() 方法判断字符串是否包含指定的值，返回布尔值
          ElMessage.error(data.msg || '登录过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/auth/login' // 跳转到登录页
        } else {
          ElMessage.error(data.msg || '登录过期，请重新登录')
          return Promise.reject('网络请求失败....')
        }
      }
    }
    return response
  },
  (error) => {
    // 对响应错误做点什么   响应拦截器的 error：请求发出去了，但后端返回了错误状态码或网络不通。
    return Promise.reject(error)
  }
)

export default service