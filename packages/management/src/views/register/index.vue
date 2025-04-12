<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="register-header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h1>管理系统</h1>
      </div>
      
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="register-form"
        @finish="handleFinish"
      >
        <a-form-item name="username">
          <a-input 
            v-model:value="formData.username" 
            placeholder="用户名"
            size="large"
          >
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        
        <a-form-item name="password">
          <a-input-password
            v-model:value="formData.password"
            placeholder="密码"
            size="large"
          >
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>
        
        <a-form-item name="confirmPassword">
          <a-input-password
            v-model:value="formData.confirmPassword"
            placeholder="确认密码"
            size="large"
          >
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button 
            type="primary" 
            html-type="submit" 
            size="large" 
            :loading="loading" 
            class="register-form-button"
          >
            注册
          </a-button>
        </a-form-item>
        
        <div class="register-form-login">
          <span>已有账号？</span>
          <a @click="goToLogin">返回登录</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import request from '@/api/request'

const router = useRouter()
const loading = ref(false)
const formRef = ref(null)
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = async (rule, value) => {
  if (!value) {
    return Promise.reject('请确认密码')
  }
  if (value !== formData.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const goToLogin = () => {
  router.push('/login')
}

const handleFinish = async (values) => {
  loading.value = true
  
  try {
    await request.post('/register', {
      username: values.username,
      password: values.password
    })
    message.success('注册成功')
    router.push('/login')
  } catch (error) {
    message.error('注册失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
}

.register-form-wrapper {
  width: 380px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    width: 44px;
    height: 44px;
    margin-right: 8px;
  }
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    margin-top: 12px;
    color: rgba(0, 0, 0, 0.85);
  }
}

.register-form {
  .register-form-button {
    width: 100%;
  }
  
  .register-form-login {
    text-align: center;
    margin-top: 16px;
    
    a {
      color: #1890ff;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style> 