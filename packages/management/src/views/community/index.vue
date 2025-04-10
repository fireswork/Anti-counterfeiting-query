<template>
  <div class="community-management">
    <h1>社区管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索内容"
          style="width: 250px"
          @search="onSearch"
        />
        <a-button type="primary" @click="handleRefresh">
          <template #icon><reload-outlined /></template>
          刷新
        </a-button>
      </a-space>
      <a-space>
        <a-button 
          type="primary" 
          danger 
          :disabled="!selectedRowKeys.length"
          @click="handleBatchDelete"
        >
          批量删除
        </a-button>
        <a-button type="primary" @click="showAddModal">
          <plus-outlined /> 添加动态
        </a-button>
      </a-space>
    </div>

    <!-- 社区帖子表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredPosts"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户信息 -->
        <template v-if="column.dataIndex === 'userInfo'">
          <div class="user-info-cell">
            <a-avatar :src="record.avatar" />
            <span class="username">{{ record.username }}</span>
          </div>
        </template>
        
        <!-- 内容预览 -->
        <template v-if="column.dataIndex === 'content'">
          <div class="content-preview">
            {{ record.content.length > 50 ? record.content.slice(0, 50) + '...' : record.content }}
          </div>
        </template>
        
        <!-- 图片预览 -->
        <template v-if="column.dataIndex === 'images'">
          <div v-if="record.images && record.images.length" class="image-preview">
            <a-image
              :width="40"
              :src="record.images[0]"
              :preview="{
                src: record.images[0],
                mask: '预览'
              }"
            />
            <span v-if="record.images.length > 1" class="image-count">+{{ record.images.length - 1 }}</span>
          </div>
          <span v-else>无图片</span>
        </template>

        <!-- 日期 -->
        <template v-if="column.dataIndex === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        
        <!-- 操作 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleView(record)">查看</a-button>
            <a-divider type="vertical" />
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该动态吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 批量删除确认弹窗 -->
    <a-modal
      v-model:open="batchDeleteModalVisible"
      title="批量删除确认"
      @ok="confirmBatchDelete"
      :confirm-loading="batchDeleteLoading"
    >
      <p>确定要删除选中的 {{ selectedRowKeys.length }} 条动态吗？</p>
      <p style="color: #ff4d4f;">此操作不可恢复，请谨慎操作！</p>
    </a-modal>

    <!-- 添加动态弹窗 -->
    <a-modal
      v-model:open="postModalVisible"
      :title="isEdit ? '编辑动态' : '添加动态'"
      @ok="handlePostSubmit"
      width="700px"
    >
      <a-form
        :model="currentPost"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="发布用户">
          <a-select
            v-model:value="currentPost.username"
            placeholder="请选择用户"
            :options="userOptions"
          />
        </a-form-item>
        <a-form-item label="动态内容" name="content">
          <a-textarea 
            v-model:value="currentPost.content" 
            :rows="4" 
            placeholder="请输入动态内容"
          />
        </a-form-item>
        <a-form-item label="图片">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
          >
            <div v-if="fileList.length < 9">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看动态详情 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="动态详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="用户">
          <div class="user-info-cell">
            <a-avatar :src="currentPost?.avatar" />
            <span class="username">{{ currentPost?.username }}</span>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="内容">
          {{ currentPost?.content }}
        </a-descriptions-item>
        <a-descriptions-item label="图片" v-if="currentPost?.images?.length">
          <div class="image-gallery">
            <a-image
              v-for="(image, index) in currentPost?.images"
              :key="index"
              :width="100"
              :src="image"
              :preview="{
                src: image,
                mask: '查看大图'
              }"
              style="margin-right: 8px; margin-bottom: 8px;"
            />
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="点赞数">{{ currentPost?.likes }}</a-descriptions-item>
        <a-descriptions-item label="评论数">{{ currentPost?.comments }}</a-descriptions-item>
        <a-descriptions-item label="发布时间">{{ formatDate(currentPost?.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ formatDate(currentPost?.updatedAt) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  ReloadOutlined,
  LikeOutlined,
  CommentOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '用户信息',
    dataIndex: 'userInfo',
    width: 150,
  },
  {
    title: '内容',
    dataIndex: 'content',
    width: 300,
  },
  {
    title: '图片',
    dataIndex: 'images',
    width: 100,
  },
  {
    title: '发布时间',
    dataIndex: 'createdAt',
    width: 180,
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 250,
    fixed: 'right'
  }
]

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态
const loading = ref(false)
const searchValue = ref('')
const statusFilter = ref('')
const selectedRowKeys = ref([])
const batchDeleteModalVisible = ref(false)
const batchDeleteLoading = ref(false)
const postModalVisible = ref(false)
const viewModalVisible = ref(false)
const currentPost = ref(null)
const posts = ref([])
const isEdit = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

// 生成模拟数据
const mockPosts = () => {
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

  const data = []
  for (let i = 1; i <= 50; i++) {
    const contentIndex = i % MOCK_CONTENTS.length
    const randomContent = MOCK_CONTENTS[contentIndex]
    const randomAvatar = MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)]
    const randomName = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)]
    
    data.push({
      id: i,
      username: randomName,
      avatar: randomAvatar,
      content: randomContent.content,
      images: randomContent.images,
      likes: Math.floor(Math.random() * 200 + 50),
      comments: Math.floor(Math.random() * 30 + 10),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
    })
  }
  return data
}

// 初始化数据
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    posts.value = mockPosts()
    pagination.total = posts.value.length
    loading.value = false
  }, 500)
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  message.success('刷新成功')
}

// 筛选后的帖子列表
const filteredPosts = computed(() => {
  let result = [...posts.value]
  
  // 搜索过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.content.toLowerCase().includes(keyword) || 
      item.username.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 搜索处理
const onSearch = () => {
  pagination.current = 1
}

// 筛选变化处理
const onFilterChange = () => {
  pagination.current = 1
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  
  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1
    posts.value.sort((a, b) => {
      if (sorter.field === 'createdAt') {
        return order * (new Date(a[sorter.field]) - new Date(b[sorter.field]))
      }
      return 0
    })
  }
}

// 选择变化处理
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 批量删除处理
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的动态')
    return
  }
  batchDeleteModalVisible.value = true
}

// 确认批量删除
const confirmBatchDelete = async () => {
  try {
    batchDeleteLoading.value = true
    // TODO: 调用批量删除API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从列表中移除被删除的项
    posts.value = posts.value.filter(item => !selectedRowKeys.value.includes(item.id))
    
    message.success('批量删除成功')
    selectedRowKeys.value = []
    batchDeleteModalVisible.value = false
  } catch (error) {
    message.error('批量删除失败')
  } finally {
    batchDeleteLoading.value = false
  }
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  currentPost.value = {
    id: null,
    content: '',
    images: [],
    status: 1
  }
  postModalVisible.value = true
}

// 查看详情
const handleView = (record) => {
  currentPost.value = { ...record }
  viewModalVisible.value = true
}

// 编辑动态
const handleEdit = (record) => {
  isEdit.value = true
  currentPost.value = { ...record }
  postModalVisible.value = true
}

// 删除动态
const handleDelete = (record) => {
  // 从列表中移除
  const index = posts.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    posts.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 用户选项
const userOptions = computed(() => {
  const uniqueUsers = [...new Set(posts.value.map(post => post.username))]
  return uniqueUsers.map(username => ({
    value: username,
    label: username
  }))
})

// 文件列表
const fileList = ref([])

// 上传前处理
const beforeUpload = (file) => {
  // 这里可以验证文件类型、大小等
  // 在实际项目中，应该调用API上传文件
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    fileList.value = [...fileList.value, {
      uid: Date.now(),
      name: file.name,
      status: 'done',
      url: reader.result
    }]
  }
  return false // 阻止默认上传
}

// 提交动态
const handlePostSubmit = async () => {
  try {
    // 验证表单
    if (!currentPost.value.content) {
      message.error('请输入动态内容')
      return
    }
    
    if (!currentPost.value.username) {
      message.error('请选择用户')
      return
    }
    
    // TODO: 调用API保存动态
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (isEdit.value) {
      // 编辑现有动态
      const index = posts.value.findIndex(item => item.id === currentPost.value.id)
      if (index !== -1) {
        posts.value[index] = {
          ...posts.value[index],
          ...currentPost.value,
          images: fileList.value.map(file => file.url || file.response?.url),
          updatedAt: new Date()
        }
      }
      message.success('编辑成功')
    } else {
      // 添加新动态
      const newPost = {
        id: posts.value.length + 1,
        ...currentPost.value,
        avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_150.png',
        images: fileList.value.map(file => file.url || file.response?.url),
        likes: 0,
        comments: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      posts.value.unshift(newPost)
      message.success('添加成功')
    }
    
    postModalVisible.value = false
  } catch (error) {
    message.error('提交失败')
  }
}
</script>

<style scoped lang="less">
.community-management {
  h1 {
    margin-bottom: 24px;
  }
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .user-info-cell {
    display: flex;
    align-items: center;
    
    .username {
      margin-left: 12px;
      font-weight: 500;
    }
  }
  
  .content-preview {
    max-width: 300px;
    line-height: 1.5;
  }
  
  .image-preview {
    display: flex;
    align-items: center;
    
    .image-count {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  
  .interactions {
    display: flex;
    
    .likes, .comments {
      display: flex;
      align-items: center;
      margin-right: 16px;
      
      .anticon {
        margin-right: 4px;
      }
    }
  }
  
  .image-gallery {
    display: flex;
    flex-wrap: wrap;
  }
}
</style> 