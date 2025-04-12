<template>
  <div class="community-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="社区"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="plus" size="20" @click="showPostDialog = true" />
      </template>
    </van-nav-bar>

    <!-- 帖子列表 -->
    <div class="post-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="post-item" v-for="post in posts" :key="post.id">
            <!-- 用户信息 -->
            <div class="post-header">
              <van-image
                round
                width="40"
                height="40"
                :src="post.avatar"
                :alt="post.username"
              />
              <div class="user-info">
                <div class="username">{{ post.username }}</div>
                <div class="post-time">{{ post.createTime }}</div>
              </div>
            </div>
            
            <!-- 帖子内容 -->
            <div class="post-content">
              <p class="text-content">{{ post.content }}</p>
              <div class="image-list" v-if="post.images && post.images.length">
                <van-image
                  v-for="(image, index) in post.images"
                  :key="index"
                  :src="image"
                  width="100"
                  height="100"
                  fit="cover"
                  @click="previewImage(post.images, index)"
                />
              </div>
            </div>

            <!-- 互动区域 -->
            <div class="post-actions">
              <div class="action-item" @click="handleComment(post)">
                <van-icon name="comment-o" />
                <span>{{ post.commentsCount || 0 }}</span>
              </div>
            </div>

            <!-- 评论列表 -->
            <div class="comments-section">
              <div class="comments-list" v-if="post.commentList && post.commentList.length > 0">
                <div class="comment-item" v-for="comment in post.commentList" :key="comment.id">
                  <van-image
                    round
                    width="24"
                    height="24"
                    :src="comment.avatar"
                  />
                  <div class="comment-content">
                    <div class="comment-user">{{ comment.username }}</div>
                    <div class="comment-text">{{ comment.content }}</div>
                    <div class="comment-time">{{ comment.createTime }}</div>
                  </div>
                </div>
              </div>
              <div class="no-comments" v-else>
                <van-empty description="暂无评论" />
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 发帖弹窗 -->
    <van-dialog
      v-model:show="showPostDialog"
      title="发布动态"
      show-cancel-button
      @confirm="submitPost"
      :before-close="beforeDialogClose"
    >
      <div class="post-form">
        <van-field
          v-model="newPost.content"
          type="textarea"
          placeholder="分享新鲜事..."
          rows="3"
          autosize
        />
        <van-uploader
          v-model="newPost.images"
          multiple
          :max-count="9"
          :after-read="afterRead"
        />
      </div>
    </van-dialog>

    <!-- 评论弹窗 -->
    <van-action-sheet
      v-model:show="showCommentSheet"
      title="评论"
      :close-on-click-overlay="false"
    >
      <div class="comment-sheet">
        <div class="comment-input">
          <van-field
            v-model="newComment"
            rows="2"
            autosize
            type="textarea"
            placeholder="写下你的评论..."
            input-align="left"
          />
        </div>
        <div class="comment-actions">
          <van-button plain size="small" @click="showCommentSheet = false">取消</van-button>
          <van-button type="primary" size="small" @click="submitComment">发布</van-button>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showImagePreview, closeToast } from 'vant'
import { useUserStore } from '../stores/user'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import request from '../api/request'

const router = useRouter()
const userStore = useUserStore()

// 列表相关
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const posts = ref([])
const page = ref(1)
const pageSize = 10

// 发帖相关
const showPostDialog = ref(false)
const newPost = reactive({
  content: '',
  images: []
})

// 评论相关
const showCommentSheet = ref(false)
const newComment = ref('')
const currentPost = ref(null)

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 下拉刷新
const onRefresh = async () => {
  page.value = 1
  finished.value = false
  await loadPosts()
  refreshing.value = false
}

// 加载帖子列表
const onLoad = async () => {
  await loadPosts()
}

// 加载帖子数据
const loadPosts = async () => {
  try {
    loading.value = true
    
    const params = {
      pageNum: page.value,
      pageSize: pageSize
    }
    
    const res = await request.get('/biz/post/compose/list', { params })
    
    if (res.code === 200) {
      const formattedPosts = res.rows.map(item => {
        // 获取评论列表
        const commentList = (item.comments || []).map(comment => ({
          id: comment.id,
          username: comment.createdBy || '匿名用户',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_150.png',
          content: cleanHtmlTags(comment.content),
          createTime: formatTime(comment.createdAt)
        }))
        
        return {
          id: item.id,
          username: item.createdBy || '匿名用户',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_150.png', // 默认头像
          content: item.content,
          images: item.imageUrl ? item.imageUrl.split(',').map(url => import.meta.env.VITE_BASE_URL + url) : [],
          createTime: formatTime(item.createdAt),
          updatedAt: item.updatedAt,
          commentsCount: (item.comments || []).length,
          commentList: commentList
        }
      })
      
      if (page.value === 1) {
        posts.value = formattedPosts
      } else {
        posts.value.push(...formattedPosts)
      }
      
      page.value++
      
      // 判断是否加载完所有数据
      if (res.rows.length < pageSize) {
        finished.value = true
      }
    } else {
      showToast('获取帖子列表失败')
    }
  } catch (error) {
    console.error('加载失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 清除HTML标签
const cleanHtmlTags = (html) => {
  if (!html) return ''
  return html.replace(/<\/?[^>]+(>|$)/g, "")
}

// 格式化时间显示
const formatTime = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: zhCN
    })
  } catch {
    return dateString
  }
}

// 图片上传后的处理
const afterRead = async (file) => {
  try {
    const loadingToast = showToast({
      type: 'loading',
      message: '上传中...',
      forbidClick: true,
      duration: 0
    })
    
    // 构建FormData
    const formData = new FormData()
    formData.append('file', file.file)
    
    // 上传图片
    const res = await request.post('/common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200) {
      // 更新文件对象，添加服务器返回的URL
      file.url = import.meta.env.VITE_BASE_URL + res.fileName
      file.response = { url: res.fileName }
      loadingToast.close()
    } else {
      loadingToast.close()
      showToast('上传失败')
      // 移除上传失败的文件
      const index = newPost.images.indexOf(file)
      if (index !== -1) {
        newPost.images.splice(index, 1)
      }
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    loadingToast.close()
    showToast('上传失败')
    // 移除上传失败的文件
    const index = newPost.images.indexOf(file)
    if (index !== -1) {
      newPost.images.splice(index, 1)
    }
  }
}

// 提交发帖
const submitPost = async () => {
  if (!newPost.content && newPost.images.length === 0) {
    showToast('请输入内容或上传图片')
    return false
  }

  try {
    showToast({
      type: 'loading',
      message: '发布中...',
      forbidClick: true,
      duration: 0
    })
    
    // 构建请求数据
    const postData = {
      content: newPost.content,
      imageUrl: newPost.images
        .filter(img => img.response && img.response.url)
        .map(img => img.response.url)
        .join(',')
    }
    
    // 调用发布接口
    const res = await request.post('/biz/post', postData)
    
    closeToast()
    if (res.code === 200) {
      showToast('发布成功')
      // 清空表单
      newPost.content = ''
      newPost.images = []
      // 刷新列表
      await onRefresh()
      return true
    } else {
      showToast(res.msg || '发布失败')
      return false
    }
  } catch (error) {
    console.error('发布失败:', error)
    closeToast()
    showToast('发布失败')
    return false
  }
}

// 预览图片
const previewImage = (images, startPosition) => {
  showImagePreview({
    images,
    startPosition,
    closeable: true
  })
}

// 点赞
const handleLike = async (post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
  
  // 点赞暂时仅做前端交互，后端API未提供点赞功能
  showToast(post.isLiked ? '点赞成功' : '取消点赞')
}

// 处理评论点击
const handleComment = async (post) => {
  currentPost.value = post
  showCommentSheet.value = true
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容')
    return
  }

  try {
    showToast({
      type: 'loading',
      message: '评论中...',
      forbidClick: true,
      duration: 0
    })
    
    // 构建评论数据
    const commentData = {
      content: newComment.value,
      postId: currentPost.value.id
    }
    
    // 调用评论接口
    const res = await request.post('/biz/comment', commentData)
    
    closeToast()
    if (res.code === 200) {
      // 添加新评论到列表
      const newCommentObj = {
        id: res.data?.id || Date.now(),
        username: userStore.userInfo?.username || '我',
        avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_150.png',
        content: newComment.value,
        createTime: '刚刚'
      }
      
      if (!currentPost.value.commentList) {
        currentPost.value.commentList = []
      }
      
      currentPost.value.commentList.unshift(newCommentObj)
      currentPost.value.commentsCount = (currentPost.value.commentsCount || 0) + 1
      
      showToast('评论成功')
      newComment.value = ''
      showCommentSheet.value = false
    } else {
      showToast(res.msg || '评论失败')
    }
  } catch (error) {
    console.error('评论失败:', error)
    closeToast()
    showToast('评论失败')
  }
}

// 关闭弹窗前的处理
const beforeDialogClose = (action) => {
  if (action === 'cancel') {
    newPost.content = ''
    newPost.images = []
  }
  return true
}

// 页面加载时获取数据
onMounted(() => {
  onRefresh()
})
</script>

<style lang="less" scoped>
.community-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: env(safe-area-inset-bottom);
}

.post-list {
  padding: 12px;
}

.post-item {
  margin-bottom: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .user-info {
      margin-left: 12px;

      .username {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .post-time {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }

  .post-content {
    .text-content {
      margin: 0 0 12px;
      font-size: 14px;
      color: #333;
      line-height: 1.6;
    }

    .image-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;

      .van-image {
        border-radius: 4px;
        overflow: hidden;
      }
    }
  }

  .post-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;

    .action-item {
      display: flex;
      align-items: center;
      margin-left: 24px;
      color: #666;
      font-size: 14px;
      cursor: pointer;

      .van-icon {
        margin-right: 4px;
        font-size: 16px;
      }
    }
  }
}

.post-form {
  padding: 16px;

  .van-field {
    margin-bottom: 16px;
  }
}

.comments-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;

  .comments-list {
    .comment-item {
      display: flex;
      align-items: flex-start;
      padding: 8px 0;

      .comment-content {
        margin-left: 8px;
        flex: 1;

        .comment-user {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .comment-text {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }

        .comment-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
}

.comment-sheet {
  padding: 16px;

  .comment-input {
    margin-bottom: 12px;
  }

  .comment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style> 