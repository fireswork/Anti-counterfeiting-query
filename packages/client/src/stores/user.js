import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      // 设置axios默认header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    async login(phone, password) {
      try {
        const { data } = await axios.post('/api/login', { phone, password })
        this.setToken(data.token)
        this.setUser(data.user)
        return data
      } catch (error) {
        throw error
      }
    },

    async register(userData) {
      try {
        const { data } = await axios.post('/api/register', userData)
        this.setToken(data.token)
        this.setUser(data.user)
        return data
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    }
  }
}) 