<template>
  <div class="tags-management">
    <h1>标签管理</h1>
    
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
          <plus-outlined /> 添加标签
        </a-button>
      </a-space>
    </div>

    <!-- 标签表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredTags"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      rowKey="id"
      bordered
      :scroll="{ x: 1400 }"
    >
      <template #bodyCell="{ column, record }">

        <!-- 商品名称 -->
        <template v-if="column.dataIndex === 'productName'">
          {{ record.productName || '无' }}
        </template>
        
        <!-- 商品类别 -->
        <template v-if="column.dataIndex === 'productCategory'">
          {{ record.productCategory || '无' }}
        </template>
        
        <!-- 标签状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '已启用' : '已禁用' }}
          </a-tag>
        </template>
        
        <!-- 创建时间 -->
        <template v-if="column.dataIndex === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        
        <!-- 更新时间 -->
        <template v-if="column.dataIndex === 'updatedAt'">
          {{ formatDate(record.updatedAt) }}
        </template>
        
        <!-- 操作按钮 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该标签吗?"
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

    <!-- 添加/编辑标签弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      @ok="handleEditSubmit"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="标签名称" name="name">
          <a-input v-model:value="editForm.name" placeholder="请输入标签名称" />
        </a-form-item>
        <a-form-item label="标签类型" name="type">
          <a-select v-model:value="editForm.type" placeholder="请选择标签类型">
            <a-select-option v-for="i in 10" :key="i" :value="'类型' + i">
              类型{{ i }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关联商品" name="productId">
          <a-select
            v-model:value="editForm.productId"
            placeholder="请选择关联商品"
            allowClear
            :options="productOptions"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量删除确认弹窗 -->
    <a-modal
      v-model:open="batchDeleteModalVisible"
      title="批量删除确认"
      @ok="confirmBatchDelete"
      :confirm-loading="batchDeleteLoading"
    >
      <p>确定要删除选中的 {{ selectedRowKeys.length }} 个标签吗？</p>
      <p style="color: #ff4d4f;">此操作不可恢复，请谨慎操作！</p>
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
    width: 200,
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 200,
  },
  {
    title: '商品类别',
    dataIndex: 'productCategory',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    filters: [
      { text: '已启用', value: 1 },
      { text: '已禁用', value: 0 },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    fixed: 'right'
  }
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
const selectedRowKeys = ref([])
const editModalVisible = ref(false)
const submitLoading = ref(false)
const batchDeleteModalVisible = ref(false)
const batchDeleteLoading = ref(false)
const isEdit = ref(false)
const tags = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

// 编辑表单
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  name: '',
  type: '',
  productId: undefined
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '标签名称长度应在 2-20 个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择标签类型', trigger: 'blur' }
  ]
}

// 商品选项（模拟数据）
const productOptions = ref([
  { value: 1, label: '商品1' },
  { value: 2, label: '商品2' },
  { value: 3, label: '商品3' }
])

// 选择变化处理
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 批量删除处理
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的标签')
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
    message.success('批量删除成功')
    selectedRowKeys.value = []
    batchDeleteModalVisible.value = false
    // 重新加载数据
    loadData()
  } catch (error) {
    message.error('批量删除失败')
  } finally {
    batchDeleteLoading.value = false
  }
}

// 模拟数据
const mockTags = () => {
  const data = []
  for (let i = 1; i <= 50; i++) {
    data.push({
      id: i,
      name: `标签${i}`,
      type: `类型${i % 5 + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      category: tagCategories[Math.floor(Math.random() * tagCategories.length)].value,
      itemCount: Math.floor(Math.random() * 200),
      status: Math.random() > 0.5 ? 1 : 0,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
      updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toLocaleString(),
      checked: false
    })
  }
  return data
}

// 初始化数据
onMounted(() => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    tags.value = mockTags()
    pagination.total = tags.value.length
    loading.value = false
  }, 500)
})

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

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  Object.keys(editForm).forEach(key => {
    editForm[key] = key === 'status' ? 1 : (key === 'color' ? '#1890ff' : '')
  })
  editModalVisible.value = true
}

// 显示编辑模态框
const handleEdit = (record) => {
  isEdit.value = true
  editForm.id = record.id
  editForm.name = record.name
  editForm.type = record.type
  editModalVisible.value = true
}

// 处理模态框确认
const handleEditSubmit = () => {
  editFormRef.value?.validate().then(() => {
    submitLoading.value = true
    // 模拟API调用
    setTimeout(() => {
      if (isEdit.value) {
        // 编辑标签
        const index = tags.value.findIndex(item => item.id === editForm.id)
        if (index !== -1) {
          tags.value[index] = {
            ...tags.value[index],
            name: editForm.name,
            type: editForm.type,
            updatedAt: new Date().toLocaleString()
          }
          message.success('修改成功')
        }
      } else {
        // 新增标签
        const newTag = {
          id: tags.value.length + 1,
          name: editForm.name,
          type: editForm.type,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          category: tagCategories[Math.floor(Math.random() * tagCategories.length)].value,
          itemCount: 0,
          status: 1,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
          checked: false
        }
        tags.value.unshift(newTag)
        message.success('新增成功')
      }
      editModalVisible.value = false
      submitLoading.value = false
    }, 500)
  })
}

// 删除标签
const handleDelete = (record) => {
  const index = tags.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tags.value.splice(index, 1)
    message.success('删除成功')
  }
}
</script>

<style scoped lang="less">
.tags-management {
  h1 {
    margin-bottom: 24px;
  }
  
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

  .tag-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .tag-name {
      font-weight: 500;
      color: #333;
    }

    .tag-type {
      color: #666;
    }
  }
}
</style> 