<template>
  <div class="customers-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="queryParams.userName"
          placeholder="搜索用户名称"
          style="width: 200px"
          @search="handleQuery"
          allowClear
        />
        <a-input
          v-model:value="queryParams.phonenumber"
          placeholder="手机号码"
          style="width: 150px"
          @pressEnter="handleQuery"
          allowClear
        />
        <a-select
          v-model:value="queryParams.status"
          placeholder="状态"
          style="width: 100px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option value="0">正常</a-select-option>
          <a-select-option value="1">停用</a-select-option>
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
      :data-source="userList"
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
      :scroll="{ x: 1200 }"
      rowKey="userId"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户头像 -->
        <template v-if="column.dataIndex === 'avatar'">
          <a-avatar :src="record.avatar" :size="40" v-if="record.avatar"/>
        </template>

        <!-- 用户状态 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === '0' ? 'green' : 'red'">
            {{ record.status === '0' ? '正常' : '停用' }}
          </a-tag>
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space v-if="!record.admin">
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
            <a-button type="link" @click="handleResetPassword(record)">重置密码</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="formMode === 'add' ? '新增客户' : '编辑用户信息'"
      @ok="handleSubmit"
      :confirmLoading="submitLoading"
      width="650px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名称" name="userName">
          <a-input v-model:value="formData.userName" placeholder="请输入用户名称" :disabled="formMode === 'edit'" />
        </a-form-item>
        <a-form-item label="用户昵称" name="nickName">
          <a-input v-model:value="formData.nickName" placeholder="请输入用户昵称" />
        </a-form-item>
        <a-form-item label="手机号码" name="phonenumber">
          <a-input v-model:value="formData.phonenumber" placeholder="请输入手机号码" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="密码" name="password" v-if="formMode === 'add'">
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="用户角色" name="roleIds">
          <a-select
            v-model:value="formData.roleIds"
            placeholder="请选择用户角色"
            mode="multiple"
            :options="roleOptions"
            :disabled="!isSuperAdmin"
            :fieldNames="{ label: 'roleName', value: 'roleId' }"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="0">正常</a-radio>
            <a-radio value="1">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal
      v-model:open="resetPasswordVisible"
      title="重置密码"
      @ok="handleResetPasswordSubmit"
      :confirmLoading="resetPasswordLoading"
      width="500px"
    >
      <a-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名称">
          <span>{{ resetPasswordForm.userName }}</span>
        </a-form-item>
        <a-form-item label="新密码" name="password">
          <a-input-password v-model:value="resetPasswordForm.password" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password v-model:value="resetPasswordForm.confirmPassword" placeholder="请确认新密码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import request from '@/api/request'

// 表格列定义
const columns = [
  {
    title: '用户头像',
    dataIndex: 'avatar',
    width: 100,
  },
  {
    title: '用户名称',
    dataIndex: 'userName',
    width: 150,
  },
  {
    title: '用户昵称',
    dataIndex: 'nickName',
    width: 150,
  },
  {
    title: '手机号码',
    dataIndex: 'phonenumber',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 240,
    fixed: 'right'
  }
]

// 状态变量
const loading = ref(false)
const userList = ref([])
const total = ref(0)
const editModalVisible = ref(false)
const submitLoading = ref(false)
const formMode = ref('add') // 'add' 或 'edit'
const roleOptions = ref([])
const isSuperAdmin = ref(JSON.parse(localStorage.getItem('userData')).roles.find(role => role.roleKey === 'admin'))

// 重置密码相关变量
const resetPasswordVisible = ref(false)
const resetPasswordLoading = ref(false)
const resetPasswordFormRef = ref(null)
const resetPasswordForm = reactive({
  userId: undefined,
  userName: '',
  password: '',
  confirmPassword: ''
})

// 重置密码校验规则
const resetPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 密码确认验证函数
function validateConfirmPassword(rule, value) {
  if (value !== resetPasswordForm.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
})

// 表单对象
const formRef = ref(null)
const formData = reactive({
  userId: undefined,
  userName: '',
  nickName: '',
  password: '',
  phonenumber: '',
  email: '',
  status: '0',
  roleIds: [],
  remark: ''
})

// 表单校验规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名称长度应在 2-20 个字符之间', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, type: 'array', message: '请选择用户角色', trigger: 'change' }
  ]
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const res = await request.get('/system/user/list', { params: queryParams })
    if (res && res.rows) {
      userList.value = res.rows?.map(item => ({
        ...item,
        avatar: item.avatar ? import.meta.env.VITE_BASE_URL + item.avatar : ''
      })) || []
      total.value = res.total || 0
    } else {
      userList.value = []
      total.value = 0
      message.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败', error)
    message.error('获取用户列表失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取角色选项
const getRoleOptions = async () => {
  try {
    const res = await request.get('/system/role/optionselect')
    roleOptions.value = res.data || []
  } catch (error) {
    console.error('获取角色选项失败', error)
    message.error('获取角色选项失败')
    roleOptions.value = []
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getUserList()
}

// 新增用户
const handleAdd = () => {
  formMode.value = 'add'
  formData.userId = undefined
  formData.userName = ''
  formData.nickName = ''
  formData.password = ''
  formData.phonenumber = ''
  formData.email = ''
  formData.status = '0'
  formData.roleIds = [2]
  formData.remark = ''
  editModalVisible.value = true
}

// 编辑用户
const handleEdit = async (record) => {
  formMode.value = 'edit'
  formData.userId = record.userId
  formData.userName = record.userName
  formData.nickName = record.nickName
  formData.password = ''
  formData.phonenumber = record.phonenumber
  formData.email = record.email
  formData.status = record.status
  formData.remark = record.remark
  
  // 获取用户详情，主要是获取角色信息
  try {
    const res = await request.get(`/system/user/${record.userId}`)
    if (res && res.data) {
      formData.roleIds = res.data.roles.map(role => role.roleId)
    }
  } catch (error) {
    console.error('获取用户详情失败', error)
    message.error('获取用户详情失败')
  }
  
  editModalVisible.value = true
}

// 表单提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const submitData = { ...formData }
    if (formMode.value === 'edit') {
      delete submitData.password
    }
    
    if (formMode.value === 'add') {
      // 新增用户
      const res = await request.post('/system/user', submitData)
      if (res.code === 200) {
        message.success('新增成功')
        editModalVisible.value = false
        getUserList()
      } else {
        message.error(res.msg || '新增失败')
      }
    } else {
      // 编辑用户
      const res = await request.put('/system/user', submitData)
      if (res.code === 200) {
        message.success('编辑成功')
        editModalVisible.value = false
        getUserList()
      } else {
        message.error(res.msg || '编辑失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 删除用户
const handleDelete = async (record) => {
  try {
    const res = await request.delete(`/system/user/${record.userId}`)
    if (res.code === 200) {
      message.success('删除成功')
      getUserList()
    } else {
      message.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    message.error('删除用户失败')
  }
}

// 分页改变
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page
  queryParams.pageSize = pageSize
  getUserList()
}

// 每页条数改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  getUserList()
}

// 表格改变
const handleTableChange = (pagination) => {
  queryParams.pageNum = pagination.current
  queryParams.pageSize = pagination.pageSize
  getUserList()
}

// 重置密码
const handleResetPassword = (record) => {
  resetPasswordForm.userId = record.userId
  resetPasswordForm.userName = record.userName
  resetPasswordForm.password = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordVisible.value = true
}

// 提交重置密码
const handleResetPasswordSubmit = async () => {
  try {
    await resetPasswordFormRef.value.validate()
    resetPasswordLoading.value = true
    
    const res = await request.put('/system/user/resetPwd', {
      userId: resetPasswordForm.userId,
      password: resetPasswordForm.password
    })
    
    if (res.code === 200) {
      message.success('密码重置成功')
      resetPasswordVisible.value = false
    } else {
      message.error(res.msg || '密码重置失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    resetPasswordLoading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  getRoleOptions()
  getUserList()
})
</script>

<style scoped lang="less">
.customers-container {
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
