import axios from 'axios'
import { showToast, showDialog } from 'vant'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api', // API的基础URL
  timeout: 10000, // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里设置请求头等配置
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据自己的API响应格式进行处理
    if (res.code !== 200) {      
      // 处理特定的错误码
      if (res.code === 401) {
        // 401: 未登录或token过期
        // 可以在这里清除本地登录信息并跳转到登录页
        showToast({
          type: 'fail',
          message: '登录已过期，请重新登录'
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.replace('/login')
      } else {
        showToast({
          type: 'fail',
          message: res.message || res.msg || '请求出错'
        })
      }
      return Promise.reject(new Error(res.message || res.msg || '请求出错'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          showToast({
            type: 'fail',
            message: '登录已过期，请重新登录'
          })
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
          break
        case 403:
          showToast({
            type: 'fail',
            message: '没有权限访问该资源'
          })
          break
        case 404:
          showToast({
            type: 'fail',
            message: '请求的资源不存在'
          })
          break
        case 500:
          showToast({
            type: 'fail',
            message: '服务器内部错误'
          })
          break
        default:
          showToast({
            type: 'fail',
            message: data.message || `请求失败(${status})`
          })
      }
    } else if (error.request) {
      showToast({
        type: 'fail',
        message: '网络异常，请检查您的网络连接'
      })
    } else {
      showToast({
        type: 'fail',
        message: '请求配置错误'
      })
    }
    
    return Promise.reject(error)
  }
)

export default request 