import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import CommunityView from '../views/CommunityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('../views/VerifyView.vue')
    },
    {
      path: '/',
      name: 'community',
      component: CommunityView,
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn

  // 验证页面允许直接访问
  if (to.name === 'verify') {
    next()
    return
  }

  // 需要登录的路由
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录用户不能访问登录/注册页
  if (to.meta.requiresGuest && isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router 