<template>
  <div class="tags-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索标签名称"
          style="width: 250px"
          @search="onSearch"
        />
        <a-select
          v-model:value="categoryFilter"
          placeholder="按类别筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部类别</a-select-option>
          <a-select-option v-for="category in tagCategories" :key="category.value" :value="category.value">
            {{ category.label }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="statusFilter"
          placeholder="按状态筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="1">已启用</a-select-option>
          <a-select-option value="0">已禁用</a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="showAddModal">
        <plus-outlined /> 添加标签
      </a-button>
    </div>

    <!-- 标签表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredTags"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      bordered
      :scroll="{ x: 1400 }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 标签颜色 -->
        <template v-if="column.dataIndex === 'color'">
          <div class="color-dot" :style="{ backgroundColor: record.color }"></div>
          <span style="margin-left: 8px">{{ record.color }}</span>
        </template>
        
        <!-- 标签类别 -->
        <template v-if="column.dataIndex === 'category'">
          {{ getCategoryLabel(record.category) }}
        </template>
        
        <!-- 标签状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '已启用' : '已禁用' }}
          </a-tag>
        </template>
        
        <!-- 关联数量 -->
        <template v-if="column.dataIndex === 'itemCount'">
          <a-badge :count="record.itemCount" :number-style="{ backgroundColor: '#1890ff' }" />
        </template>
        
        <!-- 创建时间 -->
        <template v-if="column.dataIndex === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        
        <!-- 操作按钮 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              <edit-outlined /> 编辑
            </a-button>
            <a-popconfirm
              v-if="record.status === 1"
              title="确定要禁用该标签吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleToggleStatus(record.id, 0)"
            >
              <a-button type="link" danger size="small">
                <stop-outlined /> 禁用
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              v-else
              title="确定要启用该标签吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleToggleStatus(record.id, 1)"
            >
              <a-button type="link" size="small">
                <check-outlined /> 启用
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              title="确定要删除该标签吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" danger size="small">
                <delete-outlined /> 删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑标签弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑标签' : '添加标签'"
      @ok="handleModalOk"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="标签名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入标签名称" />
        </a-form-item>
        
        <a-form-item label="标签类别" name="category">
          <a-select v-model:value="formData.category" placeholder="请选择标签类别">
            <a-select-option v-for="category in tagCategories" :key="category.value" :value="category.value">
              {{ category.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="标签颜色" name="color">
          <div class="color-picker-wrapper">
            <a-input v-model:value="formData.color" placeholder="#RRGGBB" :maxlength="7" />
            <a-tooltip title="选择颜色">
              <div class="color-preview">
                <input 
                  type="color" 
                  :value="formData.color" 
                  @change="e => formData.color = e.target.value" 
                  style="opacity: 0; position: absolute; width: 28px; height: 28px; cursor: pointer;"
                />
                <div class="color-sample" :style="{ backgroundColor: formData.color }"></div>
              </div>
            </a-tooltip>
          </div>
        </a-form-item>
        
        <a-form-item label="标签状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            :rows="3" 
            placeholder="请输入标签描述"
          />
        </a-form-item>
      </a-form>
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
  CheckOutlined, 
  StopOutlined 
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '标签名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '标签颜色',
    dataIndex: 'color',
    width: 150,
  },
  {
    title: '标签类别',
    dataIndex: 'category',
  },
  {
    title: '关联数量',
    dataIndex: 'itemCount',
    sorter: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '已启用', value: 1 },
      { text: '已禁用', value: 0 },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 220,
    fixed: 'right',
  },
]

// 标签分类
const tagCategories = [
  { label: '商品类别', value: 'product' },
  { label: '客户分类', value: 'customer' },
  { label: '市场活动', value: 'marketing' },
  { label: '系统标签', value: 'system' },
  { label: '自定义', value: 'custom' },
]

// 获取类别标签
const getCategoryLabel = (value) => {
  const category = tagCategories.find(c => c.value === value)
  return category ? category.label : '未知类别'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态
const loading = ref(false)
const searchValue = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

// 模拟数据
const tags = ref([])
onMounted(() => {
  fetchTags()
})

// 获取标签数据
const fetchTags = async () => {
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const mockData = []
      const tagCategoryValues = tagCategories.map(c => c.value)
      const colors = [
        '#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#ff5500',
        '#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#faad14'
      ]
      
      for (let i = 1; i <= 50; i++) {
        mockData.push({
          id: i,
          name: `标签${i}`,
          color: colors[i % colors.length],
          category: tagCategoryValues[i % tagCategoryValues.length],
          itemCount: Math.floor(Math.random() * 200),
          status: i % 7 === 0 ? 0 : 1,
          description: i % 3 === 0 ? `这是标签${i}的详细描述` : '暂无描述',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 50000000000)),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 20000000000)),
        })
      }
      
      tags.value = mockData
      pagination.total = mockData.length
      loading.value = false
    }, 500)
  } catch (error) {
    message.error('获取标签列表失败')
    loading.value = false
  }
}

// 过滤后的标签列表
const filteredTags = computed(() => {
  let result = [...tags.value]
  
  // 搜索过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword)
    )
  }
  
  // 类别过滤
  if (categoryFilter.value) {
    result = result.filter(item => item.category === categoryFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(item => String(item.status) === statusFilter.value)
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
    tags.value.sort((a, b) => {
      if (sorter.field === 'itemCount') {
        return order * (a[sorter.field] - b[sorter.field])
      }
      if (sorter.field === 'createdAt') {
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
  name: '',
  color: '#1890ff',
  category: undefined,
  status: 1,
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }],
  category: [{ required: true, message: '请选择标签类别', trigger: 'change' }],
  status: [{ required: true, message: '请选择标签状态', trigger: 'change' }],
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'status' ? 1 : (key === 'color' ? '#1890ff' : '')
  })
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
  modalVisible.value = true
}

// 处理模态框确认
const handleModalOk = () => {
  formRef.value.validateFields().then(values => {
    if (isEdit.value) {
      // 更新标签
      const index = tags.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        tags.value[index] = {
          ...tags.value[index],
          ...values,
          updatedAt: new Date(),
        }
        message.success('标签更新成功')
      }
    } else {
      // 添加标签
      const newTag = {
        ...values,
        id: tags.value.length + 1,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      tags.value.unshift(newTag)
      message.success('标签添加成功')
    }
    
    modalVisible.value = false
  }).catch(error => {
    console.error('验证失败:', error)
  })
}

// 切换标签状态
const handleToggleStatus = (id, newStatus) => {
  const index = tags.value.findIndex(item => item.id === id)
  if (index !== -1) {
    tags.value[index].status = newStatus
    tags.value[index].updatedAt = new Date()
    message.success(`标签${newStatus === 1 ? '启用' : '禁用'}成功`)
  }
}

// 删除标签
const handleDelete = (id) => {
  const index = tags.value.findIndex(item => item.id === id)
  if (index !== -1) {
    tags.value.splice(index, 1)
    message.success('标签删除成功')
  }
}
</script>

<style scoped lang="less">
.tags-container {
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .color-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    vertical-align: middle;
  }
  
  .color-picker-wrapper {
    display: flex;
    align-items: center;
    
    .color-preview {
      position: relative;
      margin-left: 12px;
      
      .color-sample {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
      }
    }
  }
}
</style> 