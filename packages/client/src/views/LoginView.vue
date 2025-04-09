<template>
  <div class="login-container">
    <!-- 背景动画 -->
    <div class="background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <van-form @submit="onSubmit" class="login-form">
      <h2>登录</h2>
      
      <van-field
        v-model="phone"
        name="phone"
        label="手机号"
        placeholder="请输入手机号"
        :rules="[{ required: true, message: '请输入手机号' }]"
      />
      
      <van-field
        v-model="password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      />

      <div class="form-actions">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit" 
          :loading="loading"
        >
          登录
        </van-button>

        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)

const onSubmit = async () => {
  try {
    loading.value = true
    await userStore.login(phone.value, password.value)
    showToast({
      type: 'success',
      message: '登录成功'
    })
    router.push('/')
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.response?.data?.message || '登录失败'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(45deg, #FF512F, #DD2476);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background {
  .shape {
    height: 200px;
    width: 200px;
    position: absolute;
    border-radius: 50%;
    animation-duration: 6s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    
    &.shape-1 {
      background: linear-gradient(#1845ad, #23a2f6);
      left: -80px;
      top: -80px;
      animation-name: float;
    }
    
    &.shape-2 {
      background: linear-gradient(to right, #ff512f, #f09819);
      right: -30px;
      bottom: -80px;
      animation-name: float-reverse;
    }
  }
}

.login-form {
  width: 85%;
  max-width: 380px;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;

  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-weight: 500;
    font-size: 28px;
    letter-spacing: 2px;
  }

  :deep(.van-cell) {
    background: transparent;
    margin-bottom: 15px;
    font-size: 16px;

    .van-field__label {
      font-weight: 500;
      color: #333;
    }

    .van-field__control {
      color: #666;
      &::placeholder {
        color: #999;
      }
    }
  }

  .form-actions {
    margin-top: 30px;

    .van-button {
      height: 44px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 2px;
      background: linear-gradient(45deg, #FF512F, #DD2476);
      border: none;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;

      a {
        color: #DD2476;
        text-decoration: none;
        font-weight: 500;
        margin-left: 4px;
      }
    }
  }
}
</style> 