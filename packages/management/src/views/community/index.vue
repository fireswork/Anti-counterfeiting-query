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
      :scroll="{ x: 1300 }"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户信息 -->
        <template v-if="column.dataIndex === 'userInfo'">
          <div class="user-info-cell">
            <a-avatar :src="record.avatar" v-if="record.avatar"/>
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
            <template v-for="(image, index) in record.images" :key="index">
              <a-image
                :width="40"
                :src="image"
                :preview="{
                  src: image,
                  mask: '预览'
                }"
              />
            </template>
            <!-- <span v-if="record.images.length > 1" class="image-count">+{{ record.images.length - 1 }}</span> -->
          </div>
        </template>
        
        <!-- 操作 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-button type="link" @click="handleViewComments(record)">查看评论</a-button>
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
        <a-form-item label="图片地址">
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
          <div class="upload-tip">请上传 大小不超过5MB 格式为 png/jpg/jpeg 的文件</div>
        </a-form-item>
        <a-form-item label="内容" name="content">
          <a-textarea 
            v-model:value="currentPost.content" 
            :rows="4" 
            placeholder="请输入动态内容"
          />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-date-picker 
            v-model:value="createdTime" 
            format="YYYY-MM-DD" 
            style="width: 100%"
            placeholder="请选择创建时间"
          />
        </a-form-item>
        <a-form-item label="更新时间">
          <a-date-picker 
            v-model:value="updatedTime" 
            format="YYYY-MM-DD" 
            style="width: 100%"
            placeholder="请选择更新时间"
          />
        </a-form-item>
        <a-form-item label="创建人">
          <a-input v-model:value="currentPost.createdBy" placeholder="请输入创建人" />
        </a-form-item>
        <a-form-item label="更新人">
          <a-input v-model:value="currentPost.updatedBy" placeholder="请输入更新人" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看评论模态框 -->
    <a-modal
      v-model:open="commentModalVisible"
      title="评论列表"
      :footer="null"
      width="700px"
    >
      <a-table
        :columns="[
          { title: '内容', dataIndex: 'content', width: 400 },
          { title: '创建时间', dataIndex: 'createdAt', width: 180 },
          { title: '更新时间', dataIndex: 'updatedAt', width: 180 }
        ]"
        :data-source="commentList"
        :loading="commentLoading"
        :pagination="{
          current: commentPagination.current,
          pageSize: commentPagination.pageSize,
          total: commentPagination.total,
          showSizeChanger: true
        }"
        @change="handleCommentTableChange"
        rowKey="id"
        bordered
      >
      </a-table>
      <div v-if="commentList.length === 0 && !commentLoading" style="text-align: center; padding: 20px;">
        暂无评论数据
      </div>
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
import request from '@/api/request'

// 表格列定义
const columns = [
  {
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '图片',
    dataIndex: 'images',
    width: 100,
  },
  {
    title: '发布时间',
    dataIndex: 'createdAt',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
  },
  {
    title: '创建人',
    dataIndex: 'createdBy',
  },
  {
    title: '更新人',
    dataIndex: 'updatedBy',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 300,
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

// 添加评论相关状态
const commentModalVisible = ref(false)
const commentLoading = ref(false)
const commentList = ref([])
const currentPostId = ref(null)
const commentPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 日期时间对象
const createdTime = ref(null)
const updatedTime = ref(null)

// 初始化数据
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    
    // 添加搜索条件
    if (searchValue.value) {
      params.content = searchValue.value
    }
    
    const res = await request.get('/biz/post/list', { params })
    if (res.code === 200) {
      posts.value = res.rows.map(item => ({
        ...item,
        images: item.imageUrl ? item.imageUrl.split(',').map(url => import.meta.env.VITE_BASE_URL + url) : []
      })) || []
      pagination.total = res.total || 0
    } else {
      message.error(res.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('加载数据失败', error)
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  message.success('刷新成功')
}

// 筛选后的帖子列表
const filteredPosts = computed(() => {
  return posts.value
})

// 搜索处理
const onSearch = () => {
  pagination.current = 1
  loadData()
}

// 筛选变化处理
const onFilterChange = () => {
  pagination.current = 1
  loadData()
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
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
    const ids = selectedRowKeys.value.join(',')
    const res = await request.delete(`/biz/post/${ids}`)
    
    if (res.code === 200) {
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadData()
    } else {
      message.error(res.msg || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败', error)
    message.error('批量删除失败')
  } finally {
    batchDeleteLoading.value = false
    batchDeleteModalVisible.value = false
  }
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  currentPost.value = {
    id: null,
    content: '',
    imageUrl: '',
    createdBy: '',
    updatedBy: ''
  }
  fileList.value = []
  createdTime.value = null
  updatedTime.value = null
  postModalVisible.value = true
}

// 编辑动态
const handleEdit = async (record) => {
  try {
    loading.value = true
    const res = await request.get(`/biz/post/${record.id}`)
    if (res.code === 200) {
      isEdit.value = true
      currentPost.value = res.data

      if (currentPost.value.imageUrl) {
        const imageUrls = currentPost.value.imageUrl.split(',')
        fileList.value.push(...imageUrls.map((url, index) => ({
          uid: `-${index}`,
          name: `图片${index + 1}`,
          status: 'done',
          url: import.meta.env.VITE_BASE_URL + url,
        })))
      }
      
      // 设置日期对象
      if (currentPost.value.createdAt) {
        createdTime.value = dayjs(currentPost.value.createdAt)
      }
      if (currentPost.value.updatedAt) {
        updatedTime.value = dayjs(currentPost.value.updatedAt)
      }
      
      postModalVisible.value = true
    } else {
      message.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败', error)
    message.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 删除动态
const handleDelete = async (record) => {
  try {
    const res = await request.delete(`/biz/post/${record.id}`)
    if (res.code === 200) {
      message.success('删除成功')
      loadData()
    } else {
      message.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败', error)
    message.error('删除失败')
  }
}

// 用户选项 - 实际项目中应该从用户接口获取
const userOptions = computed(() => {
  return [
    { value: '系统管理员', label: '系统管理员' },
    { value: '防伪小达人', label: '防伪小达人' },
    { value: '品质生活家', label: '品质生活家' },
    { value: '正品鉴定师', label: '正品鉴定师' },
    { value: '时尚达人', label: '时尚达人' },
  ]
})

// 文件列表
const fileList = ref([])

// 上传前处理
const beforeUpload = (file) => {
  // 校验文件类型
  const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'
  if (!isImage) {
    message.error('只能上传png/jpg/jpeg格式的图片!')
    return false
  }
  
  // 校验文件大小
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB!')
    return false
  }
  
  // 创建表单数据并上传
  const uploadFormData = new FormData()
  uploadFormData.append('file', file)
  
  // 上传文件前先清除列表以避免重复
  loading.value = true
  
  request
    .post('/common/upload', uploadFormData)
    .then((res) => {
      if (res.code === 200) {
        // 上传成功后，清除之前的文件列表，只保留当前上传的文件
        const fileName = res.fileName
        const url = import.meta.env.VITE_BASE_URL + fileName
        
        fileList.value = fileList.value.filter(item => item.url)
        fileList.value.push({
          uid: Date.now() + Math.random().toString(36).substring(2, 8),
          name: file.name,
          status: 'done',
          url,
          response: { url: fileName }
        })
        console.log(fileList.value)
      } else {
        message.error(res.msg || '上传失败')
      }
      loading.value = false
    })
    .catch((err) => {
      console.error('上传失败:', err)
      message.error('上传失败')
      loading.value = false
    })
  
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
    
    console.log(fileList.value, 222)
    const postData = {
      ...currentPost.value,
      imageUrl: fileList.value.map(item => item.url.replace(import.meta.env.VITE_BASE_URL, '')).join(',')
    }
    
    // 处理日期
    if (createdTime.value) {
      postData.createdAt = dayjs(createdTime.value).format('YYYY-MM-DD')
    }
    
    if (updatedTime.value) {
      postData.updatedAt = dayjs(updatedTime.value).format('YYYY-MM-DD')
    }
    
    let res
    if (isEdit.value) {
      // 编辑现有动态
      res = await request.put('/biz/post', postData)
    } else {
      // 添加新动态
      res = await request.post('/biz/post', postData)
    }
    
    if (res.code === 200) {
      message.success(isEdit.value ? '编辑成功' : '添加成功')
      postModalVisible.value = false
      loadData()
      fileList.value = [] // 清空文件列表
    } else {
      message.error(res.msg || (isEdit.value ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error('提交失败', error)
    message.error('提交失败')
  }
}

// 查看评论
const handleViewComments = async (record) => {
  currentPostId.value = record.id
  commentModalVisible.value = true
  await fetchComments(record.id)
}

// 获取评论列表
const fetchComments = async (postId) => {
  commentLoading.value = true
  try {
    const params = {
      pageNum: commentPagination.current,
      pageSize: commentPagination.pageSize,
      postId
    }
    
    const res = await request.get('/biz/comment/list', { params })
    if (res.code === 200) {
      commentList.value = res.rows || []
      commentPagination.total = res.total || 0
    } else {
      message.error(res.msg || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败', error)
    message.error('获取评论失败')
  } finally {
    commentLoading.value = false
  }
}

// 评论分页变更
const handleCommentTableChange = (pagination) => {
  commentPagination.current = pagination.current
  commentPagination.pageSize = pagination.pageSize
  fetchComments(currentPostId.value)
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
  
  .upload-tip {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-top: 8px;
  }
}
</style> 