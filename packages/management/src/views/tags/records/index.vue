<template>
  <div class="records-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索商品名称"
          style="width: 200px"
          @search="onSearch"
        />
        <a-select
          v-model:value="typeFilter"
          placeholder="商品类型"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="type in productTypes" :key="type" :value="type">
            {{ type }}
          </a-select-option>
        </a-select>
      </a-space>
    </div>

    <!-- 记录表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredRecords"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      bordered
      :scroll="{ x: 1400 }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 商品ID -->
        <template v-if="column.dataIndex === 'productId'">
          {{ record.productId }}
        </template>

        <!-- 访问地址 -->
        <template v-if="column.dataIndex === 'visitUrl'">
          <a :href="record.visitUrl" target="_blank">{{ record.visitUrl }}</a>
        </template>

        <!-- 访问IP -->
        <template v-if="column.dataIndex === 'visitIp'">
          {{ record.visitIp }}
        </template>

        <!-- 商品验证次数 -->
        <template v-if="column.dataIndex === 'verificationCount'">
          {{ record.verificationCount }}
        </template>

        <!-- 记录时间 -->
        <template v-if="column.dataIndex === 'recordTime'">
          {{ formatDate(record.recordTime) }}
        </template>

        <!-- 商品验证结果 -->
        <template v-if="column.dataIndex === 'verificationResult'">
          <a-tag :color="record.verificationResult ? 'success' : 'error'">
            {{ record.verificationResult ? '成功' : '失败' }}
          </a-tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleView(record)">查看</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="查询记录详情"
      :footer="null"
      width="800px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="商品名称">{{ currentRecord.productName }}</a-descriptions-item>
        <a-descriptions-item label="商品类型">{{ currentRecord.productType }}</a-descriptions-item>
        <a-descriptions-item label="商品ID">{{ currentRecord.productId }}</a-descriptions-item>
        <a-descriptions-item label="访问地址">
          <a :href="currentRecord.visitUrl" target="_blank">{{ currentRecord.visitUrl }}</a>
        </a-descriptions-item>
        <a-descriptions-item label="访问IP">{{ currentRecord.visitIp }}</a-descriptions-item>
        <a-descriptions-item label="验证次数">{{ currentRecord.verificationCount }}</a-descriptions-item>
        <a-descriptions-item label="记录时间">{{ formatDate(currentRecord.recordTime) }}</a-descriptions-item>
        <a-descriptions-item label="验证结果">
          <a-tag :color="currentRecord.verificationResult ? 'success' : 'error'">
            {{ currentRecord.verificationResult ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 表格列定义
const columns = [
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 120,
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
    width: 120,
  },
  {
    title: '商品ID',
    dataIndex: 'productId',
    width: 120,
  },
  {
    title: '访问地址',
    dataIndex: 'visitUrl',
    width: 200,
    ellipsis: true,
  },
  {
    title: '访问IP',
    dataIndex: 'visitIp',
    width: 150,
  },
  {
    title: '商品验证次数',
    dataIndex: 'verificationCount',
    width: 120,
    sorter: true,
  },
  {
    title: '记录时间',
    dataIndex: 'recordTime',
    width: 180,
    sorter: true,
  },
  {
    title: '商品验证结果',
    dataIndex: 'verificationResult',
    width: 120,
    filters: [
      { text: '成功', value: true },
      { text: '失败', value: false },
    ],
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 100,
    fixed: 'right',
  },
]

// 商品类型
const productTypes = ['类型A', '类型B', '类型C', '类型D', '类型E']

// 状态变量
const loading = ref(false)
const searchValue = ref('')
const typeFilter = ref('')
const viewModalVisible = ref(false)
const currentRecord = ref({})
const records = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 过滤后的记录列表
const filteredRecords = computed(() => {
  let result = [...records.value]
  
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.productName.toLowerCase().includes(search)
    )
  }
  
  if (typeFilter.value) {
    result = result.filter(item => item.productType === typeFilter.value)
  }
  
  return result
})

// 事件处理函数
const onSearch = (value) => {
  searchValue.value = value
  pagination.current = 1
}

const onFilterChange = () => {
  pagination.current = 1
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize

  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 1 : -1
    records.value.sort((a, b) => {
      if (sorter.field === 'verificationCount') {
        return order * (a[sorter.field] - b[sorter.field])
      }
      if (sorter.field === 'recordTime') {
        return order * (new Date(a[sorter.field]) - new Date(b[sorter.field]))
      }
      return 0
    })
  }
}

const handleView = (record) => {
  currentRecord.value = record
  viewModalVisible.value = true
}

// 模拟数据
const mockRecords = () => {
  const data = []
  for (let i = 1; i <= 50; i++) {
    data.push({
      id: i,
      productName: `商品${i}`,
      productType: productTypes[i % productTypes.length],
      productId: `P${String(i).padStart(6, '0')}`,
      visitUrl: `https://example.com/product/${i}`,
      visitIp: `192.168.${Math.floor(i/255)}.${i%255}`,
      verificationCount: Math.floor(Math.random() * 100),
      recordTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
      verificationResult: Math.random() > 0.3
    })
  }
  return data
}

// 初始化数据
onMounted(() => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    records.value = mockRecords()
    pagination.total = records.value.length
    loading.value = false
  }, 500)
})
</script>

<style scoped lang="less">
.records-container {
  padding: 24px;
  background: #fff;

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .product-name {
      font-weight: 500;
      color: #333;
    }

    .product-type {
      color: #666;
    }
  }
}
</style> 