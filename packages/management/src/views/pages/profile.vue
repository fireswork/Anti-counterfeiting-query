<template>
  <div class="profile-container">
    <a-row :gutter="24">
      <a-col :span="8">
        <a-card title="个人信息" class="profile-card">
          <div class="avatar-wrapper">
            <a-upload
              v-model:file-list="fileList"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              @change="handleChange"
              accept="image/*"
            >
              <div class="avatar-container">
                <img
                  v-if="userData.avatar"
                  :src="userData.avatar"
                  alt="头像"
                  class="avatar"
                />
                <div v-else class="avatar-placeholder">
                  <user-outlined />
                </div>
                <div class="avatar-mask">
                  <camera-outlined />
                  <p>更换头像</p>
                </div>
              </div>
            </a-upload>
          </div>

          <div class="profile-info">
            <div class="info-item">
              <div class="label">
                <user-outlined />
                <span>用户名称</span>
              </div>
              <div class="value">
                {{ userData.username || userData.nickName }}
              </div>
            </div>

            <div class="info-item">
              <div class="label">
                <phone-outlined />
                <span>手机号码</span>
              </div>
              <div class="value">{{ userData.phonenumber }}</div>
            </div>

            <div class="info-item">
              <div class="label">
                <mail-outlined />
                <span>用户邮箱</span>
              </div>
              <div class="value">{{ userData.email }}</div>
            </div>

            <div class="info-item">
              <div class="label">
                <team-outlined />
                <span>所属角色</span>
              </div>
              <div class="value">{{ userData.remark }}</div>
            </div>

            <div class="info-item">
              <div class="label">
                <calendar-outlined />
                <span>创建日期</span>
              </div>
              <div class="value">{{ userData.createTime }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card title="基本资料" class="profile-card">
          <a-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="用户昵称" name="nickName">
              <a-input
                v-model:value="formData.nickName"
                placeholder="请输入用户昵称"
              />
            </a-form-item>

            <a-form-item label="手机号码" name="phonenumber">
              <a-input
                v-model:value="formData.phonenumber"
                placeholder="请输入手机号码"
              />
            </a-form-item>

            <a-form-item label="邮箱" name="email">
              <a-input
                v-model:value="formData.email"
                placeholder="请输入邮箱"
              />
            </a-form-item>

            <a-form-item label="性别" name="sex">
              <a-radio-group v-model:value="formData.sex">
                <a-radio value="1">男</a-radio>
                <a-radio value="0">女</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
              <a-button type="primary" @click="submitForm">保存</a-button>
              <a-button style="margin-left: 10px" @click="resetForm"
                >重置</a-button
              >
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="修改密码" class="profile-card" style="margin-top: 20px">
          <a-form
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="当前密码" name="oldPassword">
              <a-input-password
                v-model:value="pwdForm.oldPassword"
                placeholder="请输入当前密码"
              />
            </a-form-item>

            <a-form-item label="新密码" name="newPassword">
              <a-input-password
                v-model:value="pwdForm.newPassword"
                placeholder="请输入新密码"
              />
            </a-form-item>

            <a-form-item label="确认密码" name="confirmPassword">
              <a-input-password
                v-model:value="pwdForm.confirmPassword"
                placeholder="请确认新密码"
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
              <a-button type="primary" @click="updatePassword">更新</a-button>
              <a-button style="margin-left: 10px" @click="resetPwdForm"
                >重置</a-button
              >
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 头像裁剪弹窗 -->
    <a-modal
      v-model:open="cropperVisible"
      title="修改头像"
      :width="800"
      :footer="null"
      :maskClosable="false"
      @cancel="cancelCrop"
    >
      <div class="cropper-wrapper">
        <div class="cropper-container">
          <vueCropper
            ref="cropperRef"
            :img="cropperOptions.img"
            :info="true"
            :autoCrop="true"
            :autoCropWidth="200"
            :autoCropHeight="200"
            :fixedBox="true"
            :centerBox="true"
            @realTime="realTime"
            :full="false"
            :size="1"
          />
        </div>
        
        <div class="preview-container" :style="{'width': previewData.w + 'px', 'height': previewData.h + 'px',  'overflow': 'hidden', 'margin': '5px'}">
          <div :style="previewData.div" class="preview-img">
            <img :src="previewData.url" alt="预览" class="img-preview" :style="previewData.img">
          </div>
        </div>
      </div>
      
      <div class="cropper-control">
        <a-button type="primary" @click="confirmCrop">确认</a-button>
        <a-button style="margin-left: 10px" @click="cancelCrop">取消</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { message } from "ant-design-vue";
import request from "@/api/request";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  CameraOutlined,
} from "@ant-design/icons-vue";
import { VueCropper } from "vue-cropper"; // 需要安装此依赖
import "vue-cropper/dist/index.css"; // 需要导入样式

const userData = ref({ user: {} });
const loading = ref(false);
const fileList = ref([]);
const formRef = ref(null);
const pwdFormRef = ref(null);
const cropperRef = ref(null);
const cropperVisible = ref(false);
const previewData = ref('');
const cropperOptions = reactive({
  img: "",
  info: true,
  outputType: "png",
});
const formData = reactive({
  nickName: "",
  phonenumber: "",
  email: "",
  sex: "1",
});
const pwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 表单校验规则
const rules = {
  nickName: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  phonenumber: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

// 密码表单校验规则
const pwdRules = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value) => {
        if (value === pwdForm.newPassword) {
          return Promise.resolve();
        }
        return Promise.reject("两次输入的密码不一致");
      },
      trigger: "blur",
    },
  ],
};

// 获取用户信息
const getUserInfo = async () => {
  loading.value = true;
  try {
    const res = await request.get("/system/user/profile");
    userData.value = res.data;
    userData.value.avatar = import.meta.env.VITE_BASE_URL + userData.value.avatar;

    // 填充表单数据
    formData.nickName = res.data.nickName || "";
    formData.phonenumber = res.data.phonenumber || "";
    formData.email = res.data.email || "";
    formData.sex = res.data.sex || "1";
  } catch (error) {
    message.error("获取用户信息失败");
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    await request.put("/system/user/profile", formData);
    message.success("更新个人信息成功");
    getUserInfo();
  } catch (error) {
    console.error(error);
    message.error("更新个人信息失败");
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formRef.value.resetFields();
  // 重新填充表单数据
  formData.nickName = userData.value.nickName || "";
  formData.phonenumber = userData.value.phonenumber || "";
  formData.email = userData.value.email || "";
  formData.sex = userData.value.sex || "1";
};

// 更新密码
const updatePassword = async () => {
  try {
    await pwdFormRef.value.validate();
    loading.value = true;

    await request.put("/system/user/profile/updatePwd", {
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });

    message.success("密码修改成功");
    resetPwdForm();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 重置密码表单
const resetPwdForm = () => {
  pwdFormRef.value.resetFields();
};

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件!");
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过2MB!");
  }

  return false; // 阻止自动上传
};

// 处理文件上传
const handleChange = (info) => {
  fileList.value = info.fileList.slice(-1);
  const file = info.file.originFileObj || info.file;
  
  if (file) {
    // 读取上传的图片
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      cropperOptions.img = e.target.result;
      nextTick(() => {
        cropperVisible.value = true;
        // 初始化预览图为空
        previewData.value = '';
      });
    };
  }
};

// 实时获取裁剪数据
const realTime = (data) => {
  // 实时预览
  previewData.value = data;
};

// 确认裁剪
const confirmCrop = async () => {
  // 获取裁剪后的base64数据
  cropperRef.value.getCropData((data) => {
    if (!data) {
      message.error('获取裁剪数据失败');
      return;
    }
    uploadAvatar(data);
  });
};

// 上传头像
const uploadAvatar = async (dataURL) => {
  try {
    loading.value = true;

    // 将base64转为blob
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const blob = new Blob([u8arr], { type: mime });
    const formData = new FormData();
    formData.append("avatarfile", blob, "avatar.png");

    const res = await request.post("/system/user/profile/avatar", formData);
    message.success("头像上传成功");
    userData.value.avatar = res.imgUrl;
    cropperVisible.value = false;
    getUserInfo();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 取消裁剪
const cancelCrop = () => {
  cropperOptions.img = "";
  previewData.value = "";
  cropperVisible.value = false;
  fileList.value = [];
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped lang="less">
.cropper-container {
  height: 350px;
  width: 350px;
}

.cropper-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 40px;

  .preview-img {
    position: relative;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    border-radius: 50%;
    -webkit-box-shadow: 0 0 4px #ccc;
    box-shadow: 0 0 4px #ccc;
    overflow: hidden;
  }
  
  .img-preview {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }
}

.cropper-control {
  margin-top: 20px;
  text-align: right;
}

.profile-container {
  padding: 0 10px;

  .profile-card {
    margin-bottom: 20px;
  }

  .avatar-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .avatar-container {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f0f2f5;

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      font-size: 60px;
      color: #d9d9d9;
    }

    .avatar-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
      color: #fff;

      p {
        margin-top: 8px;
        font-size: 14px;
      }
    }

    &:hover .avatar-mask {
      opacity: 1;
      cursor: pointer;
    }
  }

  .profile-info {
    .info-item {
      display: flex;
      margin-bottom: 12px;

      .label {
        width: 100px;
        color: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;

        span {
          margin-left: 8px;
        }
      }

      .value {
        flex: 1;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
}
</style>
