<template>
  <div class="product-categories">
    <h1>商品类型管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-input-search
        v-model:value="queryParams.dictLabel"
        placeholder="搜索类型名称"
        style="width: 250px"
        @search="handleQuery"
      />
      <a-button type="primary" @click="showAddModal">
        <plus-outlined /> 添加类型
      </a-button>
    </div>
    
    <!-- 类型表格 -->
    <a-table
      :columns="columns"
      :data-source="categoryList"
      :loading="loading"
      :bordered="true"
      rowKey="dictCode"
      :scroll="{ x: 1300 }"
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
    >
      <template #bodyCell="{ column, record }">
        <!-- 状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === '0' ? 'green' : 'red'">
            {{ record.status === '0' ? '启用' : '禁用' }}
          </a-tag>
        </template>
        
        <!-- 操作 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showEditModal(record)">
              <edit-outlined /> 编辑
            </a-button>
            <a-popconfirm
              title="确定要删除该类型吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.dictCode)"
            >
              <a-button type="link" danger size="small">
                <delete-outlined /> 删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    
    <!-- 添加/编辑类型弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑类型' : '添加类型'"
      @ok="handleModalOk"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="类型名称" name="dictLabel">
          <a-input v-model:value="formData.dictLabel" placeholder="请输入类型名称" />
        </a-form-item>
        
        <a-form-item label="类型键值" name="dictValue">
          <a-input v-model:value="formData.dictValue" placeholder="请输入类型键值" />
        </a-form-item>
        
        <a-form-item label="排序" name="dictSort">
          <a-input-number
            v-model:value="formData.dictSort"
            :min="0"
            style="width: 100%"
            placeholder="请输入排序值"
          />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="0">启用</a-radio>
            <a-radio value="1">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="描述" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            :rows="3"
            placeholder="请输入类型描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import request from '@/api/request'

// 表格列定义
const columns = [
  {
    title: '类型名称',
    dataIndex: 'dictLabel',
  },
  {
    title: '类型键值',
    dataIndex: 'dictValue',
  },
  {
    title: '排序',
    dataIndex: 'dictSort',
  },
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '描述',
    dataIndex: 'remark',
    ellipsis: true,
    customRender: ({text}) => {
      return text || '--'
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    customRender: ({text}) => {
      return text || '--'
    }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
  },
]

// 状态
const loading = ref(false)
const categoryList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictType: 'biz_product_type',
  dictLabel: ''
})

// 模态框相关
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  dictCode: null,
  dictType: 'biz_product_type',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: '0',
  remark: '',
})

const rules = {
  dictLabel: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入类型键值', trigger: 'blur' }],
  dictSort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 加载数据
onMounted(() => {
  fetchCategories()
})

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

// 获取类型数据
const fetchCategories = async () => {
  loading.value = true
  try {
    const params = buildQueryParams()
    const res = await request.get('/system/dict/data/list', { params })
    categoryList.value = res.rows
    total.value = res.total
  } catch (error) {
    console.error('获取类型数据失败', error)
    message.error('获取类型数据失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page
  queryParams.pageSize = pageSize
  fetchCategories()
}

// 页面大小改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  fetchCategories()
}

// 搜索处理
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchCategories()
}

// 重置查询
const resetQuery = () => {
  queryParams.dictLabel = ''
  queryParams.pageNum = 1
  fetchCategories()
}

// 显示添加弹窗
const showAddModal = () => {
  isEdit.value = false
  formData.dictCode = null
  formData.dictLabel = ''
  formData.dictValue = ''
  formData.dictSort = 0
  formData.status = '0'
  formData.remark = ''
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record) => {
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

// 处理弹窗确认
const handleModalOk = () => {
  formRef.value.validateFields().then(async () => {
    try {
      if (isEdit.value) {
        // 更新类型
        await request.put('/system/dict/data', formData)
        message.success('类型更新成功')
      } else {
        // 添加类型
        await request.post('/system/dict/data', formData)
        message.success('类型添加成功')
      }
      modalVisible.value = false
      fetchCategories() // 刷新列表
    } catch (error) {
      console.error('操作失败', error)
      message.error('操作失败')
    }
  })
}

// 删除类型
const handleDelete = async (dictCode) => {
  try {
    await request.delete(`/system/dict/data/${dictCode}`)
    message.success('类型删除成功')
    fetchCategories() // 刷新列表
  } catch (error) {
    console.error('删除失败', error)
    message.error('删除失败')
  }
}
</script>

<style scoped lang="less">
.product-categories {
  h1 {
    margin-bottom: 24px;
  }
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
}
</style> 