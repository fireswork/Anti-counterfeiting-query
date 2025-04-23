<template>
  <div class="verify-container">
    <!-- 背景动画 -->
    <div class="background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="verify-card" v-if="isMounted">
      <div class="verify-result">
        <van-icon
          :name="verifyData.verificationResult === '1' ? 'checked' : 'clear'"
          :class="verifyData.verificationResult === '1' ? 'success' : 'fail'"
        />
        <h2 :class="verifyData.verificationResult === '1' ? 'success' : 'fail'">
          {{ verifyData.verificationResult === '1' ? '验证通过' : '验证失败' }}
        </h2>
        <div v-if="verifyData.verificationResult === '1'" class="infos">
          <p><img :src="`https://second.uwork.tech/prod-api${verifyData.productImage}`" /></p>
          <p>商品名称：{{ verifyData.productName }}</p>
          <p>商品描述：{{ verifyData.productDesc }}</p>
          <p>验证次数：{{ verifyData.verificationCount }}</p>
        </div>
        <van-button type="primary" @click="goLogin" class="goLogin">去登录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const verifyData = ref({})
const isMounted = ref(false)

const goLogin = () => {
  router.push('/login')
}

const getVerifyResult = async () => {
  const loading = showLoadingToast({
    message: '验证中...',
    forbidClick: true
  })

  try {
    const tagData = route.query.tagData
    if (!tagData) {
      throw new Error('无效的防伪码')
    }

    const res = await request.get('/verify?tagData=' + tagData)
    if (res.code === 200) {
      verifyData.value = res.data
    } else {
      throw new Error(res.msg || '验证失败')
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.message
    })
  } finally {
    loading.close()
    isMounted.value = true
  }
}

onMounted(() => {
  getVerifyResult()
})
</script>

<style lang="less" scoped>
.verify-container {
  background: linear-gradient(45deg, #ff512f, #dd2476);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 100vh;
}

.goLogin {
  width: 100%;
}

.infos {
  img {
    width: 100px;
  }
}

.background {
  .shape {
    height: 200px;
    width: 200px;
    position: absolute;
    border-radius: 50%;

    &.shape-1 {
      background: linear-gradient(#1845ad, #23a2f6);
      left: -80px;
      top: -80px;
      animation: float 6s ease-in-out infinite;
    }

    &.shape-2 {
      background: linear-gradient(to right, #ff512f, #f09819);
      right: -30px;
      bottom: -80px;
      animation: float 8s ease-in-out infinite reverse;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.verify-card {
  width: 90%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.verify-result {
  text-align: center;

  .van-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 28px;
    margin: 0 0 16px;
    font-weight: 500;
  }

  .success {
    color: #52c41a;
  }

  .fail {
    color: #ff4d4f;
  }
}
</style>
