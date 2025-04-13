<template>
  <a-modal
    :title="title"
    @ok="handleImportConfirm"
    :confirm-loading="importing"
    width="600px"
    :open="visible"
    @update:open="(val) => emit('update:visible', val)"
    :footer="importSuccess ? null : undefined"
    :closable="!importing"
    :maskClosable="!importing"
  >
    <div v-if="!importSuccess">
      <div class="import-steps">
        <div class="step-item">
          <div class="step-number">1.下载模板</div>
          <div class="step-info">
            <p>请先下载Excel导入模板，按照模板格式填写数据</p>
            <a-button
              type="link"
              class="download-template-btn"
              @click="handleDownloadTemplate"
            >
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
                <p class="upload-hint">
                  支持 .xlsx、.xls 格式，文件大小不超过5MB
                </p>
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
        <span class="file-size"
          >{{ (importFileList[0].size / 1024).toFixed(1) }}KB</span
        >
      </div>

      <a-alert
        v-if="importFileList.length > 0"
        message="文件已选择，点击确定开始导入"
        type="success"
        show-icon
        style="margin-top: 16px"
      />
    </div>

    <!-- 导入结果展示 -->
    <div v-else class="import-result">
      <div class="result-header">
        <check-circle-outlined v-if="isImportSuccess" class="success-icon" />
        <close-circle-outlined v-else class="error-icon" />
        <h3>{{ isImportSuccess ? "导入成功" : "导入失败" }}</h3>
      </div>
      <div
        :class="['result-content', { 'error-content': !isImportSuccess }]"
        v-html="importResult"
      ></div>
      <div class="result-footer">
        <a-button type="primary" @click="handleClose">确定</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { message } from "ant-design-vue";
import {
  UploadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";

const props = defineProps({
  // 模态框标题
  title: {
    type: String,
    default: "批量导入数据",
  },
  // 模态框可见性
  visible: {
    type: Boolean,
    default: false,
  },
  // 模板下载URL
  templateUrl: {
    type: String,
    required: true,
  },
  // 是否支持更新
  updateSupport: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "import", "download"]);

// 状态变量
const importing = ref(false);
const importFileList = ref([]);
const importSuccess = ref(false);
const importResult = ref("");
const isImportSuccess = ref(true);

// 上传前校验
const beforeImportUpload = (file) => {
  const isExcel =
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";
  if (!isExcel) {
    message.error("只能上传 Excel 文件！");
    return false;
  }

  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error("文件大小不能超过 5MB！");
    return false;
  }

  return false; // 阻止自动上传
};

// 下载导入模板
const handleDownloadTemplate = () => {
  if (props.templateUrl) {
    // 触发下载事件
    emit("download");
    // 直接打开下载链接
    window.open(props.templateUrl, "_blank");
  } else {
    message.error("模板下载链接不存在");
  }
};

// 确认导入
const handleImportConfirm = async () => {
  if (importFileList.value.length === 0) {
    message.warning("请选择要导入的文件");
    return;
  }

  importing.value = true;
  const file = importFileList.value[0].originFileObj;

  try {
    await emit("import", file, props.updateSupport);
  } catch (error) {
    console.error("导入失败:", error);
    showImportResult(error.message || "导入失败，请检查文件格式是否正确", false);
  }
};

// 显示导入结果
const showImportResult = (result, success = true) => {
  importSuccess.value = true;
  importResult.value = result;
  isImportSuccess.value = success;
  importing.value = false;
};

// 定义对外暴露的方法
defineExpose({
  showImportResult,
});

// 关闭弹窗并重置状态
const handleClose = () => {
  importSuccess.value = false;
  importResult.value = "";
  importFileList.value = [];
  isImportSuccess.value = true;
  importing.value = false;
  emit("update:visible", false);
};
</script>

<style scoped lang="less">
.download-template-btn {
  margin-bottom: 20px;
  padding: 0;
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

.import-result {
  padding: 20px 0;

  .result-header {
    text-align: center;
    margin-bottom: 24px;

    .success-icon {
      font-size: 48px;
      color: #52c41a;
      display: block;
      margin-bottom: 16px;
    }

    .error-icon {
      font-size: 48px;
      color: #f5222d;
      display: block;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 24px;
      font-weight: 500;
      color: #000000d9;
      margin: 0;
    }
  }

  .result-content {
    background-color: #f8f8f8;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 24px;
    max-height: 300px;
    overflow-y: auto;
    line-height: 1.8;

    &.error-content {
      background-color: #fff2f0;
      border: 1px solid #ffccc7;

      :deep(a) {
        color: #f5222d;
      }
    }
  }

  .result-footer {
    text-align: center;
  }
}
</style>
