import { createRouter, createWebHistory } from 'vue-router'
import CommunityManagement from '../views/community/index.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      // 1. 数据概述
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据概述', icon: 'dashboard' },
        redirect: '/dashboard/statistics',
        children: [
          {
            path: 'dashboard/statistics',
            name: 'statistics',
            component: () => import('@/views/dashboard/statistics/index.vue'),
            meta: { title: '统计面板' }
          },
          {
            path: 'dashboard/map',
            name: 'visualization-map',
            component: () => import('@/views/dashboard/map/index.vue'),
            meta: { title: '可视化地图' }
          },
          {
            path: 'dashboard/china-map',
            name: 'chinaMap',
            component: () => import('@/views/dashboard/map/index.vue'),
            meta: {
              title: '全国用户分布',
              icon: 'map',
              auth: true
            }
          }
        ]
      },
      // 2. 商品管理
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/index.vue'),
        meta: { title: '商品管理', icon: 'shopping' },
        redirect: '/products/categories',
        children: [
          {
            path: 'categories',
            name: 'product-categories',
            component: () => import('@/views/products/categories/index.vue'),
            meta: { title: '商品类型管理' }
          },
          {
            path: 'list',
            name: 'product-list',
            component: () => import('@/views/products/list/index.vue'),
            meta: { title: '商品管理' }
          },
          {
            path: 'after-sales',
            name: 'after-sales',
            component: () => import('@/views/products/after-sales/index.vue'),
            meta: { title: '商品售后管理' }
          }
        ]
      },
      // 3. 客户管理
      {
        path: 'customers',
        name: 'customers',
        component: () => import('@/views/customers/index.vue'),
        meta: { title: '客户管理', icon: 'user' }
      },
      // 4. 标签管理
      {
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/tags/index.vue'),
        meta: { title: '标签管理', icon: 'tags' },
        redirect: '/tags/management',
        children: [
          {
            path: 'management',
            name: 'tag-management',
            component: () => import('@/views/tags/management/index.vue'),
            meta: { title: '标签管理' }
          },
          {
            path: 'records',
            name: 'search-records',
            component: () => import('@/views/tags/records/index.vue'),
            meta: { title: '查询记录' }
          }
        ]
      },
      {
        path: 'community',
        name: 'CommunityManagement',
        component: CommunityManagement,
        meta: { title: '社区管理' }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/pages/profile.vue'),
        meta: { title: '个人中心', hideInMenu: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' }
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