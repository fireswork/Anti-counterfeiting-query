# 防伪查询系统

这是一个基于 Vue 3 + Spring Boot 的防伪查询系统，支持移动端H5访问。

## 项目结构

```
Anti-counterfeiting-query/
├── packages/                # 项目包目录
│   ├── client/             # H5客户端
│   │   ├── src/
│   │   │   ├── assets/    # 静态资源
│   │   │   ├── components/# 组件
│   │   │   ├── router/    # 路由配置
│   │   │   ├── stores/    # 状态管理
│   │   │   ├── views/     # 页面
│   │   │   ├── App.vue    # 根组件
│   │   │   └── main.js    # 入口文件
│   │   └── package.json
│   └── management/         # 管理后台
│       └── package.json
└── README.md
```

## 技术栈

### 客户端 (H5)
- Vue 3
- Vue Router
- Pinia
- Vant UI
- Axios
- Less

### 管理后台
- Vue 3
- Vue Router
- Pinia
- Ant Design Vue
- Axios
- Less
- ECharts

## 功能特性

### 客户端功能
1. 用户认证
   - 手机号登录
   - 用户注册
   - Token 管理
   - 路由权限控制

2. 个人中心
   - 头像上传（支持裁切）
   - 个人信息管理
   - 密码修改

3. 防伪查询
   - 商品扫码
   - 查询历史
   - 结果展示

### 界面特点
1. 移动端适配
   - 响应式布局
   - 触摸友好
   - 适配不同屏幕尺寸

2. 用户体验
   - 表单验证
   - 加载状态
   - 错误提示
   - 优雅的背景动画

## 开发指南

### 环境要求
- Node.js >= 16
- pnpm >= 8.15.4

### 安装依赖
```bash
# 安装项目依赖
pnpm install
```

### 开发服务
```bash
# 启动客户端开发服务
cd packages/client
pnpm dev

# 启动管理后台开发服务
cd packages/management
pnpm dev
```

### 构建部署
```bash
# 构建客户端
cd packages/client
pnpm build

# 构建管理后台
cd packages/management
pnpm build
```

## API 接口

### 用户认证
- POST `/api/login` - 用户登录
- POST `/api/register` - 用户注册

### 用户信息
- GET `/api/user/info` - 获取用户信息
- PUT `/api/user/info` - 更新用户信息
- POST `/api/user/avatar` - 上传头像

### 防伪查询
- POST `/api/query` - 商品查询
- GET `/api/history` - 查询历史

## 注意事项

1. 开发规范
   - 遵循 Vue 3 组合式 API 规范
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 进行代码格式化

2. 安全考虑
   - 所有API请求需要携带 Token
   - 密码传输需要加密
   - 文件上传需要验证类型和大小

3. 性能优化
   - 路由懒加载
   - 组件按需引入
   - 图片资源压缩

## 后期规划

1. 功能扩展
   - 硬件设备对接
   - 更多认证方式
   - 数据分析功能

2. 性能优化
   - 首屏加载优化
   - 缓存策略优化
   - 图片加载优化

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 发起 Pull Request

## 许可证

[MIT License](LICENSE)
