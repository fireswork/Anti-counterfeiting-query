<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="card-header">
        <img src="/logo.png" alt="Logo" class="logo" />
        <h1>找回密码</h1>
        <p>请选择验证方式重设您的密码</p>
      </div>
      
      <div class="card-body">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="email" tab="邮箱找回">
            <a-form
              :model="emailForm"
              name="email-reset"
              @finish="onEmailSubmit"
              layout="vertical"
            >
              <a-form-item
                name="email"
                label="邮箱地址"
                :rules="[
                  { required: true, message: '请输入您的邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]"
              >
                <a-input v-model:value="emailForm.email" placeholder="请输入注册时使用的邮箱" />
              </a-form-item>
              
              <a-form-item
                name="verificationCode"
                label="验证码"
                :rules="[{ required: true, message: '请输入验证码' }]"
              >
                <div class="verification-code-input">
                  <a-input v-model:value="emailForm.verificationCode" placeholder="请输入验证码" />
                  <a-button 
                    type="primary" 
                    :disabled="emailCodeSending || emailCountdown > 0"
                    @click="sendEmailCode"
                  >
                    {{ emailCountdown > 0 ? `重新发送(${emailCountdown}s)` : '获取验证码' }}
                  </a-button>
                </div>
              </a-form-item>
              
              <a-form-item
                name="newPassword"
                label="新密码"
                :rules="[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不少于6位' }
                ]"
              >
                <a-input-password v-model:value="emailForm.newPassword" placeholder="请输入新密码" />
              </a-form-item>
              
              <a-form-item
                name="confirmPassword"
                label="确认密码"
                :rules="[
                  { required: true, message: '请确认新密码' },
                  { validator: validateEmailConfirmPassword }
                ]"
              >
                <a-input-password v-model:value="emailForm.confirmPassword" placeholder="请再次输入新密码" />
              </a-form-item>
              
              <a-form-item>
                <a-button 
                  type="primary" 
                  html-type="submit" 
                  :loading="emailSubmitting" 
                  block
                >
                  重设密码
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          
          <a-tab-pane key="phone" tab="手机找回">
            <a-form
              :model="phoneForm"
              name="phone-reset"
              @finish="onPhoneSubmit"
              layout="vertical"
            >
              <a-form-item
                name="phone"
                label="手机号码"
                :rules="[
                  { required: true, message: '请输入您的手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]"
              >
                <a-input v-model:value="phoneForm.phone" placeholder="请输入注册时使用的手机号" />
              </a-form-item>
              
              <a-form-item
                name="verificationCode"
                label="验证码"
                :rules="[{ required: true, message: '请输入验证码' }]"
              >
                <div class="verification-code-input">
                  <a-input v-model:value="phoneForm.verificationCode" placeholder="请输入验证码" />
                  <a-button 
                    type="primary" 
                    :disabled="phoneCodeSending || phoneCountdown > 0"
                    @click="sendPhoneCode"
                  >
                    {{ phoneCountdown > 0 ? `重新发送(${phoneCountdown}s)` : '获取验证码' }}
                  </a-button>
                </div>
              </a-form-item>
              
              <a-form-item
                name="newPassword"
                label="新密码"
                :rules="[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不少于6位' }
                ]"
              >
                <a-input-password v-model:value="phoneForm.newPassword" placeholder="请输入新密码" />
              </a-form-item>
              
              <a-form-item
                name="confirmPassword"
                label="确认密码"
                :rules="[
                  { required: true, message: '请确认新密码' },
                  { validator: validatePhoneConfirmPassword }
                ]"
              >
                <a-input-password v-model:value="phoneForm.confirmPassword" placeholder="请再次输入新密码" />
              </a-form-item>
              
              <a-form-item>
                <a-button 
                  type="primary" 
                  html-type="submit" 
                  :loading="phoneSubmitting" 
                  block
                >
                  重设密码
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </div>
      
      <div class="card-footer">
        <div class="back-to-login">
          <span>想起密码了？</span>
          <router-link to="/community/login">返回登录</router-link>
        </div>
        
        <div class="help-links">
          <a @click="showContactSupport">联系客服</a>
          <a @click="showCommonProblems">常见问题</a>
        </div>
      </div>
    </div>
    
    <!-- 联系客服弹窗 -->
    <a-modal
      v-model:open="supportModalVisible"
      title="联系客服"
      :footer="null"
      width="400px"
    >
      <div class="support-modal-content">
        <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
        <p><strong>客服热线：</strong>400-888-9999</p>
        <p><strong>客服邮箱：</strong>support@example.com</p>
        <div class="qr-code">
          <p>微信扫码添加客服</p>
          <div class="qr-placeholder">
            <img src="/images/support-qr.png" alt="客服二维码" onerror="this.src='https://via.placeholder.com/120x120?text=QR+Code'" />
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- 常见问题弹窗 -->
    <a-modal
      v-model:open="problemsModalVisible"
      title="找回密码常见问题"
      :footer="null"
      width="600px"
    >
      <div class="problems-modal-content">
        <a-collapse>
          <a-collapse-panel key="1" header="无法收到验证码怎么办？">
            <p>1. 请检查您输入的手机号/邮箱是否正确</p>
            <p>2. 短信可能存在延迟，请耐心等待1-3分钟</p>
            <p>3. 检查垃圾邮件文件夹，邮件可能被误判为垃圾邮件</p>
            <p>4. 如果长时间未收到，请点击重新发送</p>
            <p>5. 联系客服获取进一步帮助</p>
          </a-collapse-panel>
          
          <a-collapse-panel key="2" header="忘记注册邮箱或手机号码怎么办？">
            <p>若您已忘记注册时使用的邮箱或手机号，请联系客服提供以下信息进行身份验证：</p>
            <p>1. 您的用户名</p>
            <p>2. 个人基本信息</p>
            <p>3. 最近登录时间和地点</p>
            <p>4. 其他可以证明您身份的信息</p>
          </a-collapse-panel>
          
          <a-collapse-panel key="3" header="密码重置后无法登录怎么办？">
            <p>1. 请确认您使用的是新设置的密码</p>
            <p>2. 密码区分大小写，请检查输入是否正确</p>
            <p>3. 尝试清除浏览器缓存后再次登录</p>
            <p>4. 若仍无法登录，请联系客服获取帮助</p>
          </a-collapse-panel>
          
          <a-collapse-panel key="4" header="多次尝试找回密码被锁定怎么办？">
            <p>系统会在多次错误尝试后暂时锁定找回密码功能，以保护账户安全。您可以：</p>
            <p>1. 等待30分钟后再次尝试</p>
            <p>2. 联系客服解除锁定</p>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-modal>
    
    <!-- 操作结果弹窗 -->
    <a-modal
      v-model:open="resultModalVisible"
      :title="resultModalTitle"
      :footer="null"
      width="400px"
    >
      <div class="result-modal-content" :class="resultModalSuccess ? 'success' : 'error'">
        <div class="result-icon">
          <check-circle-filled v-if="resultModalSuccess" />
          <close-circle-filled v-else />
        </div>
        <p>{{ resultModalMessage }}</p>
        <div class="result-actions">
          <a-button 
            v-if="resultModalSuccess" 
            type="primary" 
            @click="goToLogin"
          >
            前往登录
          </a-button>
          <a-button 
            v-else 
            @click="resultModalVisible = false"
          >
            我知道了
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'

const router = useRouter()
const activeTab = ref('email')

// 邮箱找回表单
const emailForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 手机找回表单
const phoneForm = reactive({
  phone: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 倒计时状态
const emailCountdown = ref(0)
const phoneCountdown = ref(0)
const emailCodeSending = ref(false)
const phoneCodeSending = ref(false)

// 提交状态
const emailSubmitting = ref(false)
const phoneSubmitting = ref(false)

// 模态框状态
const supportModalVisible = ref(false)
const problemsModalVisible = ref(false)
const resultModalVisible = ref(false)
const resultModalTitle = ref('')
const resultModalMessage = ref('')
const resultModalSuccess = ref(false)

// 校验确认密码
const validateEmailConfirmPassword = async (rule, value) => {
  if (value !== emailForm.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const validatePhoneConfirmPassword = async (rule, value) => {
  if (value !== phoneForm.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!emailForm.email) {
    message.error('请先输入邮箱地址')
    return
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.email)) {
    message.error('请输入有效的邮箱地址')
    return
  }
  
  emailCodeSending.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success(`验证码已发送至邮箱：${emailForm.email}`)
    startEmailCountdown()
  } catch (error) {
    message.error('验证码发送失败，请稍后重试')
  } finally {
    emailCodeSending.value = false
  }
}

// 发送手机验证码
const sendPhoneCode = async () => {
  if (!phoneForm.phone) {
    message.error('请先输入手机号码')
    return
  }
  
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phoneForm.phone)) {
    message.error('请输入有效的手机号码')
    return
  }
  
  phoneCodeSending.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success(`验证码已发送至手机：${phoneForm.phone}`)
    startPhoneCountdown()
  } catch (error) {
    message.error('验证码发送失败，请稍后重试')
  } finally {
    phoneCodeSending.value = false
  }
}

// 邮箱倒计时
const startEmailCountdown = () => {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 手机倒计时
const startPhoneCountdown = () => {
  phoneCountdown.value = 60
  const timer = setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 提交邮箱找回表单
const onEmailSubmit = async () => {
  emailSubmitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟成功
    showResultModal(true, '密码重置成功', '您的密码已重置成功，请使用新密码登录')
    
    // 清空表单
    emailForm.email = ''
    emailForm.verificationCode = ''
    emailForm.newPassword = ''
    emailForm.confirmPassword = ''
  } catch (error) {
    showResultModal(false, '密码重置失败', '密码重置过程中出现错误，请稍后重试')
  } finally {
    emailSubmitting.value = false
  }
}

// 提交手机找回表单
const onPhoneSubmit = async () => {
  phoneSubmitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟成功
    showResultModal(true, '密码重置成功', '您的密码已重置成功，请使用新密码登录')
    
    // 清空表单
    phoneForm.phone = ''
    phoneForm.verificationCode = ''
    phoneForm.newPassword = ''
    phoneForm.confirmPassword = ''
  } catch (error) {
    showResultModal(false, '密码重置失败', '密码重置过程中出现错误，请稍后重试')
  } finally {
    phoneSubmitting.value = false
  }
}

// 显示结果弹窗
const showResultModal = (success, title, message) => {
  resultModalSuccess.value = success
  resultModalTitle.value = title
  resultModalMessage.value = message
  resultModalVisible.value = true
}

// 显示联系客服弹窗
const showContactSupport = () => {
  supportModalVisible.value = true
}

// 显示常见问题弹窗
const showCommonProblems = () => {
  problemsModalVisible.value = true
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/community/login')
}
</script>

<style scoped lang="less">
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
  
  .forgot-password-card {
    width: 100%;
    max-width: 500px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .card-header {
      padding: 24px 24px 0;
      text-align: center;
      
      .logo {
        height: 50px;
        margin-bottom: 16px;
      }
      
      h1 {
        font-size: 24px;
        color: #262626;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 14px;
        color: #8c8c8c;
        margin-bottom: 16px;
      }
    }
    
    .card-body {
      padding: 24px;
      
      .verification-code-input {
        display: flex;
        
        .ant-input {
          flex: 1;
          margin-right: 12px;
        }
        
        .ant-btn {
          width: 120px;
        }
      }
    }
    
    .card-footer {
      padding: 16px 24px 24px;
      border-top: 1px solid #f0f0f0;
      
      .back-to-login {
        text-align: center;
        margin-bottom: 12px;
        
        span {
          color: #595959;
          margin-right: 4px;
        }
        
        a {
          color: #1890ff;
        }
      }
      
      .help-links {
        display: flex;
        justify-content: center;
        
        a {
          color: #8c8c8c;
          margin: 0 8px;
          
          &:hover {
            color: #1890ff;
          }
        }
      }
    }
  }
  
  // 客服模态框样式
  .support-modal-content {
    p {
      margin-bottom: 12px;
    }
    
    .qr-code {
      text-align: center;
      margin-top: 16px;
      
      p {
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .qr-placeholder {
        width: 120px;
        height: 120px;
        margin: 0 auto;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
  
  // 常见问题模态框样式
  .problems-modal-content {
    max-height: 60vh;
    overflow-y: auto;
    
    p {
      margin-bottom: 8px;
    }
  }
  
  // 结果模态框样式
  .result-modal-content {
    text-align: center;
    padding: 16px 0;
    
    .result-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    &.success .result-icon {
      color: #52c41a;
    }
    
    &.error .result-icon {
      color: #f5222d;
    }
    
    p {
      font-size: 16px;
      margin-bottom: 24px;
    }
    
    .result-actions {
      .ant-btn {
        min-width: 120px;
      }
    }
  }
}

@media (max-width: 576px) {
  .forgot-password-container {
    padding: 16px;
    
    .forgot-password-card {
      .card-body {
        padding: 16px;
        
        .verification-code-input {
          .ant-btn {
            width: 110px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style> 