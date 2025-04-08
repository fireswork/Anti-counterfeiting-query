<template>
  <div class="customers-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索客户名称/联系人"
          style="width: 250px"
          @search="onSearch"
        />
        <a-select
          v-model:value="typeFilter"
          placeholder="按客户类型筛选"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="type in customerTypes" :key="type.value" :value="type.value">
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
          <a-select-option value="1">活跃</a-select-option>
          <a-select-option value="0">非活跃</a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="showAddModal"> <plus-outlined /> 添加客户 </a-button>
    </div>

    <!-- 客户表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredCustomers"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1400 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 客户状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '活跃' : '非活跃' }}
          </a-tag>
        </template>

        <!-- 客户类型 -->
        <template v-if="column.dataIndex === 'type'">
          {{ getTypeLabel(record.type) }}
        </template>

        <!-- 注册时间 -->
        <template v-if="column.dataIndex === 'createdAt'">
          {{ formatDate(record.createdAt) }}
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
              title="确定要删除该客户吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" danger size="small"> <delete-outlined /> 删除 </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑客户弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑客户' : '添加客户'"
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
        <a-form-item label="客户名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入客户名称" />
        </a-form-item>

        <a-form-item label="联系人" name="contactPerson">
          <a-input v-model:value="formData.contactPerson" placeholder="请输入联系人姓名" />
        </a-form-item>

        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>

        <a-form-item label="电子邮箱" name="email">
          <a-input v-model:value="formData.email" placeholder="请输入电子邮箱" />
        </a-form-item>

        <a-form-item label="客户类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择客户类型">
            <a-select-option v-for="type in customerTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="客户状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">活跃</a-radio>
            <a-radio :value="0">非活跃</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="地址" name="address">
          <a-textarea v-model:value="formData.address" :rows="2" placeholder="请输入客户地址" />
        </a-form-item>

        <a-form-item label="备注" name="remarks">
          <a-textarea v-model:value="formData.remarks" :rows="2" placeholder="请输入备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看客户详情 -->
    <a-modal v-model:visible="viewVisible" title="客户详情" :footer="null" width="700px">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="客户名称">{{ currentCustomer.name }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{
          currentCustomer.contactPerson
        }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentCustomer.phone }}</a-descriptions-item>
        <a-descriptions-item label="电子邮箱">{{ currentCustomer.email }}</a-descriptions-item>
        <a-descriptions-item label="客户类型">
          {{ getTypeLabel(currentCustomer.type) }}
        </a-descriptions-item>
        <a-descriptions-item label="客户状态">
          <a-tag :color="currentCustomer.status === 1 ? 'green' : 'red'">
            {{ currentCustomer.status === 1 ? '活跃' : '非活跃' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="地址">{{ currentCustomer.address }}</a-descriptions-item>
        <a-descriptions-item label="注册时间">{{
          formatDate(currentCustomer.createdAt)
        }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{
          formatDate(currentCustomer.updatedAt)
        }}</a-descriptions-item>
        <a-descriptions-item label="最近订单时间">{{
          formatDate(currentCustomer.lastOrderDate)
        }}</a-descriptions-item>
        <a-descriptions-item label="总订单数">{{ currentCustomer.orderCount }}</a-descriptions-item>
        <a-descriptions-item label="总消费金额"
          >¥{{ currentCustomer.totalSpent?.toFixed(2) }}</a-descriptions-item
        >
        <a-descriptions-item label="备注">{{ currentCustomer.remarks }}</a-descriptions-item>
      </a-descriptions>

      <!-- 客户订单历史记录 -->
      <div v-if="currentCustomer.orders && currentCustomer.orders.length > 0" class="order-history">
        <h3>订单历史记录</h3>
        <a-table
          :columns="orderColumns"
          :data-source="currentCustomer.orders"
          :scroll="{ x: 1400 }"
          :pagination="false"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'total'">
              ¥{{ record.total.toFixed(2) }}
            </template>
            <template v-if="column.dataIndex === 'orderTime'">
              {{ formatDate(record.orderTime) }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="getOrderStatusColor(record.status)">
                {{ getOrderStatusText(record.status) }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '客户名称',
    dataIndex: 'name',
    ellipsis: true
  },
  {
    title: '联系人',
    dataIndex: 'contactPerson'
  },
  {
    title: '联系电话',
    dataIndex: 'phone'
  },
  {
    title: '电子邮箱',
    dataIndex: 'email',
    ellipsis: true
  },
  {
    title: '客户类型',
    dataIndex: 'type'
  },
  {
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '活跃', value: 1 },
      { text: '非活跃', value: 0 }
    ]
  },
  {
    title: '总订单数',
    dataIndex: 'orderCount',
    sorter: true
  },
  {
    title: '总消费金额',
    dataIndex: 'totalSpent',
    sorter: true,
    customRender: ({ text }) => `¥${text.toFixed(2)}`
  },
  {
    title: '注册时间',
    dataIndex: 'createdAt',
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 订单历史列定义
const orderColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNumber'
  },
  {
    title: '订单时间',
    dataIndex: 'orderTime'
  },
  {
    title: '订单金额',
    dataIndex: 'total'
  },
  {
    title: '订单状态',
    dataIndex: 'status'
  }
]

// 客户类型选项
const customerTypes = [
  { label: '个人', value: 'individual' },
  { label: '企业', value: 'corporate' },
  { label: '代理商', value: 'agent' },
  { label: '政府机构', value: 'government' },
  { label: '其他', value: 'other' }
]

// 获取类型标签
const getTypeLabel = (value) => {
  const type = customerTypes.find((t) => t.value === value)
  return type ? type.label : '未知类型'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态颜色
const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    paid: 'blue',
    shipped: 'cyan',
    delivered: 'purple',
    completed: 'green',
    cancelled: 'red'
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
  showQuickJumper: true
})

// 模拟数据
const customers = ref([])
onMounted(() => {
  fetchCustomers()
})

// 获取客户数据
const fetchCustomers = async () => {
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const mockData = []
      const customerTypeValues = customerTypes.map((t) => t.value)

      for (let i = 1; i <= 50; i++) {
        const totalSpent = Math.round(Math.random() * 10000) / 100 + 500
        const orderCount = Math.floor(Math.random() * 20) + 1
        const lastOrderDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000))

        // 生成随机订单
        const orders = []
        for (let j = 1; j <= orderCount; j++) {
          const orderStatuses = [
            'pending',
            'paid',
            'shipped',
            'delivered',
            'completed',
            'cancelled'
          ]
          orders.push({
            id: j,
            orderNumber: `ORD${i}${j}${Math.floor(Math.random() * 1000)}`,
            orderTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
            total: Math.round(Math.random() * 1000) / 100 + 100,
            status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
          })
        }

        mockData.push({
          id: i,
          name: `客户${i}`,
          contactPerson: `联系人${i}`,
          phone: `1${Math.floor(Math.random() * 9 + 1)}${Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(10, '0')}`,
          email: `customer${i}@example.com`,
          type: customerTypeValues[i % customerTypeValues.length],
          status: i % 5 === 0 ? 0 : 1,
          address: `城市${(i % 10) + 1}，区域${(i % 5) + 1}，街道${i}号`,
          remarks: i % 3 === 0 ? `这是客户${i}的备注信息` : '',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 50000000000)),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 20000000000)),
          lastOrderDate,
          orderCount,
          totalSpent,
          orders
        })
      }

      customers.value = mockData
      pagination.total = mockData.length
      loading.value = false
    }, 500)
  } catch (error) {
    message.error('获取客户列表失败')
    loading.value = false
  }
}

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  let result = [...customers.value]

  // 搜索过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.contactPerson.toLowerCase().includes(keyword)
    )
  }

  // 类型过滤
  if (typeFilter.value) {
    result = result.filter((item) => item.type === typeFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    result = result.filter((item) => String(item.status) === statusFilter.value)
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
    customers.value.sort((a, b) => {
      if (sorter.field === 'orderCount' || sorter.field === 'totalSpent') {
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
  contactPerson: '',
  phone: '',
  email: '',
  type: undefined,
  status: 1,
  address: '',
  remarks: ''
})

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  type: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择客户状态', trigger: 'change' }]
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  Object.keys(formData).forEach((key) => {
    formData[key] = key === 'status' ? 1 : ''
  })
  modalVisible.value = true
}

// 显示编辑模态框
const showEditModal = (record) => {
  isEdit.value = true
  Object.keys(formData).forEach((key) => {
    if (key in record) {
      formData[key] = record[key]
    }
  })
  modalVisible.value = true
}

// 处理模态框确认
const handleModalOk = () => {
  formRef.value
    .validateFields()
    .then((values) => {
      if (isEdit.value) {
        // 更新客户
        const index = customers.value.findIndex((item) => item.id === formData.id)
        if (index !== -1) {
          customers.value[index] = {
            ...customers.value[index],
            ...values,
            updatedAt: new Date()
          }
          message.success('客户更新成功')
        }
      } else {
        // 添加客户
        const newCustomer = {
          ...values,
          id: customers.value.length + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastOrderDate: null,
          orderCount: 0,
          totalSpent: 0,
          orders: []
        }
        customers.value.unshift(newCustomer)
        message.success('客户添加成功')
      }

      modalVisible.value = false
    })
    .catch((error) => {
      console.error('验证失败:', error)
    })
}

// 查看客户详情
const viewVisible = ref(false)
const currentCustomer = ref({})

const showViewModal = (record) => {
  currentCustomer.value = record
  viewVisible.value = true
}

// 删除客户
const handleDelete = async (id) => {
  const index = customers.value.findIndex((item) => item.id === id)
  if (index !== -1) {
    customers.value.splice(index, 1)
    message.success('客户删除成功')
  }
}
</script>

<style scoped lang="less">
.customers-container {
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .order-history {
    margin-top: 24px;
    h3 {
      margin-bottom: 16px;
    }
  }
}
</style>
