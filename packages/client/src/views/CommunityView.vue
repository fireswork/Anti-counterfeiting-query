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
              <div class="action-item" @click="handleLike(post)">
                <van-icon :name="post.isLiked ? 'like' : 'like-o'" :color="post.isLiked ? '#DD2476' : '#666'" />
                <span>{{ post.likes || 0 }}</span>
              </div>
              <div class="action-item" @click="handleComment(post)">
                <van-icon name="comment-o" />
                <span>{{ post.comments || 0 }}</span>
              </div>
            </div>

            <!-- 评论列表 -->
            <div class="comments-section" v-if="post.showComments">
              <div class="comments-list">
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { useUserStore } from '../stores/user'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Mock数据
const MOCK_CONTENTS = [
  {
    content: '今天刚收到新买的商品，扫码验证是正品，很开心！包装很精致，商家服务也很好。',
    images: [
      'https://cdn.pixabay.com/photo/2019/12/14/08/36/shopping-4694470_150.jpg',
      'https://cdn.pixabay.com/photo/2020/03/17/20/52/covid-4941846_150.jpg'
    ]
  },
  {
    content: '分享一个防伪小技巧：除了扫描防伪码，大家还要注意看包装上的激光防伪标，在光线下会有特殊效果，这个很难仿制的。',
    images: [
      'https://cdn.pixabay.com/photo/2018/04/24/13/23/qr-code-3346117_150.jpg'
    ]
  },
  {
    content: '最近市面上高仿太多了，建议大家一定要通过正规渠道购买，收到货后第一时间验证防伪码！',
    images: [
      'https://cdn.pixabay.com/photo/2017/01/13/01/22/mobile-1976104_150.jpg'
    ]
  },
  {
    content: '分享一下我的购物心得：1. 一定要选择正规渠道 2. 到货先验证防伪码 3. 对比外包装细节 4. 有疑问及时联系客服',
    images: [
      'https://cdn.pixabay.com/photo/2016/11/22/21/57/apparel-1850804_150.jpg',
      'https://cdn.pixabay.com/photo/2018/01/11/21/27/laptop-3076957_150.jpg',
      'https://cdn.pixabay.com/photo/2019/07/27/21/42/scanner-4367460_150.jpg'
    ]
  },
  {
    content: '今天帮朋友鉴定了一个包，通过咱们的防伪系统一查，果然是假货，幸好没买！大家一定要注意防骗啊！',
    images: [
      'https://cdn.pixabay.com/photo/2017/12/09/08/18/fraud-3007108_150.jpg'
    ]
  }
]

const MOCK_AVATARS = [
  'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_150.png',
  'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_150.png',
  'https://cdn.pixabay.com/photo/2016/04/01/12/11/avatar-1300582_150.png',
  'https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_150.png'
]

const MOCK_USERNAMES = ['防伪小达人', '品质生活家', '正品鉴定师', '时尚达人', '精明购物狂']

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
    
    const mockPosts = Array(5).fill().map((_, index) => {
      const contentIndex = (index + (page.value - 1) * 5) % MOCK_CONTENTS.length
      const randomContent = MOCK_CONTENTS[contentIndex]
      const randomAvatar = MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)]
      const randomName = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)]
      
      // 生成随机时间，范围是最近7天内
      const randomTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      const formattedTime = randomTime.toLocaleString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })

      return {
        id: Date.now() + Math.random(),
        username: randomName,
        avatar: randomAvatar,
        content: page.value > 1 ? `${randomContent.content} (${page.value})` : randomContent.content,
        images: randomContent.images,
        createTime: formattedTime,
        likes: Math.floor(Math.random() * 200 + 50), // 50-250的点赞数
        comments: Math.floor(Math.random() * 30 + 10), // 10-40的评论数
        isLiked: Math.random() > 0.5,
        showComments: false,
        commentList: []
      }
    })

    if (page.value === 1) {
      posts.value = mockPosts
    } else {
      posts.value.push(...mockPosts)
    }

    page.value++
    finished.value = posts.value.length >= 30 // 模拟最多30条数据
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 图片上传后的处理
const afterRead = async (file) => {
  // TODO: 实现图片上传逻辑
  console.log('上传图片:', file)
}

// 提交发帖
const submitPost = async () => {
  if (!newPost.content && !newPost.images.length) {
    showToast('请输入内容或上传图片')
    return false
  }

  try {
    // TODO: 调用后端API发布帖子
    // await fetch('/api/posts', {
    //   method: 'POST',
    //   body: JSON.stringify(newPost)
    // })

    showToast('发布成功')
    newPost.content = ''
    newPost.images = []
    await onRefresh()
  } catch (error) {
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
  try {
    // TODO: 调用后端API进行点赞
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  } catch (error) {
    showToast('操作失败')
  }
}

// 处理评论点击
const handleComment = (post) => {
  currentPost.value = post
  // 如果还没有评论列表，初始化一个
  if (!post.commentList) {
    post.commentList = generateMockComments()
  }
  // 切换评论列表的显示状态
  post.showComments = !post.showComments
  
  // 如果要添加新评论，显示评论框
  if (!post.showComments) {
    showCommentSheet.value = true
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容')
    return
  }

  try {
    // 模拟添加评论
    const comment = {
      id: Date.now(),
      username: MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)],
      avatar: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
      content: newComment.value,
      createTime: '刚刚'
    }

    if (!currentPost.value.commentList) {
      currentPost.value.commentList = []
    }
    
    currentPost.value.commentList.unshift(comment)
    currentPost.value.comments++
    currentPost.value.showComments = true
    
    showToast('评论成功')
    newComment.value = ''
    showCommentSheet.value = false
  } catch (error) {
    showToast('评论失败')
  }
}

// 生成模拟评论数据
const generateMockComments = () => {
  const commentContents = [
    '确实要注意防伪问题，感谢分享！',
    '这个建议很实用',
    '我前几天也买到假货了，太气人了',
    '学习了，收藏一下',
    '这个防伪码验证真的很重要',
    '包装看起来很精致啊',
    '正品就是不一样',
    '感谢分享经验'
  ]

  return Array(Math.floor(Math.random() * 3 + 2)).fill().map(() => ({
    id: Date.now() + Math.random(),
    username: MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)],
    avatar: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
    content: commentContents[Math.floor(Math.random() * commentContents.length)],
    createTime: formatDistanceToNow(new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), {
      addSuffix: true,
      locale: zhCN
    })
  }))
}

// 关闭弹窗前的处理
const beforeDialogClose = (action) => {
  if (action === 'cancel') {
    newPost.content = ''
    newPost.images = []
  }
  return true
}
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