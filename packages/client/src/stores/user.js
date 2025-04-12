import { defineStore } from 'pinia'
import request from '../api/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    async login(username, password) {
      try {
        const res = await request.post('/login', { username, password })
        this.setToken(res.token)
        this.setUser(res.data)
        return res
      } catch (error) {
        throw error
      }
    },

    async register(userData) {
      try {
        const res = await request.post('/register', userData)
        this.setToken(res.token)
        this.setUser(res.data)
        return res
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}) 