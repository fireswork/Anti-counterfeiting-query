<template>
  <div class="records-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="queryParams.tagData"
          placeholder="搜索标签数据"
          style="width: 200px"
          @search="handleQuery"
          allowClear
        />
        <a-input-search
          v-model:value="queryParams.productName"
          placeholder="搜索商品名称"
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
          <a-select-option v-for="item in categoryOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
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
          <a-select-option value="1">验证成功</a-select-option>
          <a-select-option value="0">验证失败</a-select-option>
        </a-select>
        <a-button type="primary" @click="handleQuery">
          <template #icon><search-outlined /></template>
          查询
        </a-button>
        <a-button @click="resetQuery">
          <template #icon><redo-outlined /></template>
          重置
        </a-button>
      </a-space>
      <a-button type="primary" @click="handleAdd">
        <plus-outlined /> 新增记录
      </a-button>
    </div>

    <!-- 记录表格 -->
    <a-table
      :columns="columns"
      :data-source="logList"
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
      rowKey="id"
      bordered
      :scroll="{ x: 1400 }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 标签数据 -->
        <template v-if="column.dataIndex === 'tagData'">
          {{ record.tagData }}
        </template>

        <!-- 标签ID -->
        <template v-if="column.dataIndex === 'tagId'">
          {{ record.tagId }}
        </template>

        <!-- 商品名称 -->
        <template v-if="column.dataIndex === 'productName'">
          {{ record.productName }}
        </template>

        <!-- 商品类型 -->
        <template v-if="column.dataIndex === 'productType'">
          {{ record.productType }}
        </template>

        <!-- 验证地点 -->
        <template v-if="column.dataIndex === 'location'">
          {{ record.province || '--' }} {{ record.city || '--' }}
        </template>

        <!-- 验证次数 -->
        <template v-if="column.dataIndex === 'verificationCount'">
          {{ record.verificationCount || 0 }}
        </template>

        <!-- 验证时间 -->
        <template v-if="column.dataIndex === 'verificationTime'">
          {{ formatDate(record.verificationTime) }}
        </template>

        <!-- 验证结果 -->
        <template v-if="column.dataIndex === 'verificationResult'">
          <a-tag :color="record.verificationResult === '1' ? 'green' : 'red'">
            {{ record.verificationResult === '1' ? '成功' : '失败' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleView(record)">查看</a-button>
            <a-divider type="vertical" />
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该记录吗?"
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

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="查询记录详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="记录ID" span="2">{{ viewData.id }}</a-descriptions-item>
        <a-descriptions-item label="标签ID">{{ viewData.tagId }}</a-descriptions-item>
        <a-descriptions-item label="标签数据">{{ viewData.tagData }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ viewData.productName }}</a-descriptions-item>
        <a-descriptions-item label="商品ID">{{ viewData.productId }}</a-descriptions-item>
        <a-descriptions-item label="商品类型">{{ viewData.productType }}</a-descriptions-item>
        <a-descriptions-item label="商品类型ID">{{ viewData.productTypeId }}</a-descriptions-item>
        <a-descriptions-item label="省份">{{ viewData.province || '--' }}</a-descriptions-item>
        <a-descriptions-item label="城市">{{ viewData.city || '--' }}</a-descriptions-item>
        <a-descriptions-item label="验证次数">{{ viewData.verificationCount }}</a-descriptions-item>
        <a-descriptions-item label="验证结果">
          <a-tag :color="viewData.verificationResult === '1' ? 'green' : 'red'">
            {{ viewData.verificationResult === '1' ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="验证时间" span="2">{{ formatDate(viewData.verificationTime) }}</a-descriptions-item>
        <a-descriptions-item label="创建时间" span="2">{{ formatDate(viewData.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="更新时间" span="2">{{ formatDate(viewData.updatedAt) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 添加/编辑日志表单弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="formMode === 'add' ? '新增日志记录' : '编辑日志记录'"
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
        <a-form-item label="标签" name="tagId">
          <a-select
            v-model:value="formData.tagId"
            placeholder="请选择标签"
            @change="handleTagChange"
            allowClear
          >
            <a-select-option
              v-for="item in tagOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.tagData }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签数据" name="tagData">
          <a-input v-model:value="formData.tagData" placeholder="标签数据" disabled />
        </a-form-item>
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
        <a-form-item label="商品名称" name="productName">
          <a-input v-model:value="formData.productName" placeholder="商品名称" disabled />
        </a-form-item>
        <a-form-item label="商品类型" name="productType">
          <a-input v-model:value="formData.productType" placeholder="商品类型" disabled />
        </a-form-item>
        <a-form-item label="商品类型ID" name="productTypeId">
          <a-input v-model:value="formData.productTypeId" placeholder="商品类型ID" disabled />
        </a-form-item>
        <a-form-item label="省份" name="province">
          <a-input v-model:value="formData.province" placeholder="请输入省份" />
        </a-form-item>
        <a-form-item label="城市" name="city">
          <a-input v-model:value="formData.city" placeholder="请输入城市" />
        </a-form-item>
        <a-form-item label="验证次数" name="verificationCount">
          <a-input-number v-model:value="formData.verificationCount" placeholder="验证次数" style="width: 100%;" :min="0" />
        </a-form-item>
        <a-form-item label="验证结果" name="verificationResult">
          <a-select v-model:value="formData.verificationResult" placeholder="请选择验证结果">
            <a-select-option value="1">验证成功</a-select-option>
            <a-select-option value="0">验证失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="验证时间" name="verificationTime">
          <a-date-picker 
            v-model:value="formData.verificationTime" 
            placeholder="请选择验证时间" 
            style="width: 100%;" 
            show-time
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, RedoOutlined, PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import request from '@/api/request'

// 表格列定义
const columns = [
  {
    title: '标签数据',
    dataIndex: 'tagData',
    width: 150,
  },
  {
    title: '标签ID',
    dataIndex: 'tagId',
    width: 100,
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 150,
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
    width: 120,
  },
  {
    title: '验证地点',
    dataIndex: 'location',
    width: 150,
    customRender: ({record}) => {
      return `${record.province || '--'} ${record.city || '--'}`
    }
  },
  {
    title: '验证次数',
    dataIndex: 'verificationCount',
    width: 100,
    sorter: true,
  },
  {
    title: '验证时间',
    dataIndex: 'verificationTime',
    width: 170,
    sorter: true,
  },
  {
    title: '验证结果',
    dataIndex: 'verificationResult',
    width: 100,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 240,
    fixed: 'right',
  },
]

// 状态变量
const loading = ref(false)
const logList = ref([])
const total = ref(0)
const viewModalVisible = ref(false)
const categoryOptions = ref([])
const productOptions = ref([])
const tagOptions = ref([])
const formModalVisible = ref(false)
const submitLoading = ref(false)
const formMode = ref('add') // 'add' 或 'edit'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tagData: '',
  productName: '',
  productTypeId: undefined,
  verificationResult: undefined
})

// 查看详情数据
const viewData = reactive({
  id: '',
  tagId: '',
  tagData: '',
  productId: '',
  productName: '',
  productType: '',
  productTypeId: '',
  city: '',
  province: '',
  verificationCount: 0,
  verificationResult: '',
  verificationTime: null,
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  updatedBy: ''
})

// 表单对象
const formRef = ref(null)
const formData = reactive({
  id: undefined,
  tagId: '',
  tagData: '',
  productId: undefined,
  productName: '',
  productType: '',
  productTypeId: undefined,
  city: '',
  province: '',
  verificationCount: 0,
  verificationResult: '1',
  verificationTime: null
})

// 表单校验规则
const rules = {
  tagId: [
    { required: true, message: '请选择标签', trigger: 'change' }
  ],
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  verificationResult: [
    { required: true, message: '请选择验证结果', trigger: 'change' }
  ],
  verificationCount: [
    { required: true, message: '请输入验证次数', trigger: 'blur' }
  ],
  verificationTime: [
    { required: true, message: '请选择验证时间', trigger: 'change', type: 'object' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取日志列表
const getLogList = async () => {
  loading.value = true
  try {
    const res = await request.get('/biz/log/list', { params: queryParams })
    if (res && res.rows) {
      logList.value = res.rows || []
      total.value = res.total || 0
    } else {
      logList.value = []
      total.value = 0
      message.error('获取日志列表失败')
    }
  } catch (error) {
    console.error('获取日志列表失败', error)
    message.error('获取日志列表失败')
    logList.value = []
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

// 获取标签列表
const fetchTagOptions = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 999,
    }
    const res = await request.get('/biz/tag/list', { params })
    tagOptions.value = res.rows || []
  } catch (error) {
    console.error('获取标签列表失败', error)
    message.error('获取标签列表失败')
  }
}

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1
  getLogList()
}

// 重置查询
const resetQuery = () => {
  queryParams.tagData = ''
  queryParams.productName = ''
  queryParams.productTypeId = undefined
  queryParams.verificationResult = undefined
  queryParams.pageNum = 1
  getLogList()
}

// 查看详情
const handleView = async (record) => {
  try {
    const res = await request.get(`/biz/log/${record.id}`)
    if (res && res.data) {
      Object.assign(viewData, res.data)
      viewModalVisible.value = true
    } else {
      message.error('获取日志详情失败')
    }
  } catch (error) {
    console.error('获取日志详情失败', error)
    message.error('获取日志详情失败')
  }
}

// 删除日志
const handleDelete = async (record) => {
  try {
    const res = await request.delete(`/biz/log/${record.id}`)
    if (res.code === 200) {
      message.success('删除成功')
      getLogList()
    } else {
      message.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 表格变化处理
const handleTableChange = (pagination, filters, sorter) => {
  queryParams.pageNum = pagination.current
  queryParams.pageSize = pagination.pageSize
  getLogList()
}

// 分页改变
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page
  queryParams.pageSize = pageSize
  getLogList()
}

// 每页条数改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  getLogList()
}

// 标签选择变化
const handleTagChange = (value) => {
  const selected = tagOptions.value.find(item => item.id === value)
  if (selected) {
    formData.tagData = selected.tagData
    // 如果标签已关联商品，也可以设置商品信息
    if (selected.productId) {
      formData.productId = selected.productId
      formData.productName = selected.productName
      formData.productType = selected.productType
      formData.productTypeId = selected.productTypeId
    }
  }
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

// 新增日志记录
const handleAdd = () => {
  formMode.value = 'add'
  formData.id = undefined
  formData.tagId = undefined
  formData.tagData = ''
  formData.productId = undefined
  formData.productName = ''
  formData.productType = ''
  formData.productTypeId = undefined
  formData.city = ''
  formData.province = ''
  formData.verificationCount = 0
  formData.verificationResult = '1'
  formData.verificationTime = dayjs()
  formModalVisible.value = true
}

// 编辑日志记录
const handleEdit = async (record) => {
  formMode.value = 'edit'
  try {
    const res = await request.get(`/biz/log/${record.id}`)
    if (res && res.data) {
      const data = res.data
      Object.assign(formData, data)
      
      // 处理日期格式
      if (data.verificationTime) {
        formData.verificationTime = dayjs(data.verificationTime)
      }
      
      formModalVisible.value = true
    } else {
      message.error('获取日志详情失败')
    }
  } catch (error) {
    console.error('获取日志详情失败', error)
    message.error('获取日志详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 处理日期格式
    const submitData = { ...formData }
    if (submitData.verificationTime) {
      submitData.verificationTime = submitData.verificationTime.format('YYYY-MM-DD HH:mm:ss')
    }
    
    if (formMode.value === 'add') {
      // 新增日志
      const res = await request.post('/biz/log', submitData)
      if (res.code === 200) {
        message.success('新增成功')
        formModalVisible.value = false
        getLogList()
      } else {
        message.error(res.msg || '新增失败')
      }
    } else {
      // 编辑日志
      const res = await request.put('/biz/log', submitData)
      if (res.code === 200) {
        message.success('编辑成功')
        formModalVisible.value = false
        getLogList()
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

// 生命周期钩子
onMounted(() => {
  fetchCategoryOptions()
  fetchProductOptions()
  fetchTagOptions()
  getLogList()
})
</script>

<style scoped lang="less">
.records-container {
  padding: 24px;
  background: #fff;
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style> 