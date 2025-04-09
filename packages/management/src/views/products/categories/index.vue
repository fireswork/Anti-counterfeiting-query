<template>
  <div class="product-categories">
    <h1>商品类型管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-input-search
        v-model:value="searchValue"
        placeholder="搜索类型名称"
        style="width: 250px"
        @search="onSearch"
      />
      <a-button type="primary" @click="showAddModal">
        <plus-outlined /> 添加类型
      </a-button>
    </div>
    
    <!-- 类型表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredCategories"
      :loading="loading"
      :bordered="true"
      rowKey="id"
      :scroll="{ x: 1300 }"
      :pagination="{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status ? 'green' : 'red'">
            {{ record.status ? '启用' : '禁用' }}
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
        <a-form-item label="类型名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入类型名称" />
        </a-form-item>
        
        <a-form-item label="类型编码" name="code">
          <a-input v-model:value="formData.code" placeholder="请输入类型编码" />
        </a-form-item>
        
        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="formData.sort"
            :min="0"
            style="width: 100%"
            placeholder="请输入排序值"
          />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="true">启用</a-radio>
            <a-radio :value="false">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入类型描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '类型名称',
    dataIndex: 'name',
  },
  {
    title: '类型编码',
    dataIndex: 'code',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    sorter: (a, b) => a.sort - b.sort,
  },
  {
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '启用', value: true },
      { text: '禁用', value: false },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
  },
]

// 状态
const loading = ref(false)
const searchValue = ref('')
const categories = ref([])

// 模态框相关
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  name: '',
  code: '',
  sort: 0,
  status: true,
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 加载数据
onMounted(() => {
  fetchCategories()
})

// 获取类型数据 (模拟)
const fetchCategories = () => {
  loading.value = true
  setTimeout(() => {
    const mockData = []
    for (let i = 1; i <= 15; i++) {
      mockData.push({
        id: i,
        name: `商品类型 ${i}`,
        code: `TYPE_${i < 10 ? '0' + i : i}`,
        sort: i * 10,
        status: i % 4 !== 0,
        description: `这是商品类型${i}的描述信息`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      })
    }
    categories.value = mockData
    loading.value = false
  }, 500)
}

// 搜索过滤
const filteredCategories = computed(() => {
  if (!searchValue.value) return categories.value
  return categories.value.filter(item => 
    item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    item.code.toLowerCase().includes(searchValue.value.toLowerCase())
  )
})

// 搜索处理
const onSearch = () => {
  // 在实际应用中，可能需要调用API进行搜索
}

// 显示添加弹窗
const showAddModal = () => {
  isEdit.value = false
  formData.id = null
  formData.name = ''
  formData.code = ''
  formData.sort = 0
  formData.status = true
  formData.description = ''
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record) => {
  isEdit.value = true
  formData.id = record.id
  formData.name = record.name
  formData.code = record.code
  formData.sort = record.sort
  formData.status = record.status
  formData.description = record.description
  modalVisible.value = true
}

// 处理弹窗确认
const handleModalOk = () => {
  formRef.value.validateFields().then(values => {
    if (isEdit.value) {
      // 更新类型
      const index = categories.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        categories.value[index] = { 
          ...categories.value[index], 
          ...values,
        }
        message.success('类型更新成功')
      }
    } else {
      // 添加类型
      const newCategory = {
        ...values,
        id: categories.value.length + 1,
        createdAt: new Date().toISOString().split('T')[0],
      }
      categories.value.unshift(newCategory)
      message.success('类型添加成功')
    }
    
    modalVisible.value = false
  })
}

// 删除类型
const handleDelete = (id) => {
  const index = categories.value.findIndex(item => item.id === id)
  if (index !== -1) {
    categories.value.splice(index, 1)
    message.success('类型删除成功')
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