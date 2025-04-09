<template>
  <div class="after-sales">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-checkbox v-model:checked="selectedAll" @change="handleSelectAll">全选</a-checkbox>
        <a-input-search
          v-model:value="searchValue"
          placeholder="商品名称"
          style="width: 200px"
          @search="onSearch"
        />
        <a-select
          v-model:value="categoryFilter"
          placeholder="商品类型"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="statusFilter"
          placeholder="商品状态"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="1">已出库</a-select-option>
          <a-select-option value="0">未出库</a-select-option>
        </a-select>
      </a-space>
      <div class="right-buttons">
        <a-space>
          <a-button @click="handleImport">
            <upload-outlined />批量导入
          </a-button>
          <a-button type="primary" @click="handleBatchRecover">恢复出厂</a-button>
        </a-space>
      </div>
    </div>

    <!-- 售后表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredAfterSales"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :scroll="{ x: 1300 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 商品状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'orange'">
            {{ record.status === 1 ? '已出库' : '未出库' }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a @click="handleRecover(record)">恢复出厂</a>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 批量导入模态框 -->
    <a-modal
      v-model:open="importModalVisible"
      title="批量导入售后数据"
      @ok="handleImportConfirm"
      :confirm-loading="importing"
      width="600px"
    >
      <div class="import-steps">
        <div class="step-item">
          <div class="step-number">1.下载模板</div>
          <div class="step-info">
            <p>请先下载Excel导入模板，按照模板格式填写数据</p>
            <a-button type="link" class="download-template-btn" @click="handleDownloadTemplate">
              <template #icon><download-outlined /></template>
              下载导入模板
            </a-button>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2.上传文件</div>
          <div class="step-info">
            <p>选择填写好的Excel文件进行上传</p>
            <a-upload
              v-model:file-list="importFileList"
              :before-upload="beforeImportUpload"
              :max-count="1"
              class="upload-area"
            >
              <div class="upload-trigger">
                <p class="upload-icon">
                  <upload-outlined />
                </p>
                <p class="upload-text">点击或拖拽文件到此处上传</p>
                <p class="upload-hint">支持 .xlsx、.xls 格式，文件大小不超过5MB</p>
                <a-button type="primary" class="upload-btn">
                  <template #icon><upload-outlined /></template>
                  选择文件
                </a-button>
              </div>
            </a-upload>
          </div>
        </div>
      </div>

      <div v-if="importFileList.length > 0" class="upload-list-item">
        <file-excel-outlined style="color: #52c41a; font-size: 16px" />
        <span class="file-name">{{ importFileList[0].name }}</span>
        <span class="file-size">{{ (importFileList[0].size / 1024).toFixed(1) }}KB</span>
      </div>

      <a-alert
        v-if="importFileList.length > 0"
        message="文件已选择，点击确定开始导入"
        type="success"
        show-icon
        style="margin-top: 16px"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  UploadOutlined, 
  FileExcelOutlined, 
  DownloadOutlined 
} from '@ant-design/icons-vue'

// 表格列定义
const columns = [
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 250,
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
    width: 250,
  },
  {
    title: '商品ID',
    dataIndex: 'productId',
    width: 150,
  },
  {
    title: '商品状态',
    dataIndex: 'status',
    width: 120,
  },
  {
    title: '商品验证次数',
    dataIndex: 'verificationCount',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 120,
    fixed: 'right'
  }
]

// 状态变量
const loading = ref(false)
const hardwareDetection = ref(false)
const searchValue = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const selectedRowKeys = ref([])
const selectedAll = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// Mock数据
const afterSales = ref([])

// 获取售后数据
const fetchAfterSales = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    const mockData = Array(20).fill().map((_, index) => ({
      id: `AS${String(index + 1).padStart(6, '0')}`,
      productName: `测试商品 ${index + 1}`,
      productType: index % 2 === 0 ? '电子产品' : '服装',
      productId: `P${String(index + 1).padStart(6, '0')}`,
      status: index % 3 === 0 ? 0 : 1,
      verificationCount: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
      updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toLocaleString()
    }))
    afterSales.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 过滤后的数据
const filteredAfterSales = computed(() => {
  let result = [...afterSales.value]
  
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.productName.toLowerCase().includes(search) ||
      item.productId.toLowerCase().includes(search)
    )
  }
  
  if (categoryFilter.value) {
    result = result.filter(item => item.productType === categoryFilter.value)
  }
  
  if (statusFilter.value !== '') {
    result = result.filter(item => item.status === parseInt(statusFilter.value))
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

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
  selectedAll.value = keys.length === afterSales.value.length
}

const handleSelectAll = (e) => {
  const checked = e.target.checked
  selectedRowKeys.value = checked ? afterSales.value.map(item => item.id) : []
}

const handleRecover = (record) => {
  message.success(`恢复出厂: ${record.productName}`)
}

const handleBatchRecover = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要恢复的商品')
    return
  }
  message.success(`批量恢复出厂: ${selectedRowKeys.value.length} 个商品`)
}

// 批量导入相关
const importModalVisible = ref(false)
const importing = ref(false)
const importFileList = ref([])

// 显示导入模态框
const handleImport = () => {
  importModalVisible.value = true
  importFileList.value = []
}

// 上传前校验
const beforeImportUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('只能上传 Excel 文件！')
    return false
  }
  
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('文件大小不能超过 5MB！')
    return false
  }

  return false // 阻止自动上传
}

// 确认导入
const handleImportConfirm = async () => {
  if (importFileList.value.length === 0) {
    message.warning('请选择要导入的文件')
    return
  }

  try {
    importing.value = true
    const file = importFileList.value[0]
    const formData = new FormData()
    formData.append('file', file.originFileObj)

    // TODO: 调用导入API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    message.success('导入成功')
    importModalVisible.value = false
    // 重新加载数据
    fetchAfterSales()
  } catch (error) {
    message.error('导入失败：' + (error.message || '未知错误'))
  } finally {
    importing.value = false
  }
}

// 下载导入模板
const handleDownloadTemplate = () => {
  // TODO: 替换为实际的模板下载地址
  const templateUrl = '/api/after-sales/import-template'
  window.open(templateUrl, '_blank')
}

// 生命周期钩子
onMounted(() => {
  fetchAfterSales()
})
</script>

<style scoped lang="less">
.download-template-btn {
  margin-bottom: 20px;
  padding: 0;
}
.after-sales {
  padding: 24px;
  background: #fff;

  .hardware-detection {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
  }
  
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

  .product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .product-name {
      color: #333;
      font-weight: 500;
    }

    .product-type {
      color: #666;
      font-size: 12px;
    }
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