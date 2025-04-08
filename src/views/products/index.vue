<template>
  <div class="products-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索商品名称"
          style="width: 250px"
          @search="onSearch"
        />
        <a-select
          v-model:value="categoryFilter"
          placeholder="按分类筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部分类</a-select-option>
          <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
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
          <a-select-option value="1">在售</a-select-option>
          <a-select-option value="0">下架</a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="showAddModal">
        <plus-outlined /> 添加商品
      </a-button>
    </div>

    <!-- 商品表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredProducts"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1400 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 商品图片 -->
        <template v-if="column.dataIndex === 'image'">
          <img :src="record.image" alt="商品图片" class="product-image" />
        </template>
        
        <!-- 商品价格 -->
        <template v-if="column.dataIndex === 'price'">
          ¥{{ record.price.toFixed(2) }}
        </template>
        
        <!-- 商品状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '在售' : '下架' }}
          </a-tag>
        </template>
        
        <!-- 操作按钮 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              <edit-outlined /> 编辑
            </a-button>
            <a-button type="link" size="small" @click="showViewModal(record)">
              <eye-outlined /> 查看
            </a-button>
            <a-popconfirm
              title="确定要删除该商品吗?"
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

    <!-- 添加/编辑商品弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
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
            <a-radio :value="1">在售</a-radio>
            <a-radio :value="0">下架</a-radio>
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
      v-model:visible="previewVisible"
      :title="previewTitle"
      :footer="null"
    >
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 查看商品详情 -->
    <a-modal
      v-model:visible="viewVisible"
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
          <a-tag :color="currentProduct.status === 1 ? 'green' : 'red'">
            {{ currentProduct.status === 1 ? '在售' : '下架' }}
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
// import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api/product'

// 表格列定义
const columns = [
  {
    title: '商品图片',
    dataIndex: 'image',
    width: 100,
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category',
    customRender: ({ text }) => getCategoryLabel(text),
  },
  {
    title: '价格',
    dataIndex: 'price',
    sorter: true,
  },
  {
    title: '库存',
    dataIndex: 'stock',
    sorter: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '在售', value: 1 },
      { text: '下架', value: 0 },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    sorter: true,
    customRender: ({ text }) => formatDate(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 分类选项
const categories = [
  { label: '服装', value: 'clothing' },
  { label: '电子', value: 'electronics' },
  { label: '食品', value: 'food' },
  { label: '家具', value: 'furniture' },
  { label: '其他', value: 'other' },
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
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
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
    // 这里应该替换为真实的API调用
    // const response = await getProducts({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    //   keyword: searchValue.value,
    //   category: categoryFilter.value,
    //   status: statusFilter.value
    // })
    // products.value = response.items
    // pagination.total = response.total
    
    // 模拟数据
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
  
  // 搜索过滤
  if (searchValue.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchValue.value.toLowerCase())
    )
  }
  
  // 分类过滤
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
    // 实际项目中，这里应该发起请求进行服务端排序
    const order = sorter.order === 'ascend' ? 1 : -1
    products.value.sort((a, b) => {
      if (sorter.field === 'price' || sorter.field === 'stock') {
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
      // 更新商品 - 实际项目中应调用API
      // await updateProduct(formData.id, values)
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
      // 添加商品 - 实际项目中应调用API
      // await createProduct(values)
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
    // 模拟上传 - 实际项目中应调用上传API
    // uploadProductImage(file).then(response => {
    //   file.url = response.url
    //   fileList.value = [file]
    // })
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
  // 实际项目中应调用API
  // await deleteProduct(id)
  const index = products.value.findIndex(item => item.id === id)
  if (index !== -1) {
    products.value.splice(index, 1)
    message.success('商品删除成功')
  }
}
</script>

<style scoped lang="less">
.products-container {
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
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