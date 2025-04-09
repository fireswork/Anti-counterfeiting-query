<template>
  <div class="customers-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索用户名称/头像"
          style="width: 200px"
          @search="onSearch"
        />
        <a-select
          v-model:value="roleFilter"
          placeholder="用户类型"
          style="width: 150px"
          @change="onFilterChange"
        >
          <a-select-option 
            v-for="option in availableRoleFilters" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="handleAdd">
        <plus-outlined />
        新增客户
      </a-button>
    </div>

    <!-- 用户表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredUsers"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1200 }"
      rowKey="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户信息列 -->
        <template v-if="column.dataIndex === 'userInfo'">
          <div class="user-info">
            <a-avatar :src="record.avatar" />
            <span class="user-name">{{ record.name }}</span>
          </div>
        </template>

        <!-- 用户类型 -->
        <template v-if="column.dataIndex === 'role'">
          <a-tag :color="getRoleColor(record.role)">
            {{ getRoleLabel(record.role) }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <template v-if="record.role === 'user'">
              <a-button 
                type="link" 
                @click="handleUpgradeToAdmin(record)"
                v-if="getCurrentUserRole() === 'super_admin'"
              >
                升级为管理员
              </a-button>
            </template>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该用户吗?"
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

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="isEdit ? '编辑用户信息' : '新增客户'"
      @ok="handleEditSubmit"
      :confirmLoading="submitLoading"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名称" name="name">
          <a-input v-model:value="editForm.name" placeholder="请输入用户名称" />
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="1"
            @preview="handlePreview"
            @change="handleAvatarChange"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="用户类型" name="role" v-if="!isEdit">
          <a-select v-model:value="editForm.role" placeholder="请选择用户类型">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin" v-if="getCurrentUserRole() === 'super_admin'">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表格列定义
const columns = [
  {
    title: '用户头像/名称',
    dataIndex: 'userInfo',
    width: 200,
  },
  {
    title: '用户类型',
    dataIndex: 'role',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
  },
  {
    title: '最后修改时间',
    dataIndex: 'updatedAt',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 状态变量
const loading = ref(false)
const searchValue = ref('')
const roleFilter = ref('')
const editModalVisible = ref(false)
const submitLoading = ref(false)
const fileList = ref([])
const users = ref([])
const isEdit = ref(false)

// 编辑表单
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  name: '',
  avatar: '',
  role: 'user'
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名称长度应在 2-20 个字符之间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true
})

// 获取角色标签
const getRoleLabel = (role) => {
  const roleMap = {
    user: '普通用户',
    admin: '管理员',
    super_admin: '超级管理员'
  }
  return roleMap[role] || '未知角色'
}

// 获取角色标签颜色
const getRoleColor = (role) => {
  const colorMap = {
    user: 'blue',
    admin: 'green',
    super_admin: 'purple'
  }
  return colorMap[role] || 'default'
}

// 模拟数据
const mockUsers = () => {
  const data = []
  for (let i = 1; i <= 50; i++) {
    data.push({
      id: i,
      name: `用户${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      role: i === 1 ? 'super_admin' : (i % 5 === 0 ? 'admin' : 'user'),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
      updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toLocaleString()
    })
  }
  return data
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 根据当前用户角色过滤可见的用户
  const currentUserRole = 'super_admin' // 这里应该从用户状态管理中获取当前用户角色
  if (currentUserRole === 'super_admin') {
    // 超管只能看到管理员和普通用户
    result = result.filter(user => user.role !== 'super_admin')
  } else if (currentUserRole === 'admin') {
    // 管理员只能看到普通用户
    result = result.filter(user => user.role === 'user')
  } else {
    // 普通用户不应该看到这个页面，返回空数组
    result = []
  }
  
  // 搜索过滤
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(search)
    )
  }
  
  if (roleFilter.value) {
    result = result.filter(item => item.role === roleFilter.value)
  }
  
  return result
})

// 获取当前用户可选择的角色过滤选项
const availableRoleFilters = computed(() => {
  const currentUserRole = 'super_admin' // 这里应该从用户状态管理中获取当前用户角色
  if (currentUserRole === 'super_admin') {
    return [
      { value: '', label: '全部类型' },
      { value: 'admin', label: '管理员' },
      { value: 'user', label: '普通用户' }
    ]
  } else if (currentUserRole === 'admin') {
    return [
      { value: '', label: '全部类型' },
      { value: 'user', label: '普通用户' }
    ]
  }
  return []
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

const handleAdd = () => {
  isEdit.value = false
  editForm.id = null
  editForm.name = ''
  editForm.avatar = ''
  editForm.role = 'user'
  fileList.value = []
  editModalVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  editForm.id = record.id
  editForm.name = record.name
  editForm.avatar = record.avatar
  editForm.role = record.role
  fileList.value = [
    {
      uid: '-1',
      name: 'avatar.png',
      status: 'done',
      url: record.avatar
    }
  ]
  editModalVisible.value = true
}

const handleEditSubmit = () => {
  editFormRef.value?.validate().then(() => {
    submitLoading.value = true
    // 模拟API调用
    setTimeout(() => {
      if (isEdit.value) {
        // 编辑用户
        const index = users.value.findIndex(item => item.id === editForm.id)
        if (index !== -1) {
          users.value[index] = {
            ...users.value[index],
            name: editForm.name,
            avatar: editForm.avatar,
            updatedAt: new Date().toLocaleString()
          }
          message.success('修改成功')
        }
      } else {
        // 新增用户
        const newUser = {
          id: users.value.length + 1,
          name: editForm.name,
          avatar: editForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          role: editForm.role,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString()
        }
        users.value.unshift(newUser)
        message.success('新增成功')
      }
      editModalVisible.value = false
      submitLoading.value = false
    }, 500)
  })
}

const handleUpgradeToAdmin = (record) => {
  // 模拟API调用
  const index = users.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      role: 'admin',
      updatedAt: new Date().toLocaleString()
    }
    message.success(`已将 ${record.name} 升级为管理员`)
  }
}

const handleDelete = (record) => {
  const index = users.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    users.value.splice(index, 1)
    message.success('删除成功')
  }
}

const handleAvatarChange = (info) => {
  if (info.file.status === 'done') {
    editForm.avatar = info.file.response.url || fileList.value[0].url
  }
}

const handlePreview = (file) => {
  const previewImage = file.url || file.preview
  if (previewImage) {
    window.open(previewImage)
  }
}

// 获取当前用户角色
const getCurrentUserRole = () => {
  // 这里应该从用户状态管理中获取当前用户角色
  return 'super_admin'
}

// 检查用户是否有权限访问该页面
const checkPageAccess = () => {
  const currentRole = getCurrentUserRole()
  if (currentRole === 'user') {
    // 如果是普通用户，跳转到首页或其他允许访问的页面
    router.push('/')
    message.error('您没有权限访问该页面')
  }
}

// 在组件挂载时检查权限
onMounted(() => {
  checkPageAccess()
  if (getCurrentUserRole() !== 'user') {
    loading.value = true
    // 模拟API调用
    setTimeout(() => {
      users.value = mockUsers()
      pagination.total = users.value.length
      loading.value = false
    }, 500)
  }
})
</script>

<style scoped lang="less">
.customers-container {
  padding: 24px;
  background: #fff;

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
      color: #333;
      font-weight: 500;
    }
  }
}
</style>
