<template>
  <div class="products-list">
    <h1>商品管理</h1>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-space>
        <a-input-search
          v-model:value="queryParams.productName"
          placeholder="商品名称搜索"
          style="width: 200px"
          @search="handleQuery"
          allowClear
        />
        <a-select
          v-model:value="queryParams.productTypeId"
          placeholder="商品分类"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option value="">全部分类</a-select-option>
          <a-select-option
            v-for="category in categoryOptions"
            :key="category.dictCode"
            :value="category.dictValue"
          >
            {{ category.dictLabel }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="queryParams.productStatus"
          placeholder="商品状态"
          style="width: 150px"
          @change="handleQuery"
          allowClear
        >
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="0">未上架</a-select-option>
          <a-select-option value="1">已上架</a-select-option>
        </a-select>
        <a-button type="primary" @click="handleQuery">
          <template #icon><search-outlined /></template>
          查询
        </a-button>
        <a-button @click="resetQuery">
          <template #icon><reload-outlined /></template>
          重置
        </a-button>
      </a-space>
      <div>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />添加商品
          </a-button>
          <a-button @click="handleImport">
            <upload-outlined />批量导入
          </a-button>
          <a-popconfirm
            title="确定要批量删除选中的商品吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleBatchDelete"
          >
            <a-button
              type="primary"
              danger
              :disabled="selectedRowKeys.length === 0"
            >
              <delete-outlined />批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
    </div>
    <!-- 商品列表 -->
    <a-table
      :columns="columns"
      :data-source="productList"
      :loading="loading"
      :pagination="{
        pageSize: queryParams.pageSize,
        current: queryParams.pageNum,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: handlePageChange,
        onShowSizeChange: handleSizeChange,
      }"
      rowKey="id"
      :scroll="{ x: 1300 }"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
      }"
      bordered
    >
      <!-- 表格列配置 -->
      <template #bodyCell="{ column, record }">
        <!-- 商品图片和名称列 -->
        <template v-if="column.dataIndex === 'productImage'">
          <img
            :src="record.productImage"
            :alt="record.productName"
            class="product-image"
            @click="handlePreviewImg(record.productImage)"
          />
        </template>

        <!-- 商品分类 -->
        <template v-if="column.dataIndex === 'productType'">
          {{ record.productType }}
        </template>

        <!-- 商品状态 -->
        <template v-if="column.dataIndex === 'productStatus'">
          <a-tag :color="record.productStatus === '1' ? 'green' : 'orange'">
            {{ record.productStatus === "1" ? "已上架" : "未上架" }}
          </a-tag>
        </template>

        <!-- 日期格式化 -->
        <template
          v-if="
            column.dataIndex === 'createdAt' || column.dataIndex === 'updatedAt'
          "
        >
          {{ formatDateTime(record[column.dataIndex]) }}
        </template>

        <!-- 操作列 -->
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleView(record)">查看</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该商品吗?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a>删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a @click="handleStatusChange(record)">
              {{ record.productStatus === "1" ? "下架" : "上架" }}
            </a>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑商品弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
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
        <a-form-item label="商品名称" name="productName">
          <a-input
            v-model:value="formData.productName"
            placeholder="请输入商品名称"
          />
        </a-form-item>

        <a-form-item label="商品分类" name="productTypeId">
          <a-select
            v-model:value="formData.productTypeId"
            placeholder="请选择商品分类"
            @change="handleTypeChange"
          >
            <a-select-option
              v-for="category in categoryOptions"
              :key="category.dictCode"
              :value="category.dictValue"
            >
              {{ category.dictLabel }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="商品状态" name="productStatus">
          <a-radio-group v-model:value="formData.productStatus">
            <a-radio value="1">上架</a-radio>
            <a-radio value="0">下架</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="商品图片" name="productImage">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @preview="handlePreview"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :title="previewTitle" :footer="null">
      <img alt="预览图片" style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 查看商品详情 -->
    <a-modal
      v-model:open="viewVisible"
      title="商品详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="商品名称">{{
          currentProduct.productName
        }}</a-descriptions-item>
        <a-descriptions-item label="商品分类">{{
          currentProduct.productType
        }}</a-descriptions-item>
        <a-descriptions-item label="商品状态">
          <a-tag
            :color="currentProduct.productStatus === '1' ? 'green' : 'orange'"
          >
            {{ currentProduct.productStatus === "1" ? "已上架" : "未上架" }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="商品图片">
          <img
            :src="currentProduct.productImage"
            alt="商品图片"
            class="product-detail-image"
          />
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{
          formatDateTime(currentProduct.createdAt)
        }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{
          formatDateTime(currentProduct.updatedAt)
        }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{
          currentProduct.remark || "--"
        }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 批量导入模态框 -->
    <BatchImportModal
      ref="importModalRef"
      v-model:visible="importModalVisible"
      title="批量导入商品"
      template-url="/public/template/商品导入样例.xlsx"
      :update-support="false"
      @import="handleImportConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import request from "@/api/request";
import dayjs from "dayjs";
import BatchImportModal from "@/components/BatchImportModal.vue";

// 表格列定义
const columns = [
  {
    title: "商品图片",
    dataIndex: "productImage",
  },
  {
    title: "商品名称",
    dataIndex: "productName",
  },
  {
    title: "商品类型",
    dataIndex: "productType",
    width: "150px",
  },
  {
    title: "状态",
    dataIndex: "productStatus",
    width: "100px",
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    width: "180px",
  },
  {
    title: "更新时间",
    dataIndex: "updatedAt",
    width: "180px",
  },
  {
    title: "操作",
    dataIndex: "action",
    width: "250px",
    fixed: "right",
  },
];

// 状态
const loading = ref(false);
const productList = ref([]);
const total = ref(0);
const selectedRowKeys = ref([]);
const categoryOptions = ref([]);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: "",
  productTypeId: "",
  productStatus: "",
});

// 初始化
onMounted(() => {
  fetchCategoryOptions();
  fetchProductList();
});

const handlePreviewImg = (url) => {
  console.log(url, 2111);
  previewImage.value = url;
  previewVisible.value = true;
};

// 获取商品分类选项
const fetchCategoryOptions = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 100,
      dictType: "biz_product_type",
    };
    const res = await request.get("/system/dict/data/list", { params });
    categoryOptions.value = res.rows || [];
  } catch (error) {
    console.error("获取商品分类失败", error);
    message.error("获取商品分类失败");
  }
};

// 构建查询参数
const buildQueryParams = () => {
  const params = { ...queryParams };
  // 移除空值参数
  Object.keys(params).forEach((key) => {
    if (params[key] === "") {
      delete params[key];
    }
  });
  return params;
};

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true;
  try {
    const params = buildQueryParams();
    const res = await request.get("/biz/product/list", { params });
    if (res && res.rows) {
      productList.value =
        res.rows?.map((item) => ({
          ...item,
          productImage: import.meta.env.VITE_BASE_URL + item.productImage,
        })) || [];
      total.value = res.total || 0;
    } else {
      productList.value = [];
      total.value = 0;
      message.error("获取商品列表失败");
    }
  } catch (error) {
    console.error("获取商品列表失败", error);
    message.error("获取商品列表失败");
    productList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handlePageChange = (page, pageSize) => {
  queryParams.pageNum = page;
  queryParams.pageSize = pageSize;
  fetchProductList();
};

// 页面大小改变
const handleSizeChange = (current, size) => {
  queryParams.pageNum = 1;
  queryParams.pageSize = size;
  fetchProductList();
};

// 搜索处理
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchProductList();
};

// 重置查询
const resetQuery = () => {
  queryParams.productName = "";
  queryParams.productTypeId = "";
  queryParams.productStatus = "";
  queryParams.pageNum = 1;
  fetchProductList();
};

// 表格行选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

// 添加/编辑模态框相关
const modalVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const formData = reactive({
  id: null,
  productName: "",
  productType: "",
  productTypeId: "",
  productStatus: "1",
  productImage: "",
  remark: "",
});

const fileList = ref([]);
const rules = {
  productName: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  productTypeId: [
    { required: true, message: "请选择商品分类", trigger: "change" },
  ],
  productStatus: [
    { required: true, message: "请选择商品状态", trigger: "change" },
  ],
};

// 商品分类变更
const handleTypeChange = (value) => {
  const category = categoryOptions.value.find(
    (item) => item.dictValue === value
  );
  if (category) {
    formData.productType = category.dictLabel;
  }
};

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false;
  formData.id = null;
  formData.productName = "";
  formData.productType = "";
  formData.productTypeId = "";
  formData.productStatus = "1";
  formData.productImage = "";
  formData.remark = "";
  fileList.value = [];
  modalVisible.value = true;
};

// 显示编辑模态框
const handleEdit = (record) => {
  isEdit.value = true;
  const recordCopy = JSON.parse(JSON.stringify(record));
  Object.assign(formData, recordCopy);

  fileList.value = record.productImage
    ? [
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: record.productImage,
        },
      ]
    : [];

  modalVisible.value = true;
};

// 处理模态框确认
const handleModalOk = () => {
  formRef.value
    .validateFields()
    .then(async () => {
      try {
        const submitData = {
          productName: formData.productName,
          productImage: formData.productImage.replace(
            import.meta.env.VITE_BASE_URL,
            ""
          ),
          productType: formData.productType,
          productTypeId: formData.productTypeId,
          productStatus: formData.productStatus,
        };

        // 如果是编辑，需要添加id字段
        if (isEdit.value && formData.id) {
          submitData.id = formData.id;
        }

        if (isEdit.value) {
          // 更新商品
          const res = await request.put("/biz/product", submitData);
          if (res.code === 200) {
            message.success("商品更新成功");
            modalVisible.value = false;
            fetchProductList(); // 刷新列表
          } else {
            message.error(res.msg || "商品更新失败");
          }
        } else {
          // 添加商品
          const res = await request.post("/biz/product", submitData);
          if (res.code === 200) {
            message.success("商品添加成功");
            modalVisible.value = false;
            fetchProductList(); // 刷新列表
          } else {
            message.error(res.msg || "商品添加失败");
          }
        }
      } catch (error) {
        console.error("操作失败", error);
        message.error("操作失败");
      }
    })
    .catch((error) => {
      console.error("验证失败:", error);
    });
};

// 图片上传相关
const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");

const handlePreview = async (file) => {
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value =
    file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
};

const beforeUpload = (file) => {
  const isImage = file.type.indexOf("image/") === 0;
  if (!isImage) {
    message.error("只能上传图片文件!");
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB!");
    return false;
  }

  // 创建表单数据
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  // 上传文件
  loading.value = true;
  request
    .post("/common/upload", uploadFormData)
    .then((res) => {
      if (res.code === 200) {
        const url = import.meta.env.VITE_BASE_URL + res.fileName;
        file.url = url;
        file.thumbUrl = url;
        file.status = "done";
        fileList.value = [file];
        formData.productImage = url;
      } else {
        message.error(res.msg || "上传失败");
      }
      loading.value = false;
    })
    .catch((err) => {
      console.error("上传失败:", err);
      loading.value = false;
    });

  return false; // 阻止自动上传
};

// 查看商品详情
const viewVisible = ref(false);
const currentProduct = ref({});

const handleView = async (record) => {
  try {
    loading.value = true;
    // 调用获取商品详细信息接口
    const res = await request.get(`/biz/product/${record.id}`);
    if (res.code === 200 && res.data) {
      currentProduct.value = res.data;
      currentProduct.value.productImage =
        import.meta.env.VITE_BASE_URL + currentProduct.value.productImage;
      viewVisible.value = true;
    } else {
      message.error(res.msg || "获取商品详情失败");
    }
  } catch (error) {
    console.error("获取商品详情失败:", error);
    message.error("获取商品详情失败");
  } finally {
    loading.value = false;
  }
};

// 删除商品
const handleDelete = async (id) => {
  try {
    const res = await request.delete(`/biz/product/${id}`);
    if (res.code === 200) {
      message.success("商品删除成功");
      fetchProductList(); // 刷新列表
    } else {
      message.error(res.msg || "删除失败");
    }
  } catch (error) {
    console.error("删除失败", error);
    message.error("删除失败");
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    if (selectedRowKeys.value.length === 0) {
      message.warning("请选择要删除的商品");
      return;
    }

    // 使用正确的接口格式: /biz/product/5,6
    const ids = selectedRowKeys.value.join(",");
    const res = await request.delete(`/biz/product/${ids}`);

    if (res.code === 200) {
      message.success("批量删除成功");
      selectedRowKeys.value = [];
      fetchProductList(); // 刷新列表
    } else {
      message.error(res.msg || "批量删除失败");
    }
  } catch (error) {
    console.error("批量删除失败", error);
    message.error("批量删除失败");
  }
};

// 处理商品状态变更
const handleStatusChange = async (record) => {
  try {
    const newStatus = record.productStatus === "1" ? "0" : "1";
    const res = await request.put("/biz/product", {
      id: record.id,
      productName: record.productName,
      productImage: record.productImage.replace(
        import.meta.env.VITE_BASE_URL,
        ""
      ),
      productType: record.productType,
      productTypeId: record.productTypeId,
      productStatus: newStatus,
    });

    if (res.code === 200) {
      message.success(`商品${newStatus === "1" ? "上架" : "下架"}成功`);
      fetchProductList(); // 刷新列表
    } else {
      message.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("状态变更失败", error);
    message.error("操作失败");
  }
};

// 添加日期格式化函数
const formatDateTime = (dateStr) => {
  if (!dateStr) return "--";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

// 批量导入相关
const importModalVisible = ref(false);
const importModalRef = ref(null);

// 显示导入模态框
const handleImport = () => {
  importModalVisible.value = true;
};

// 处理导入
const handleImportConfirm = async (file, updateSupport) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await request.post("/biz/product/importData", formData, {
    params: {
      updateSupport: updateSupport ? "true" : "false",
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (res.code === 200) {
    // 显示导入成功结果
    importModalRef.value.showImportResult(res.msg, true);

    // 重新加载数据
    fetchProductList();
  } else {
      importModalRef.value.showImportResult(res.msg, false);
    }
  } catch (error) {
    importModalRef.value.showImportResult(error.msg, false);
  }
};
</script>

<style scoped lang="less">
.products-list {
  .product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
  }
  .ant-space {
    white-space: nowrap;
  }
  h1 {
    margin-bottom: 24px;
  }

  .search-bar {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .product-name {
      color: #333;
    }
  }

  .batch-operation-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 24px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
  }
}
</style>
