<script setup>
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// 设置 ant-design-vue 的语言为中文
ConfigProvider.config({
  locale: zhCN
})
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<style>
/* 全局样式 */
</style>
