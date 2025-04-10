<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="collapsed"
    @click="handleMenuClick"
  >
    <a-menu-item key="home">
      <template #icon><HomeOutlined /></template>
      <span>首页</span>
    </a-menu-item>
    <a-menu-item key="user-management">
      <template #icon><UserOutlined /></template>
      <span>用户管理</span>
    </a-menu-item>
    <a-menu-item key="shop-management">
      <template #icon><ShopOutlined /></template>
      <span>店铺管理</span>
    </a-menu-item>
    <a-menu-item key="safety-certificate-management">
      <template #icon><SafetyCertificateOutlined /></template>
      <span>安全证书管理</span>
    </a-menu-item>
    <a-menu-item key="bar-chart-management">
      <template #icon><BarChartOutlined /></template>
      <span>数据分析</span>
    </a-menu-item>
    <a-menu-item key="setting-management">
      <template #icon><SettingOutlined /></template>
      <span>系统设置</span>
    </a-menu-item>
    <a-menu-item key="tags-management">
      <template #icon><TagsOutlined /></template>
      <span>标签管理</span>
    </a-menu-item>
    <a-menu-item key="community">
      <template #icon><CommentOutlined /></template>
      <span>社区管理</span>
    </a-menu-item>
  </a-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeOutlined,
  UserOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SettingOutlined,
  TagsOutlined,
  CommentOutlined
} from '@ant-design/icons-vue'

// ... existing code ...
</script> 