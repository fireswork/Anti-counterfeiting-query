<template>
  <div class="register-container">
    <!-- 背景动画 -->
    <div class="background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <van-form @submit="onSubmit" class="register-form">
      <h2>注册</h2>
      
      <!-- 头像上传 -->
      <div class="avatar-upload">
        <van-uploader
          v-model="fileList"
          :max-count="1"
          :before-read="beforeRead"
          :after-read="afterRead"
          @delete="onDelete"
        >
          <div class="upload-area" v-if="!formData.avatar">
            <van-icon name="photograph" size="24" />
            <span>上传头像</span>
          </div>
          <div class="avatar-preview" v-else>
            <img :src="formData.avatar" alt="avatar">
          </div>
        </van-uploader>
      </div>
      
      <van-field
        v-model="formData.phone"
        name="phone"
        label="手机号"
        placeholder="请输入手机号"
        :rules="[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
        ]"
      />

      <van-field
        v-model="formData.email"
        name="email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="[
          { required: true, message: '请输入邮箱' },
          { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式' }
        ]"
      />

      <van-field
        v-model="formData.password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="[
          { required: true, message: '请输入密码' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/, message: '密码必须包含大小写字母和数字，长度8-20位' }
        ]"
      />

      <van-field
        v-model="confirmPassword"
        type="password"
        name="confirmPassword"
        label="确认密码"
        placeholder="请再次输入密码"
        :rules="[
          { required: true, message: '请确认密码' },
          { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
        ]"
      />

      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="formData.gender" direction="horizontal" class="gender-group">
            <van-radio name="1">男</van-radio>
            <van-radio name="2">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <van-field
        v-model="formData.age"
        type="digit"
        name="age"
        label="年龄"
        placeholder="请输入年龄"
        :rules="[
          { required: true, message: '请输入年龄' },
          { validator: validateAge, message: '年龄必须在1-120岁之间' }
        ]"
      />

      <div class="form-actions">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit"
          :loading="loading"
        >
          注册
        </van-button>

        <div class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </van-form>

    <!-- 图片裁切弹窗 -->
    <van-dialog v-model:show="showCropper" title="裁切头像" :show-confirm-button="false" class="cropper-dialog">
      <vue-cropper
        ref="cropperRef"
        :src="cropperImage"
        :aspect-ratio="1"
        :view-mode="1"
        :auto-crop-area="0.8"
        :background="true"
        :movable="true"
        :zoomable="true"
        :guides="true"
      />
      <template #footer>
        <div class="cropper-buttons">
          <van-button plain @click="cancelCrop">取消</van-button>
          <van-button type="primary" @click="cropImage">确认</van-button>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import 'animate.css'

const router = useRouter()
const userStore = useUserStore()
const cropperRef = ref(null)

const formData = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  gender: 'male',
  age: '',
  avatar: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const fileList = ref([])
const avatar = ref('')
const showCropper = ref(false)
const cropperImage = ref('')

// 验证年龄
const validateAge = (val) => {
  const age = parseInt(val)
  return age > 0 && age <= 120
}

// 验证确认密码
const validateConfirmPassword = () => {
  return formData.password === confirmPassword.value
}

// 图片上传前处理
const beforeRead = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperImage.value = e.target.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  return false
}

// 裁切图片
const cropImage = () => {
  cropperRef.value.getCropData((data) => {
    avatar.value = data
    formData.avatar = data
    showCropper.value = false
  })
}

// 删除头像
const onDelete = () => {
  avatar.value = ''
  formData.avatar = ''
}

const onSubmit = async () => {
  try {
    loading.value = true
    await userStore.register(formData)
    showToast({
      type: 'success',
      message: '注册成功'
    })
    router.push('/')
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.response?.data?.message || '注册失败'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.register-container {
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

.register-form {
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

  .avatar-upload {
    text-align: center;
    margin-bottom: 30px;

    .upload-area {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      border: 2px dashed #dcdee0;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #969799;

      span {
        margin-top: 8px;
        font-size: 14px;
      }
    }

    .avatar-preview {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      border-radius: 50%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
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

  .gender-group {
    display: flex;
    justify-content: flex-start;
    padding: 10px 0;
    gap: 32px;

    :deep(.van-radio) {
      align-items: center;
      margin: 0;

      .van-radio__label {
        color: #666;
        margin-left: 4px;
        font-size: 14px;
      }

      .van-radio__icon {
        .van-icon {
          border-color: #dcdee0;
        }
      }

      &.van-radio--checked {
        .van-radio__label {
          color: #DD2476;
        }
        .van-radio__icon {
          .van-icon {
            background-color: #DD2476;
            border-color: #DD2476;
          }
        }
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

    .login-link {
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

.cropper-dialog {
  :deep(.van-dialog__content) {
    padding: 20px;
  }

  :deep(.van-dialog__header) {
    font-weight: 500;
    font-size: 18px;
    padding-top: 20px;
  }

  .cropper-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px 16px;
    gap: 12px;
  }

  :deep(.van-button) {
    height: 36px;
    font-size: 14px;
    font-weight: 500;

    &--primary {
      background: linear-gradient(45deg, #FF512F, #DD2476);
      border: none;
    }
  }
}
</style> 