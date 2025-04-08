<template>
  <a-layout class="layout">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo">
        <img src="/logo.svg" alt="logo" />
        <h1 v-if="!collapsed">管理系统</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
      >
        <a-menu-item key="dashboard">
          <dashboard-outlined />
          <span>数据可视化面板</span>
          <router-link to="/" />
        </a-menu-item>
        <a-menu-item key="products">
          <shopping-outlined />
          <span>商品管理</span>
          <router-link to="/products" />
        </a-menu-item>
        <a-menu-item key="customers">
          <user-outlined />
          <span>客户管理</span>
          <router-link to="/customers" />
        </a-menu-item>
        <a-menu-item key="tags">
          <tags-outlined />
          <span>标签管理</span>
          <router-link to="/tags" />
        </a-menu-item>
        <a-menu-item key="pages">
          <file-outlined />
          <span>网页管理</span>
          <router-link to="/pages" />
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  FileOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref([route.name])
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