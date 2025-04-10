<template>
  <div class="products-list">
    <h1>商品管理</h1>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="商品名称搜索"
          style="width: 200px"
          @search="onSearch"
          allowClear
        />
        <a-select
          v-model:value="categoryFilter"
          placeholder="商品分类"
          style="width: 150px"
          @change="onFilterChange"
          allowClear
        >
          <a-select-option value="">全部分类</a-select-option>
          <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="statusFilter"
          placeholder="商品状态"
          style="width: 150px"
          @change="onFilterChange"
          allowClear
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="1">已出库</a-select-option>
          <a-select-option value="0">未出库</a-select-option>
          <a-select-option value="2">待审核</a-select-option>
        </a-select>
        <a-button type="primary" @click="handleSearch">
          <template #icon><search-outlined /></template>
          查询
        </a-button>
        <a-button @click="handleReset">
          <template #icon><reload-outlined /></template>
          重置
        </a-button>
      </a-space>
      <a-button type="primary" @click="showAddModal">
        <plus-outlined />添加商品
      </a-button>
    </div>

    <!-- 商品列表 -->
    <a-table
      :columns="columns"
      :data-source="filteredProducts"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      :scroll="{ x: 1300 }"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      bordered
    >
      <!-- 表格列配置 -->
      <template #bodyCell="{ column, record }">
        <!-- 商品图片和名称列 -->
        <template v-if="column.dataIndex === 'productInfo'">
          <div class="product-info">
            <img :src="record.image" :alt="record.name" class="product-image" />
            <span class="product-name">{{ record.name }}</span>
          </div>
        </template>
        
        <!-- 商品状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'orange'">
            {{ record.status === 1 ? '已出库' : '未出库' }}
          </a-tag>
        </template>
        
        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-divider type="vertical" />
            <a @click="handleBatchManage(record)">批次管理</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                更多 <down-outlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="handleView(record)">查看详情</a-menu-item>
                  <a-menu-item key="2" @click="handleDelete(record)">删除</a-menu-item>
                  <a-menu-item key="3" @click="handleStatusChange(record)">
                    {{ record.status === 1 ? '下架' : '上架' }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 批量操作工具栏 -->
    <div v-show="selectedRowKeys.length" class="batch-operation-bar">
      <span>已选择 {{ selectedRowKeys.length }} 项</span>
      <a-space>
        <a-button type="primary" @click="handleBatchDelete">
          批量删除
        </a-button>
        <a-button @click="handleBatchStatus(1)">
          批量出库
        </a-button>
        <a-button @click="handleBatchStatus(0)">
          批量入库
        </a-button>
      </a-space>
    </div>

    <!-- 添加/编辑商品弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      @ok="handleModalOk"
      width="700px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="商品名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入商品名称" />
        </a-form-item>
        
        <a-form-item label="商品分类" name="category">
          <a-select v-model:value="formData.category" placeholder="请选择商品分类">
            <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="商品价格" name="price">
          <a-input-number 
            v-model:value="formData.price" 
            :min="0" 
            :precision="2" 
            style="width: 100%"
            placeholder="请输入商品价格" 
          />
        </a-form-item>
        
        <a-form-item label="库存数量" name="stock">
          <a-input-number 
            v-model:value="formData.stock" 
            :min="0" 
            style="width: 100%"
            placeholder="请输入库存数量" 
          />
        </a-form-item>
        
        <a-form-item label="商品状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">已出库</a-radio>
            <a-radio :value="0">未出库</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="商品图片" name="image">
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
        
        <a-form-item label="商品描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            :rows="4" 
            placeholder="请输入商品描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
    >
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 查看商品详情 -->
    <a-modal
      v-model:open="viewVisible"
      title="商品详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="商品名称">{{ currentProduct.name }}</a-descriptions-item>
        <a-descriptions-item label="商品分类">
          {{ getCategoryLabel(currentProduct.category) }}
        </a-descriptions-item>
        <a-descriptions-item label="商品价格">¥{{ currentProduct.price?.toFixed(2) }}</a-descriptions-item>
        <a-descriptions-item label="库存数量">{{ currentProduct.stock }}</a-descriptions-item>
        <a-descriptions-item label="商品状态">
          <a-tag :color="currentProduct.status === 1 ? 'green' : 'orange'">
            {{ currentProduct.status === 1 ? '已出库' : '未出库' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="商品图片">
          <img :src="currentProduct.image" alt="商品图片" class="product-detail-image" />
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(currentProduct.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ formatDate(currentProduct.updatedAt) }}</a-descriptions-item>
        <a-descriptions-item label="商品描述">{{ currentProduct.description }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 生成防伪码弹窗 -->
    <a-modal
      v-model:open="codeModalVisible"
      title="生成防伪码"
      @ok="handleCodeGenerate"
      :confirmLoading="codeGenerating"
    >
      <a-form
        :model="codeForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="商品名称">
          <span>{{ currentProduct.name }}</span>
        </a-form-item>
        <a-form-item label="生成数量" name="quantity">
          <a-input-number
            v-model:value="codeForm.quantity"
            :min="1"
            :max="10000"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="批次编号" name="batchNo">
          <a-input v-model:value="codeForm.batchNo" placeholder="请输入批次编号" />
        </a-form-item>
        <a-form-item label="生产日期" name="productionDate">
          <a-date-picker
            v-model:value="codeForm.productionDate"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="有效期" name="expiryDate">
          <a-date-picker
            v-model:value="codeForm.expiryDate"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批次管理弹窗 -->
    <a-modal
      v-model:open="batchModalVisible"
      title="批次管理"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="batchColumns"
        :data-source="batchList"
        :loading="batchLoading"
        :pagination="{ pageSize: 5 }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getBatchStatusColor(record.status)">
              {{ getBatchStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a @click="handleBatchDetail(record)">查看详情</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  onShelfProduct,
  offShelfProduct,
  uploadProductImage
} from '@/api/product'

// 表格列定义
const columns = [
  {
    title: '商品图片/商品名称',
    dataIndex: 'productInfo',
    width: '300px',
  },
  {
    title: '商品类型',
    dataIndex: 'category',
    width: '150px',
  },
  {
    title: '商品ID',
    dataIndex: 'id',
    width: '150px',
  },
  {
    title: '商品状态',
    dataIndex: 'status',
    width: '120px',
  },
  {
    title: '验证次数',
    dataIndex: 'verificationCount',
    width: '100px',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '180px',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: '180px',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '250px',
    fixed: 'right',
  },
]

// 商品分类选项
const categories = [
  { label: '数码电子', value: 'electronics' },
  { label: '服装服饰', value: 'clothing' },
  { label: '食品饮料', value: 'food' },
  { label: '美妆护肤', value: 'beauty' },
  { label: '家居用品', value: 'home' }
]

// 获取分类标签
const getCategoryLabel = (value) => {
  const category = categories.find(c => c.value === value)
  return category ? category.label : '未知分类'
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
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

// 模拟数据
const products = ref([])
onMounted(() => {
  fetchProducts()
})

// 获取商品数据
const fetchProducts = async () => {
  loading.value = true
  try {
    // 模拟数据加载
    setTimeout(() => {
      const mockData = []
      for (let i = 1; i <= 50; i++) {
        mockData.push({
          id: i,
          name: `商品名称 ${i}`,
          category: categories[i % 5].value,
          price: Math.round(Math.random() * 1000) / 100 + 10,
          stock: Math.floor(Math.random() * 100) + 1,
          status: i % 3 === 0 ? 0 : 1,
          image: `https://picsum.photos/id/${i + 10}/100/100`,
          description: `这是商品${i}的详细描述信息，包含了商品的各种特性和使用方法。`,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
        })
      }
      products.value = mockData
      pagination.total = mockData.length
      loading.value = false
    }, 500)
  } catch (error) {
    message.error('获取商品列表失败')
    loading.value = false
  }
}

// 过滤后的商品列表
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 按名称搜索
  if (searchValue.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchValue.value.toLowerCase())
    )
  }
  
  // 按分类筛选
  if (categoryFilter.value) {
    result = result.filter(item => item.category === categoryFilter.value)
  }
  
  // 按状态筛选
  if (statusFilter.value) {
    result = result.filter(item => item.status === Number(statusFilter.value))
  }
  
  return result
})

// 搜索处理
const handleSearch = () => {
  // 触发表格重新加载
  loadProducts()
}

// 重置筛选条件
const handleReset = () => {
  searchValue.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  // 触发表格重新加载
  loadProducts()
}

// 加载商品列表
const loadProducts = async () => {
  try {
    loading.value = true
    // TODO: 调用API获取商品列表
    // const params = {
    //   name: searchValue.value,
    //   category: categoryFilter.value,
    //   status: statusFilter.value,
    //   page: pagination.current,
    //   pageSize: pagination.pageSize
    // }
    // const response = await fetch('/api/products', { params })
    // const data = await response.json()
    // products.value = data.items
    // pagination.total = data.total
  } catch (error) {
    message.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadProducts()
}

// 添加/编辑模态框相关
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  name: '',
  category: undefined,
  price: 0,
  stock: 0,
  status: 1,
  image: '',
  description: '',
})

const fileList = ref([])
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择商品状态', trigger: 'change' }],
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'status' ? 1 : (key === 'price' || key === 'stock' ? 0 : '')
  })
  fileList.value = []
  modalVisible.value = true
}

// 显示编辑模态框
const showEditModal = (record) => {
  isEdit.value = true
  Object.keys(formData).forEach(key => {
    formData[key] = record[key]
  })
  fileList.value = record.image ? [{
    uid: '-1',
    name: 'image.png',
    status: 'done',
    url: record.image,
  }] : []
  modalVisible.value = true
}

// 处理模态框确认
const handleModalOk = () => {
  formRef.value.validateFields().then(values => {
    // 设置图片URL
    if (fileList.value.length > 0) {
      values.image = fileList.value[0].url || fileList.value[0].response?.url
    }
    
    if (isEdit.value) {
      // 更新商品
      const index = products.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...values,
          updatedAt: new Date(),
        }
        message.success('商品更新成功')
      }
    } else {
      // 添加商品
      const newProduct = {
        ...values,
        id: products.value.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      products.value.unshift(newProduct)
      message.success('商品添加成功')
    }
    
    modalVisible.value = false
  }).catch(error => {
    console.error('验证失败:', error)
  })
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

// 查看商品详情
const viewVisible = ref(false)
const currentProduct = ref({})

const showViewModal = (record) => {
  currentProduct.value = record
  viewVisible.value = true
}

// 删除商品
const handleDelete = async (id) => {
  const index = products.value.findIndex(item => item.id === id)
  if (index !== -1) {
    products.value.splice(index, 1)
    message.success('商品删除成功')
  }
}

// 批量操作相关
const handleBatchDelete = () => {
  // 实现批量删除功能
  console.log('批量删除:', selectedRowKeys.value)
}

const handleBatchStatus = (status) => {
  // 实现批量更新状态功能
  console.log('批量更新状态:', status, selectedRowKeys.value)
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const handleEdit = (record) => {
  // 实现编辑功能
  console.log('编辑商品:', record)
}

// 防伪码生成相关
const codeModalVisible = ref(false)
const codeGenerating = ref(false)
const codeForm = reactive({
  quantity: 100,
  batchNo: '',
  productionDate: null,
  expiryDate: null
})

// 批次管理相关
const batchModalVisible = ref(false)
const batchLoading = ref(false)
const batchList = ref([])
const batchColumns = [
  { title: '批次编号', dataIndex: 'batchNo', width: 120 },
  { title: '生成数量', dataIndex: 'quantity', width: 100 },
  { title: '已使用数量', dataIndex: 'usedQuantity', width: 100 },
  { title: '生产日期', dataIndex: 'productionDate', width: 120 },
  { title: '有效期', dataIndex: 'expiryDate', width: 120 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '操作', dataIndex: 'action', width: 150 }
]

// 生成防伪码
const handleCodeGenerate = async () => {
  try {
    codeGenerating.value = true
    // TODO: 调用生成防伪码API
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('防伪码生成成功')
    codeModalVisible.value = false
  } catch (error) {
    message.error('防伪码生成失败')
  } finally {
    codeGenerating.value = false
  }
}

// 处理批次管理
const handleBatchManage = (record) => {
  currentProduct.value = record
  batchModalVisible.value = true
  loadBatchList()
}

// 加载批次列表
const loadBatchList = async () => {
  try {
    batchLoading.value = true
    // TODO: 调用获取批次列表API
    batchList.value = [
      {
        id: 1,
        batchNo: 'B202304090001',
        quantity: 1000,
        usedQuantity: 100,
        productionDate: '2023-04-09',
        expiryDate: '2024-04-09',
        status: 1
      }
    ]
  } catch (error) {
    message.error('加载批次列表失败')
  } finally {
    batchLoading.value = false
  }
}

// 获取批次状态颜色
const getBatchStatusColor = (status) => {
  const colors = {
    0: 'orange',
    1: 'green',
    2: 'red'
  }
  return colors[status] || 'default'
}

// 获取批次状态文本
const getBatchStatusText = (status) => {
  const texts = {
    0: '未启用',
    1: '已启用',
    2: '已停用'
  }
  return texts[status] || '未知'
}

// 查看批次详情
const handleBatchDetail = (record) => {
  // TODO: 实现批次详情查看
}

// 导出防伪码
const handleExportCodes = (record) => {
  // TODO: 实现防伪码导出
}

// 处理商品状态变更
const handleStatusChange = async (record) => {
  try {
    if (record.status === 1) {
      await offShelfProduct(record.id)
      message.success('商品下架成功')
    } else {
      await onShelfProduct(record.id)
      message.success('商品上架成功')
    }
    loadData()
  } catch (error) {
    message.error('操作失败')
  }
}
</script>

<style scoped lang="less">
.products-list {
  .ant-space {
    white-space: nowrap;
  }
  h1 {
    margin-bottom: 24px;
  }
  
  .search-bar {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-name {
      color: #333;
    }
  }

  .batch-operation-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 24px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
  }

  .product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .product-detail-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
}
</style> 