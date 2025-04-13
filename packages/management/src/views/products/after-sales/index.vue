<template>
  <div class="after-sales">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-checkbox v-model:checked="selectedAll" @change="handleSelectAll">全选</a-checkbox>
        <a-input-search
          v-model:value="queryParams.productName"
          placeholder="商品名称"
          style="width: 200px"
          @search="handleQuery"
          allowClear
        />
        <a-select
          v-model:value="queryParams.productTypeId"
          placeholder="商品类型"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option v-for="category in categoryOptions" :key="category.dictCode" :value="category.dictValue">
            {{ category.dictLabel }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="queryParams.verificationResult"
          placeholder="验证结果"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option value="">全部结果</a-select-option>
          <a-select-option :value="true">成功</a-select-option>
          <a-select-option :value="false">失败</a-select-option>
        </a-select>
      </a-space>
      <div class="right-buttons">
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <plus-outlined />新增
          </a-button>
          <a-button type="primary" @click="handleBatchRecover" :disabled="!selectedRowKeys.length">恢复出厂</a-button>
          <a-button type="primary" danger @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
            <delete-outlined />批量删除
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 标签表格 -->
    <a-table
      :columns="columns"
      :data-source="productList"
      :loading="loading"
      :pagination="{
        pageSize: queryParams.pageSize,
        current: queryParams.pageNum,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: handlePageChange,
        onShowSizeChange: handleSizeChange
      }"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :scroll="{ x: 1300 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 商品图片 -->
        <template v-if="column.dataIndex === 'productImage'">
          <img
            :src="record.productImage"
            :alt="record.productName"
            class="product-image"
            @click="handlePreviewImg(record.productImage)"
          />
        </template>
        
        <!-- 商品状态 -->
        <template v-if="column.dataIndex === 'productStatus'">
          <a-tag :color="record.productStatus === '1' ? 'green' : 'orange'">
            {{ record.productStatus === '1' ? '已上架' : '未上架' }}
          </a-tag>
        </template>

        <!-- 验证结果 -->
        <template v-if="column.dataIndex === 'verificationResult'">
          <a-tag :color="record.verificationResult === true ? 'green' : (record.verificationResult === false ? 'red' : '')">
            {{ record.verificationResult === true ? '成功' : (record.verificationResult === false ? '失败' : '--') }}
          </a-tag>
        </template>

        <!-- 日期格式化 -->
        <template v-if="column.dataIndex === 'createdAt' || column.dataIndex === 'lastVerificationTime'">
          {{ formatDateTime(record[column.dataIndex]) }}
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space style="white-space: nowrap;">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleRecover(record)">恢复出厂</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除这条记录吗？"
              @confirm="handleDelete(record)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a class="text-danger">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :title="previewTitle" :footer="null">
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 商品详情模态框 -->
    <a-modal
      v-model:open="viewVisible"
      title="标签详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="商品名称">{{ currentProduct.productName }}</a-descriptions-item>
        <a-descriptions-item label="商品类型">{{ currentProduct.productType }}</a-descriptions-item>
        <a-descriptions-item label="标签数据">{{ currentProduct.tagData }}</a-descriptions-item>
        <a-descriptions-item label="验证次数">{{ currentProduct.verificationCount }}</a-descriptions-item>
        <a-descriptions-item label="验证结果">
          <a-tag :color="currentProduct.verificationResult === true ? 'green' : (currentProduct.verificationResult === false ? 'red' : '')">
            {{ currentProduct.verificationResult === true ? '成功' : (currentProduct.verificationResult === false ? '失败' : '--') }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="最近验证时间">{{ formatDateTime(currentProduct.lastVerificationTime) }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDateTime(currentProduct.createdAt) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="formMode === 'add' ? '新增标签' : '编辑标签'"
      @ok="handleFormSubmit"
      :confirm-loading="formSubmitting"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="商品名称" name="productId">
          <a-select
            v-model:value="formData.productId"
            placeholder="请选择商品"
            @change="handleProductChange"
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
        <a-form-item label="商品类型" name="productTypeId">
          <a-select
            v-model:value="formData.productTypeId"
            placeholder="请选择商品类型"
            @change="handleProductTypeChange"
            disabled
          >
            <a-select-option
              v-for="item in categoryOptions"
              :key="item.dictCode"
              :value="item.dictValue"
            >
              {{ item.dictLabel }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签类型" name="tagTypeId">
          <a-select v-model:value="formData.tagTypeId" placeholder="请选择标签类型" @change="handleTagTypeChange">
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
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import request from '@/api/request'
import dayjs from 'dayjs'
import { Form } from 'ant-design-vue'

// 表格列定义
const columns = [
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 200,
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
    width: 150,
    customRender: ({ text }) => {
      return text ? text : '--'
    }
  },
  {
    title: '标签数据',
    dataIndex: 'tagData',
    width: 150,
  },
  {
    title: '验证次数',
    dataIndex: 'verificationCount',
    width: 100,
  },
  {
    title: '验证结果',
    dataIndex: 'verificationResult',
    width: 100,
  },
  {
    title: '最近验证时间',
    dataIndex: 'lastVerificationTime',
    width: 180,
    customRender: ({ text }) => {
      return text ? formatDateTime(text) : '--'
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right'
  }
]

// 状态变量
const loading = ref(false)
const productList = ref([])
const total = ref(0)
const selectedRowKeys = ref([])
const selectedAll = ref(false)
const categoryOptions = ref([])
const tagTypeOptions = ref([])
const productOptions = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: '',
  productTypeId: undefined,
  verificationResult: ''
})

// 图片预览相关
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

// 商品详情相关
const viewVisible = ref(false)
const currentProduct = ref({})

// 表单相关
const formRef = ref()
const formModalVisible = ref(false)
const formSubmitting = ref(false)
const formMode = ref('add') // 'add' 或 'edit'
const formData = reactive({
  id: undefined,
  productId: undefined,
  productName: '',
  productTypeId: undefined,
  productType: '',
  tagTypeId: undefined,
  tagType: '',
  tagData: '',
  verificationCount: 0,
  verificationResult: null,
  lastVerificationTime: null
})

// 表单校验规则
const formRules = {
  productId: [{ required: true, message: '请选择商品' }],
  productTypeId: [{ required: true, message: '请选择商品类型' }],
  tagTypeId: [{ required: true, message: '请选择标签类型' }],
  tagData: [{ required: true, message: '请输入标签数据' }]
}

// 构建查询参数
const buildQueryParams = () => {
  const params = { ...queryParams }
  // 移除空值参数
  Object.keys(params).forEach(key => {
    if (params[key] === '') {
      delete params[key]
    }
  })
  return params
}

// 获取售后标签数据
const fetchProductList = async () => {
  loading.value = true
  try {
    const params = buildQueryParams()
    const res = await request.get('/biz/tag/list', { params })
    if (res && res.rows) {
      productList.value = res.rows || []
      total.value = res.total || 0
      
      // 更新全选状态
      selectedAll.value = selectedRowKeys.value.length > 0 && selectedRowKeys.value.length === productList.value.length
    } else {
      productList.value = []
      total.value = 0
      message.error('获取标签列表失败')
    }
  } catch (error) {
    console.error('获取标签列表失败', error)
    message.error('获取标签列表失败')
    productList.value = []
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

// 分页处理
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page
  queryParams.pageSize = pageSize
  fetchProductList()
}

// 页面大小改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  fetchProductList()
}

// 搜索处理
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchProductList()
}

// 选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
  selectedAll.value = keys.length > 0 && keys.length === productList.value.length
}

// 全选
const handleSelectAll = (e) => {
  const checked = e.target.checked
  selectedRowKeys.value = checked ? productList.value.map(item => item.id) : []
}

// 恢复出厂
const handleRecover = async (record) => {
  try {
    // 使用标签修改接口
    const res = await request.put('/biz/tag', {
      id: record.id,
      tagData: record.tagData,
      tagType: record.tagType,
      tagTypeId: record.tagTypeId,
      productId: record.productId,
      productName: record.productName,
      productType: record.productType,
      productTypeId: record.productTypeId,
      verificationCount: 0, // 重置验证次数
      verificationResult: null // 重置验证结果
    })
    
    if (res.code === 200) {
      message.success(`恢复出厂成功: ${record.productName}`)
      fetchProductList()
    } else {
      message.error(res.msg || '恢复出厂失败')
    }
  } catch (error) {
    console.error('恢复出厂失败:', error)
    message.error('恢复出厂失败')
  }
}

// 批量恢复出厂
const handleBatchRecover = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要恢复的商品')
    return
  }
  
  try {
    // 创建所有选中标签的恢复请求
    const promises = selectedRowKeys.value.map(id => {
      const record = productList.value.find(item => item.id === id)
      if (!record) return null
      
      return request.put('/biz/tag', {
        id: record.id,
        tagData: record.tagData,
        tagType: record.tagType,
        tagTypeId: record.tagTypeId,
        productId: record.productId,
        productName: record.productName,
        productType: record.productType,
        productTypeId: record.productTypeId,
        verificationCount: 0, // 重置验证次数
        verificationResult: null // 重置验证结果
      })
    }).filter(Boolean)
    
    await Promise.all(promises)
    message.success(`批量恢复出厂成功: ${selectedRowKeys.value.length} 个商品`)
    // 刷新数据
    fetchProductList()
    // 清空选择
    selectedRowKeys.value = []
  } catch (error) {
    console.error('批量恢复出厂失败:', error)
    message.error('批量恢复出厂失败')
  }
}

// 图片预览
const handlePreviewImg = (url) => {
  previewImage.value = url
  previewVisible.value = true
}

// 日期格式化
const formatDateTime = (dateStr) => {
  if (!dateStr) return '--'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// 商品变化
const handleProductChange = (value) => {
  const selected = productOptions.value.find(item => item.id === value)
  if (selected) {
    formData.productName = selected.productName
    // 如果商品已有类型，也可以设置商品类型
    if (selected.productTypeId) {
      formData.productTypeId = String(selected.productTypeId)
      formData.productType = selected.productType
    }
  }
}

// 商品类型变化
const handleProductTypeChange = (value) => {
  const selected = categoryOptions.value.find(item => item.dictValue === value)
  if (selected) {
    formData.productType = selected.dictLabel
  }
}

// 标签类型变化
const handleTagTypeChange = (value) => {
  const selected = tagTypeOptions.value.find(item => item.dictValue === value)
  if (selected) {
    formData.tagType = selected.dictValue
  }
}

// 表单提交
const handleFormSubmit = async () => {
  try {
    await formRef.value.validate()
    formSubmitting.value = true
    
    if (formMode.value === 'add') {
      // 新增标签
      const res = await request.post('/biz/tag', formData)
      if (res.code === 200) {
        message.success('新增成功')
        formModalVisible.value = false
        fetchProductList()
      } else {
        message.error(res.msg || '新增失败')
      }
    } else {
      // 编辑标签
      const res = await request.put('/biz/tag', formData)
      if (res.code === 200) {
        message.success('编辑成功')
        formModalVisible.value = false
        fetchProductList()
      } else {
        message.error(res.msg || '编辑失败')
      }
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    message.error('表单验证失败，请检查必填项')
  } finally {
    formSubmitting.value = false
  }
}

// 删除单个标签
const handleDelete = async (record) => {
  try {
    const res = await request.delete(`/biz/tag/${record.id}`)
    if (res.code === 200) {
      message.success('删除成功')
      fetchProductList()
    } else {
      message.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 批量删除标签
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的记录')
    return
  }

  try {
    const ids = selectedRowKeys.value.join(',')
    const res = await request.delete(`/biz/tag/${ids}`)
    if (res.code === 200) {
      message.success(`成功删除${selectedRowKeys.value.length}条记录`)
      selectedRowKeys.value = []
      fetchProductList()
    } else {
      message.error(res.msg || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    message.error('批量删除失败')
  }
}

// 新增按钮点击
const handleAdd = () => {
  formMode.value = 'add'
  formData.id = undefined
  formData.productId = undefined
  formData.productName = ''
  formData.productTypeId = undefined
  formData.productType = ''
  formData.tagTypeId = undefined
  formData.tagType = ''
  formData.tagData = ''
  formData.verificationCount = 0
  formData.verificationResult = null
  formData.lastVerificationTime = null
  formModalVisible.value = true
}

// 编辑按钮点击
const handleEdit = (record) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    ...record,
    productTypeId: record.productTypeId.toString(),
  })
  formModalVisible.value = true
}

// 生命周期钩子
onMounted(() => {
  fetchCategoryOptions()
  fetchTagTypeOptions()
  fetchProductOptions()
  fetchProductList()
})
</script>

<style scoped lang="less">
.after-sales {
  padding: 24px;
  background: #fff;
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .right-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .download-template-btn {
    margin-bottom: 20px;
    padding: 0;
  }

  .import-steps {
    .step-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .step-number {
        background: #1890ff;
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        margin-right: 16px;
        font-size: 14px;
        flex-shrink: 0;
      }

      .step-info {
        flex: 1;

        p {
          margin: 0 0 12px;
          color: #00000073;
        }
      }
    }
  }

  .upload-area {
    width: 100%;
    
    :deep(.ant-upload.ant-upload-select) {
      width: 100%;
    }

    .upload-trigger {
      padding: 32px;
      background: #fafafa;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #1890ff;
        background: #e6f7ff;

        .upload-icon {
          color: #1890ff;
        }

        .upload-btn {
          background: #1890ff;
          border-color: #1890ff;
        }
      }

      .upload-icon {
        margin-bottom: 16px;
        font-size: 32px;
        color: #00000040;
        transition: color 0.3s;
      }

      .upload-text {
        margin-bottom: 8px;
        color: #000000d9;
        font-size: 16px;
      }

      .upload-hint {
        color: #00000073;
        font-size: 13px;
        margin-bottom: 20px;
      }

      .upload-btn {
        padding: 8px 24px;
        height: auto;
        font-size: 14px;
        border-radius: 4px;
        background: #40a9ff;
        border-color: #40a9ff;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);

        &:hover {
          background: #1890ff;
          border-color: #1890ff;
        }
      }
    }
  }

  .upload-list-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f6ffed;
    border-radius: 4px;
    margin-top: 16px;

    .file-name {
      flex: 1;
      margin: 0 12px;
      color: #000000d9;
    }

    .file-size {
      color: #00000073;
      font-size: 12px;
    }
  }
}
</style> 