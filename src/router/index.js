import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据可视化面板', }
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/index.vue'),
        meta: { title: '商品管理', }
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('@/views/customers/index.vue'),
        meta: { title: '客户管理', }
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/tags/index.vue'),
        meta: { title: '标签管理', }
      },
      {
        path: 'pages',
        name: 'pages',
        component: () => import('@/views/pages/index.vue'),
        meta: { title: '网页管理', }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 管理系统` : '管理系统'
  
  // 检查是否需要登录验证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 