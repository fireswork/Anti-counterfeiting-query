<template>
  <div class="pages-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索页面标题或URL"
          style="width: 250px"
          @search="onSearch"
        />
        <a-select
          v-model:value="typeFilter"
          placeholder="按页面类型筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="type in pageTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="statusFilter"
          placeholder="按状态筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="published">已发布</a-select-option>
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="archived">已归档</a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="showAddModal">
        <plus-outlined /> 添加页面
      </a-button>
    </div>

    <!-- 页面表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredPages"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1400 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 页面预览 -->
        <template v-if="column.dataIndex === 'thumbnail'">
          <img 
            v-if="record.thumbnail" 
            :src="record.thumbnail" 
            alt="页面预览" 
            class="page-thumbnail" 
          />
          <div v-else class="page-no-thumbnail">
            <file-image-outlined />
          </div>
        </template>
        
        <!-- 页面类型 -->
        <template v-if="column.dataIndex === 'type'">
          {{ getTypeLabel(record.type) }}
        </template>
        
        <!-- 页面状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusLabel(record.status) }}
          </a-tag>
        </template>
        
        <!-- 访问量 -->
        <template v-if="column.dataIndex === 'visitCount'">
          <a-statistic 
            :value="record.visitCount" 
            :value-style="{ fontSize: '14px' }" 
            suffix="次" 
          />
        </template>
        
        <!-- 更新时间 -->
        <template v-if="column.dataIndex === 'updatedAt'">
          {{ formatDate(record.updatedAt) }}
        </template>
        
        <!-- 操作按钮 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              <edit-outlined /> 编辑
            </a-button>
            <a-button type="link" size="small" @click="showViewModal(record)">
              <eye-outlined /> 预览
            </a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="record.status !== 'published'" key="publish" @click="handleChangeStatus(record.id, 'published')">
                    <check-circle-outlined /> 发布页面
                  </a-menu-item>
                  <a-menu-item v-if="record.status !== 'draft'" key="draft" @click="handleChangeStatus(record.id, 'draft')">
                    <edit-outlined /> 设为草稿
                  </a-menu-item>
                  <a-menu-item v-if="record.status !== 'archived'" key="archive" @click="handleChangeStatus(record.id, 'archived')">
                    <inbox-outlined /> 归档页面
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete">
                    <a-popconfirm
                      title="确定要删除该页面吗?"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="handleDelete(record.id)"
                    >
                      <delete-outlined /> 删除页面
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="link" size="small">
                更多 <down-outlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑页面弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑页面' : '添加页面'"
      @ok="handleModalOk"
      width="800px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="页面标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入页面标题" />
        </a-form-item>
        
        <a-form-item label="URL路径" name="url">
          <a-input 
            v-model:value="formData.url" 
            placeholder="请输入URL路径，例如: /about-us" 
            addon-before="/"
          />
        </a-form-item>
        
        <a-form-item label="页面类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择页面类型">
            <a-select-option v-for="type in pageTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="页面状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="published">发布</a-radio>
            <a-radio value="draft">草稿</a-radio>
            <a-radio value="archived">归档</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="页面缩略图" name="thumbnail">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @preview="handlePreview"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        
        <a-form-item label="Meta 标题" name="metaTitle">
          <a-input v-model:value="formData.metaTitle" placeholder="请输入Meta标题" />
        </a-form-item>
        
        <a-form-item label="Meta 描述" name="metaDescription">
          <a-textarea 
            v-model:value="formData.metaDescription" 
            :rows="2" 
            placeholder="请输入Meta描述"
          />
        </a-form-item>
        
        <a-form-item label="页面内容" name="content">
          <a-textarea 
            v-model:value="formData.content" 
            :rows="6" 
            placeholder="请输入页面HTML内容"
          />
          <span class="description-text">
            注: 实际项目中应使用富文本编辑器如 TinyMCE 或 CKEditor
          </span>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal
      v-model:visible="previewVisible"
      :title="previewTitle"
      :footer="null"
    >
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 页面预览 -->
    <a-modal
      v-model:visible="viewVisible"
      :title="currentPage.title"
      :footer="null"
      width="900px"
    >
      <div class="page-preview-header">
        <div class="page-info">
          <div>
            <strong>URL:</strong> 
            <a :href="'/'+currentPage.url" target="_blank">/{{ currentPage.url }}</a>
          </div>
          <div>
            <strong>类型:</strong> {{ getTypeLabel(currentPage.type) }}
          </div>
          <div>
            <strong>状态:</strong> 
            <a-tag :color="getStatusColor(currentPage.status)">
              {{ getStatusLabel(currentPage.status) }}
            </a-tag>
          </div>
          <div>
            <strong>访问量:</strong> {{ currentPage.visitCount }} 次
          </div>
          <div>
            <strong>创建时间:</strong> {{ formatDate(currentPage.createdAt) }}
          </div>
          <div>
            <strong>最后更新:</strong> {{ formatDate(currentPage.updatedAt) }}
          </div>
        </div>
        <div class="page-seo">
          <h3>SEO 信息</h3>
          <div><strong>Meta 标题:</strong> {{ currentPage.metaTitle || currentPage.title }}</div>
          <div><strong>Meta 描述:</strong> {{ currentPage.metaDescription || '无' }}</div>
        </div>
      </div>
      <a-divider />
      <div class="page-preview-content">
        <div v-if="currentPage.thumbnail" class="page-preview-image">
          <img :src="currentPage.thumbnail" alt="页面缩略图" />
        </div>
        <div class="page-content">
          <div v-html="currentPage.content"></div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  FileImageOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '预览',
    dataIndex: 'thumbnail',
    width: 100,
  },
  {
    title: '页面标题',
    dataIndex: 'title',
    ellipsis: true,
  },
  {
    title: 'URL路径',
    dataIndex: 'url',
    ellipsis: true,
    customRender: ({ text }) => `/${text}`,
  },
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
      { text: '已归档', value: 'archived' },
    ],
  },
  {
    title: '访问量',
    dataIndex: 'visitCount',
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 页面类型
const pageTypes = [
  { label: '首页', value: 'home' },
  { label: '产品页', value: 'product' },
  { label: '分类页', value: 'category' },
  { label: '关于我们', value: 'about' },
  { label: '联系我们', value: 'contact' },
  { label: '博客', value: 'blog' },
  { label: '文章', value: 'article' },
  { label: '其他', value: 'other' },
]

// 获取类型标签
const getTypeLabel = (value) => {
  const type = pageTypes.find(t => t.value === value)
  return type ? type.label : '未知类型'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    'published': '已发布',
    'draft': '草稿',
    'archived': '已归档'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'published': 'green',
    'draft': 'orange',
    'archived': 'default'
  }
  return colorMap[status] || 'default'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态
const loading = ref(false)
const searchValue = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

// 模拟数据
const pages = ref([])
onMounted(() => {
  fetchPages()
})

// 获取页面数据
const fetchPages = async () => {
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const mockData = []
      const pageTypeValues = pageTypes.map(t => t.value)
      const statuses = ['published', 'draft', 'archived']
      
      for (let i = 1; i <= 50; i++) {
        const type = pageTypeValues[i % pageTypeValues.length]
        let url = ''
        
        // 根据类型设置URL
        switch (type) {
          case 'home':
            url = '';
            break;
          case 'product':
            url = `products/product-${i}`;
            break;
          case 'category':
            url = `categories/category-${i}`;
            break;
          case 'about':
            url = 'about-us';
            break;
          case 'contact':
            url = 'contact-us';
            break;
          case 'blog':
            url = 'blog';
            break;
          case 'article':
            url = `articles/article-${i}`;
            break;
          default:
            url = `page-${i}`;
        }
        
        // 创建随机内容
        const content = `
          <h1>这是页面${i}的标题</h1>
          <p>这是页面${i}的内容。您可以在这里添加更多详细信息。</p>
          <p>这是一个示例段落，用于演示页面的内容结构。在实际项目中，这里会包含丰富的HTML内容。</p>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
            <li>列表项 3</li>
          </ul>
          <p>更多内容...</p>
        `
        
        // 创建模拟页面数据
        mockData.push({
          id: i,
          title: `页面标题 ${i}`,
          url: url,
          type: type,
          status: statuses[i % 3],
          thumbnail: i % 3 === 0 ? null : `https://picsum.photos/id/${i + 30}/200/150`,
          visitCount: Math.floor(Math.random() * 10000),
          metaTitle: i % 2 === 0 ? `SEO标题 - 页面${i}` : '',
          metaDescription: i % 2 === 0 ? `这是页面${i}的元描述，用于搜索引擎优化。` : '',
          content: content,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 50000000000)),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 20000000000)),
        })
      }
      
      pages.value = mockData
      pagination.total = mockData.length
      loading.value = false
    }, 500)
  } catch (error) {
    message.error('获取页面列表失败')
    loading.value = false
  }
}

// 过滤后的页面列表
const filteredPages = computed(() => {
  let result = [...pages.value]
  
  // 搜索过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.url.toLowerCase().includes(keyword)
    )
  }
  
  // 类型过滤
  if (typeFilter.value) {
    result = result.filter(item => item.type === typeFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value)
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
    pages.value.sort((a, b) => {
      if (sorter.field === 'visitCount') {
        return order * (a[sorter.field] - b[sorter.field])
      }
      if (sorter.field === 'updatedAt') {
        return order * (new Date(a[sorter.field]) - new Date(b[sorter.field]))
      }
      return 0
    })
  }
}

// 添加/编辑模态框相关
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  title: '',
  url: '',
  type: undefined,
  status: 'draft',
  thumbnail: '',
  metaTitle: '',
  metaDescription: '',
  content: '',
})

const fileList = ref([])
const rules = {
  title: [{ required: true, message: '请输入页面标题', trigger: 'blur' }],
  url: [{ required: true, message: '请输入URL路径', trigger: 'blur' }],
  type: [{ required: true, message: '请选择页面类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择页面状态', trigger: 'change' }],
  content: [{ required: true, message: '请输入页面内容', trigger: 'blur' }],
}

// 图片上传相关
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

const handlePreview = async (file) => {
  previewImage.value = file.url || file.preview
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
}

const beforeUpload = (file) => {
  const isImage = file.type.indexOf('image/') === 0
  if (!isImage) {
    message.error('只能上传图片文件!')
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  
  if (isImage && isLt2M) {
    // 模拟上传
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      file.url = reader.result
      fileList.value = [file]
    }
  }
  
  return false // 阻止自动上传
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'status' ? 'draft' : ''
  })
  fileList.value = []
  modalVisible.value = true
}

// 显示编辑模态框
const showEditModal = (record) => {
  isEdit.value = true
  Object.keys(formData).forEach(key => {
    if (key in record) {
      formData[key] = record[key]
    }
  })
  fileList.value = record.thumbnail ? [{
    uid: '-1',
    name: 'thumbnail.jpg',
    status: 'done',
    url: record.thumbnail,
  }] : []
  modalVisible.value = true
}

// 处理模态框确认
const handleModalOk = () => {
  formRef.value.validateFields().then(values => {
    // 设置缩略图URL
    if (fileList.value.length > 0) {
      values.thumbnail = fileList.value[0].url || fileList.value[0].response?.url
    }
    
    if (isEdit.value) {
      // 更新页面
      const index = pages.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        pages.value[index] = {
          ...pages.value[index],
          ...values,
          updatedAt: new Date(),
        }
        message.success('页面更新成功')
      }
    } else {
      // 添加页面
      const newPage = {
        ...values,
        id: pages.value.length + 1,
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      pages.value.unshift(newPage)
      message.success('页面添加成功')
    }
    
    modalVisible.value = false
  }).catch(error => {
    console.error('验证失败:', error)
  })
}

// 切换页面状态
const handleChangeStatus = (id, newStatus) => {
  const index = pages.value.findIndex(item => item.id === id)
  if (index !== -1) {
    pages.value[index].status = newStatus
    pages.value[index].updatedAt = new Date()
    message.success(`页面状态已更改为${getStatusLabel(newStatus)}`)
  }
}

// 删除页面
const handleDelete = (id) => {
  const index = pages.value.findIndex(item => item.id === id)
  if (index !== -1) {
    pages.value.splice(index, 1)
    message.success('页面删除成功')
  }
}

// 页面预览
const viewVisible = ref(false)
const currentPage = ref({})

const showViewModal = (record) => {
  currentPage.value = record
  viewVisible.value = true
}
</script>

<style scoped lang="less">
.pages-container {
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .page-thumbnail {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .page-no-thumbnail {
    width: 80px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #bfbfbf;
    font-size: 24px;
  }
  
  .description-text {
    color: #999;
    font-size: 12px;
  }
  
  .page-preview-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .page-info, .page-seo {
      flex: 1;
      
      div {
        margin-bottom: 8px;
      }
      
      h3 {
        margin-bottom: 12px;
      }
    }
  }
  
  .page-preview-content {
    .page-preview-image {
      margin-bottom: 16px;
      text-align: center;
      
      img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
      }
    }
    
    .page-content {
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background-color: #fff;
    }
  }
}
</style> 