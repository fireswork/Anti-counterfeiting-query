<template>
  <div class="tags-management">
    <h1>标签管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="queryParams.tagData"
          placeholder="搜索标签数据"
          style="width: 250px"
          @search="handleQuery"
          allowClear
        />
        <a-select
          v-model:value="queryParams.tagTypeId"
          placeholder="按类别筛选"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option v-for="item in tagTypeOptions" :key="item.dictValue" :value="item.dictCode">
            {{ item.dictLabel }}
          </a-select-option>
        </a-select>
        <!-- <a-select
          v-model:value="queryParams.verificationResult"
          placeholder="验证结果"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option value="">全部结果</a-select-option>
          <a-select-option value="1">验证成功</a-select-option>
          <a-select-option value="0">验证失败</a-select-option>
        </a-select> -->
        <a-button type="primary" @click="handleQuery">
          <template #icon><search-outlined /></template>
          查询
        </a-button>
        <a-button @click="resetQuery">
          <template #icon><redo-outlined /></template>
          重置
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
        <a-button type="primary" @click="handleAdd">
          <plus-outlined /> 添加标签
        </a-button>
        <a-button @click="handleImport">
          <upload-outlined /> 批量导入
        </a-button>
      </a-space>
    </div>

    <!-- 标签表格 -->
    <a-table
      :columns="columns"
      :data-source="tagList"
      :loading="loading"
      :pagination="{
        total: total,
        showSizeChanger: true,
        pageSize: queryParams.pageSize,
        current: queryParams.pageNum,
        onChange: handlePageChange,
        onShowSizeChange: handleSizeChange,
        showTotal: total => `共 ${total} 条`
      }"
      @change="handleTableChange"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      rowKey="id"
      bordered
      :scroll="{ x: 1400 }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 验证结果 -->
        <template v-if="column.dataIndex === 'verificationResult'">
          <a-tag :color="record.verificationResult === '1' ? 'green' : 'red'">
            {{ record.verificationResult === '1' ? '成功' : '失败' }}
          </a-tag>
        </template>
        
        <!-- 最近验证时间 -->
        <template v-if="column.dataIndex === 'lastVerificationTime'">
          {{ formatDate(record.lastVerificationTime) }}
        </template>
        
        <!-- 操作按钮 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleView(record)">详情</a-button>
            <a-divider type="vertical" />
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
      v-model:open="formModalVisible"
      :title="formMode === 'add' ? '新增标签' : '编辑标签'"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      width="650px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="商品" name="productId">
          <a-select
            v-model:value="formData.productId"
            placeholder="请选择商品"
            @change="handleProductChange"
            allowClear
          >
            <a-select-option
              v-for="item in productOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.productName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签类型" name="tagTypeId">
          <a-select
            v-model:value="formData.tagTypeId"
            placeholder="请选择标签类型"
            @change="handleTagTypeChange"
            allowClear
          >
            <a-select-option
              v-for="item in tagTypeOptions"
              :key="item.dictCode"
              :value="item.dictCode"
            >
              {{ item.dictLabel }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签数据" name="tagData">
          <a-input v-model:value="formData.tagData" placeholder="请输入标签数据" />
        </a-form-item>
        <a-form-item label="验证次数" name="verificationCount" v-if="formMode === 'edit'">
          <a-input-number v-model:value="formData.verificationCount" placeholder="验证次数" disabled />
        </a-form-item>
        <a-form-item label="验证结果" name="verificationResult" v-if="formMode === 'edit'">
          <a-select v-model:value="formData.verificationResult" placeholder="验证结果" disabled>
            <a-select-option value="1">验证成功</a-select-option>
            <a-select-option value="0">验证失败</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看标签详情弹窗 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="标签详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="标签ID" span="2">{{ viewData.id }}</a-descriptions-item>
        <a-descriptions-item label="标签数据" span="2">{{ viewData.tagData }}</a-descriptions-item>
        <a-descriptions-item label="标签类型">{{ viewData.tagType }}</a-descriptions-item>
        <a-descriptions-item label="标签类型ID">{{ viewData.tagTypeId }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ viewData.productName }}</a-descriptions-item>
        <a-descriptions-item label="商品ID">{{ viewData.productId }}</a-descriptions-item>
        <a-descriptions-item label="商品类型">{{ viewData.productType }}</a-descriptions-item>
        <a-descriptions-item label="商品类型ID">{{ viewData.productTypeId }}</a-descriptions-item>
        <a-descriptions-item label="验证次数">{{ viewData.verificationCount }}</a-descriptions-item>
        <a-descriptions-item label="验证结果">
          <a-tag :color="viewData.verificationResult === '1' ? 'green' : 'red'">
            {{ viewData.verificationResult === '1' ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="最近验证时间" span="2">{{ formatDate(viewData.lastVerificationTime) }}</a-descriptions-item>
        <a-descriptions-item label="创建时间" span="2">{{ formatDate(viewData.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="更新时间" span="2">{{ formatDate(viewData.updatedAt) }}</a-descriptions-item>
      </a-descriptions>
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
    
    <!-- 批量导入模态框 -->
    <BatchImportModal
      ref="importModalRef"
      v-model:visible="importModalVisible"
      title="批量导入标签"
      template-url="/public/template/标签导入样例.xlsx"
      :update-support="false"
      @import="handleImportConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  SearchOutlined,
  RedoOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import request from '@/api/request'
import BatchImportModal from '@/components/BatchImportModal.vue'

// 表格列定义
const columns = [
  {
    title: '标签数据',
    dataIndex: 'tagData',
  },
  {
    title: '标签类型',
    dataIndex: 'tagTypeId',
    customRender: ({text}) => {
      const tagType = tagTypeOptions?.value?.find(item => item.dictCode === text)
      return tagType ? tagType.dictLabel : '--'
    }
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
  },
  {
    title: '验证次数',
    dataIndex: 'verificationCount',
  },
  {
    title: '验证结果',
    dataIndex: 'verificationResult',
  },
  {
    title: '最近验证时间',
    dataIndex: 'lastVerificationTime',
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
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态变量
const loading = ref(false)
const tagList = ref([])
const total = ref(0)
const selectedRowKeys = ref([])
const formModalVisible = ref(false)
const viewModalVisible = ref(false)
const submitLoading = ref(false)
const batchDeleteModalVisible = ref(false)
const batchDeleteLoading = ref(false)
const formMode = ref('add') // 'add' 或 'edit'
const categoryOptions = ref([])
const tagTypeOptions = ref([])
const productOptions = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tagData: '',
  productTypeId: undefined,
  verificationResult: undefined,
  tagTypeId: undefined
})

// 查看详情数据
const viewData = reactive({
  id: '',
  tagData: '',
  tagType: '',
  tagTypeId: '',
  productId: '',
  productName: '',
  productType: '',
  productTypeId: '',
  verificationCount: 0,
  verificationResult: '',
  lastVerificationTime: null,
  createdAt: null,
  updatedAt: null
})

// 表单对象
const formRef = ref(null)
const formData = reactive({
  id: undefined,
  tagData: '',
  tagType: '',
  tagTypeId: undefined,
  productId: undefined,
  productName: '',
  productType: '',
  productTypeId: undefined,
  verificationCount: 0,
  verificationResult: undefined,
  lastVerificationTime: null
})

// 表单校验规则
const rules = {
  tagData: [
    { required: true, message: '请输入标签数据', trigger: 'blur' },
  ],
  tagTypeId: [
    { required: true, message: '请选择标签类型', trigger: 'change' }
  ],
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ]
}

// 获取标签列表
const getTagList = async () => {
  loading.value = true
  try {
    const res = await request.get('/biz/tag/list', { params: queryParams })
    if (res && res.rows) {
      tagList.value = res.rows || []
      total.value = res.total || 0
    } else {
      tagList.value = []
      total.value = 0
      message.error('获取标签列表失败')
    }
  } catch (error) {
    console.error('获取标签列表失败', error)
    message.error('获取标签列表失败')
    tagList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取商品分类选项
const fetchCategoryOptions = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 100,
      dictType: 'biz_product_type'
    }
    const res = await request.get('/system/dict/data/list', { params })
    categoryOptions.value = res.rows || []
  } catch (error) {
    console.error('获取商品分类失败', error)
    message.error('获取商品分类失败')
  }
}

// 获取标签类型选项
const fetchTagTypeOptions = async () => {
  try {
    const res = await request.get('/system/dict/data/type/biz_tag_type')
    tagTypeOptions.value = res.data || []
  } catch (error) {
    console.error('获取标签类型失败', error)
    message.error('获取标签类型失败')
  }
}

// 获取商品列表选项
const fetchProductOptions = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 999,
    }
    const res = await request.get('/biz/product/list', { params })
    productOptions.value = res.rows || []
  } catch (error) {
    console.error('获取商品列表失败', error)
    message.error('获取商品列表失败')
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getTagList()
}

// 重置查询
const resetQuery = () => {
  queryParams.tagData = ''
  queryParams.productTypeId = undefined
  queryParams.verificationResult = undefined
  queryParams.pageNum = 1
  getTagList()
}

// 选择变化处理
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 表格变化处理
const handleTableChange = (pagination, filters, sorter) => {
  console.log('Table change:', pagination, filters, sorter)
  queryParams.pageNum = pagination.current
  queryParams.pageSize = pagination.pageSize
  getTagList()
}

// 分页改变
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page
  queryParams.pageSize = pageSize
  getTagList()
}

// 每页条数改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  getTagList()
}

// 商品变化
const handleProductChange = (value) => {
  const selected = productOptions.value.find(item => item.id === value)
  if (selected) {
    formData.productName = selected.productName
    // 如果商品已有类型，也可以设置商品类型
    if (selected.productTypeId) {
      formData.productTypeId = selected.productTypeId
      formData.productType = selected.productType
    }
  }
}

// 标签类型变化
const handleTagTypeChange = (value) => {
  const selected = tagTypeOptions.value.find(item => item.dictValue === value)
  if (selected) {
    formData.tagType = selected.dictLabel
  }
}

// 新增标签
const handleAdd = () => {
  formMode.value = 'add'
  formData.id = undefined
  formData.tagData = ''
  formData.tagType = ''
  formData.tagTypeId = undefined
  formData.productId = undefined
  formData.productName = ''
  formData.productType = ''
  formData.productTypeId = undefined
  formData.verificationCount = 0
  formData.verificationResult = undefined
  formData.lastVerificationTime = null
  formModalVisible.value = true
}

// 查看标签详情
const handleView = async (record) => {
  try {
    const res = await request.get(`/biz/tag/${record.id}`)
    if (res && res.data) {
      Object.assign(viewData, res.data)
      viewData.tagType = tagTypeOptions.value.find(item => item.dictCode === res.data.tagTypeId)?.dictLabel || '--'
      viewModalVisible.value = true
    } else {
      message.error('获取标签详情失败')
    }
  } catch (error) {
    console.error('获取标签详情失败', error)
    message.error('获取标签详情失败')
  }
}

// 编辑标签
const handleEdit = (record) => {
  formMode.value = 'edit'
  Object.assign(formData, record)
  formModalVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (formMode.value === 'add') {
      // 新增标签
      const res = await request.post('/biz/tag', formData)
      if (res.code === 200) {
        message.success('新增成功')
        formModalVisible.value = false
        getTagList()
      } else {
        message.error(res.msg || '新增失败')
      }
    } else {
      // 编辑标签
      const res = await request.put('/biz/tag', formData)
      if (res.code === 200) {
        message.success('编辑成功')
        formModalVisible.value = false
        getTagList()
      } else {
        message.error(res.msg || '编辑失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    message.error('表单验证失败，请检查必填项')
  } finally {
    submitLoading.value = false
  }
}

// 删除标签
const handleDelete = async (record) => {
  try {
    const res = await request.delete(`/biz/tag/${record.id}`)
    if (res.code === 200) {
      message.success('删除成功')
      getTagList()
    } else {
      message.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 批量删除
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
    const ids = selectedRowKeys.value.join(',')
    const res = await request.delete(`/biz/tag/${ids}`)
    
    if (res.code === 200) {
      message.success(`成功删除${selectedRowKeys.value.length}条记录`)
      selectedRowKeys.value = []
      batchDeleteModalVisible.value = false
      getTagList()
    } else {
      message.error(res.msg || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    message.error('批量删除失败')
  } finally {
    batchDeleteLoading.value = false
  }
}

// 批量导入相关
const importModalVisible = ref(false)
const templateUrl = `${import.meta.env.VITE_BASE_URL}/api/tag/import-template` // 模板URL
const importModalRef = ref(null)

// 显示导入模态框
const handleImport = () => {
  importModalVisible.value = true
}

// 处理导入
const handleImportConfirm = async (file, updateSupport) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await request.post('/biz/tag/importData', formData, {
      params: {
        updateSupport: updateSupport ? 'true' : 'false'
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200) {
      importModalRef.value.showImportResult(res.msg, true)
      getTagList()
    } else {
      importModalRef.value.showImportResult(res.msg, false)
    }
  } catch (error) {
    importModalRef.value.showImportResult(error.msg, false)
  }
}

// 生命周期钩子
onMounted(() => {
  fetchCategoryOptions()
  fetchTagTypeOptions()
  fetchProductOptions()
  getTagList()
})
</script>

<style scoped lang="less">
.tags-management {
  padding: 24px;
  background: #fff;
  
  h1 {
    margin-bottom: 20px;
    font-size: 20px;
    color: #333;
  }
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style> 