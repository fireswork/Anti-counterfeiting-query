<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h1>管理系统</h1>
      </div>
      
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="login-form"
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

        <div class="login-form-remember">
          <a-checkbox v-model:checked="formData.remember">记住我</a-checkbox>
          <a class="login-form-forgot">忘记密码?</a>
        </div>

        <a-form-item>
          <a-button 
            type="primary" 
            html-type="submit" 
            size="large" 
            :loading="loading" 
            class="login-form-button"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const formRef = ref(null)
const formData = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleFinish = async (values) => {
  loading.value = true
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中应该调用登录API
    // const response = await login(values)
    // localStorage.setItem('token', response.token)
    
    // 模拟登录成功，存储 token
    localStorage.setItem('token', 'mock-token')
    
    message.success('登录成功')
    router.push('/')
  } catch (error) {
    message.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
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

.login-form-wrapper {
  width: 380px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.login-header {
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

.login-form {
  .login-form-remember {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  
  .login-form-button {
    width: 100%;
  }
  
  .login-form-forgot {
    color: #1890ff;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 