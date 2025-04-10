<template>
  <a-layout class="layout">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo">
        <img src="/logo.svg" alt="logo" />
        <h1 v-if="!collapsed">管理系统</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
      >
        <!-- 1. 数据概述 -->
        <a-sub-menu key="dashboard">
          <template #icon><dashboard-outlined /></template>
          <template #title>数据概述</template>
          <a-menu-item key="statistics">
            <router-link to="/dashboard/statistics">统计面板</router-link>
          </a-menu-item>
          <a-menu-item key="visualization-map">
            <router-link to="/dashboard/map">可视化地图</router-link>
          </a-menu-item>
        </a-sub-menu>

        <!-- 2. 商品管理 -->
        <a-sub-menu key="products">
          <template #icon><shopping-outlined /></template>
          <template #title>商品管理</template>
          <a-menu-item key="product-categories">
            <router-link to="/products/categories">商品类型管理</router-link>
          </a-menu-item>
          <a-menu-item key="product-list">
            <router-link to="/products/list">商品管理</router-link>
          </a-menu-item>
          <a-menu-item key="after-sales">
            <router-link to="/products/after-sales">商品售后管理</router-link>
          </a-menu-item>
        </a-sub-menu>

        <!-- 3. 客户管理 -->
        <a-menu-item key="customers">
          <template #icon><user-outlined /></template>
          <span>客户管理</span>
          <router-link to="/customers" />
        </a-menu-item>

        <!-- 4. 标签管理 -->
        <a-sub-menu key="tags">
          <template #icon><tags-outlined /></template>
          <template #title>标签管理</template>
          <a-menu-item key="tag-management">
            <router-link to="/tags/management">标签管理</router-link>
          </a-menu-item>
          <a-menu-item key="search-records">
            <router-link to="/tags/records">查询记录</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="community">
          <template #icon><comment-outlined /></template>
          <router-link to="community">社区管理</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <menu-fold-outlined
          v-if="!collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-unfold-outlined
          v-else
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <div class="right">
          <a-space>
            <a-badge :count="5">
              <bell-outlined class="icon" />
            </a-badge>
            <a-dropdown>
              <a-space>
                <a-avatar>
                  <template #icon><user-outlined /></template>
                </a-avatar>
                <span>管理员</span>
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="settings">
                    <setting-outlined />
                    <span>账号设置</span>
                  </a-menu-item>
                  <a-menu-item key="logout">
                    <logout-outlined />
                    <span>退出登录</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  CommentOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref([route.name])
const openKeys = ref([]) // 打开的子菜单数组

// 分析当前路由，设置选中的菜单项和打开的子菜单
watch(() => route.name, (newVal) => {
  selectedKeys.value = [newVal]
  
  // 根据当前路由确定应该打开哪个子菜单
  if (newVal.includes('statistics') || newVal.includes('visualization-map')) {
    !openKeys.value.includes('dashboard') && openKeys.value.push('dashboard')
  } else if (newVal.includes('product')) {
    !openKeys.value.includes('products') && openKeys.value.push('products')
  } else if (newVal.includes('tag') || newVal.includes('search-records')) {
    !openKeys.value.includes('tags') && openKeys.value.push('tags')
  }
}, { immediate: true })
</script>

<style scoped lang="less">
.layout {
  height: 100vh;
  overflow: hidden;
  
  .logo {
    height: 64px;
    padding: 16px;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    
    img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }
    
    h1 {
      color: white;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .trigger {
    font-size: 18px;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }

  .right {
    .icon {
      font-size: 16px;
      cursor: pointer;
      padding: 4px 12px;

      &:hover {
        color: #1890ff;
      }
    }
  }
}

.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  overflow: auto;
  height: calc(100vh - 112px); /* 减去header高度和上下margin */
}
</style> 