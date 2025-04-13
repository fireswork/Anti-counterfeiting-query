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
          <div class="avatar-container">
            <img
              v-if="formData.avatar"
              :src="formData.avatar"
              alt="头像"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              <van-icon name="photograph" size="24" />
              <span>上传头像</span>
            </div>
            <div class="avatar-mask" v-if="formData.avatar">
              <van-icon name="photograph" size="20" />
              <span>更换头像</span>
            </div>
          </div>
        </van-uploader>
      </div>

      <van-field
        v-model="formData.nickName"
        name="phone"
        label="昵称"
        placeholder="请输入昵称"
        :rules="[
          { required: true, message: '请输入昵称' },
        ]"
      />
      
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
          { min: 6, max: 16, message: '密码长度应在6-16个字符之间' }
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
          <van-radio-group v-model="formData.sex" direction="horizontal" class="gender-group">
            <van-radio name="1">男</van-radio>
            <van-radio name="0">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

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
        :img="cropperImage"
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
import request from '@/api/request'
import 'animate.css'

const router = useRouter()
const cropperRef = ref(null)

const formData = reactive({
  nickName: '',
  phone: '',
  email: '',
  password: '',
  sex: '1',
  avatar: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const fileList = ref([])
const showCropper = ref(false)
const cropperImage = ref('')


// 验证确认密码
const validateConfirmPassword = () => {
  return formData.password === confirmPassword.value
}

// 图片上传前处理
const beforeRead = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    showToast('只能上传图片文件！')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    showToast('图片大小不能超过2MB！')
    return false
  }

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
    formData.avatar = data
    showCropper.value = false
    fileList.value = [{
      url: data,
      isImage: true
    }]
  })
}

// 取消裁切
const cancelCrop = () => {
  cropperImage.value = ''
  showCropper.value = false
  fileList.value = []
}

// 删除头像
const onDelete = () => {
  formData.avatar = ''
  fileList.value = []
}

const onSubmit = async () => {
  try {
    loading.value = true
    
    // 创建 FormData 对象
    const formDataObj = new FormData()
    
    // 如果有头像，将base64转为blob
    if (formData.avatar) {
      const arr = formData.avatar.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      
      const blob = new Blob([u8arr], { type: mime })
      formDataObj.append('avatarFile', blob, 'avatar.png')
    }
    
    // 添加其他表单数据
    formDataObj.append('nickName', formData.nickName)
    formDataObj.append('password', formData.password)
    formDataObj.append('phonenumber', formData.phone)
    formDataObj.append('email', formData.email)
    formDataObj.append('sex', formData.sex)

    // 调用注册接口
    const res = await request.post('/mRegister', formDataObj)
    
    if (res.code === 200) {
      showToast({
        type: 'success',
        message: '注册成功'
      })
      router.push('/login')
    } else {
      throw new Error(data.msg || '注册失败')
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.message || '注册失败'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
:deep(.van-uploader__preview) {
  img {
    border-radius: 100%;
  }
}
.vue-cropper {
  height: 200px;
}
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
    animation-duration: 15s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    
    &.shape-1 {
      background: linear-gradient(#1845ad, #23a2f6);
      left: -80px;
      top: -80px;
      animation-name: diagonal-float;
      transform-origin: center center;
    }
    
    &.shape-2 {
      background: linear-gradient(to right, #ff512f, #f09819);
      right: -30px;
      bottom: -80px;
      animation-name: diagonal-float-reverse;
      transform-origin: center center;
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

    .avatar-container {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto;
      border-radius: 50%;
      overflow: hidden;
      background-color: #f0f2f5;

      .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: #969799;
        font-size: 14px;

        .van-icon {
          margin-bottom: 8px;
        }
      }

      .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 14px;

        .van-icon {
          margin-bottom: 8px;
        }
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