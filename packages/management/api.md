# API 文档

## 目录
- [评论接口](#评论接口)
- [发帖接口](#发帖接口)
- [商品接口](#商品接口)
- [标签接口](#标签接口)
- [标签日志接口](#标签日志接口)

## 评论接口

### 1. 查询评论列表
- **URL**: `/biz/comment/list`
- **Method**: GET
- **请求参数**:
  ```json
  {
    "content": "评论内容",
    "postId": "帖子ID",
    "createdAt": "创建时间",
    "updatedAt": "更新时间",
    "createdBy": "创建人",
    "updatedBy": "更新人"
  }
  ```
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "评论ID",
      "content": "评论内容",
      "postId": "帖子ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }]
  }
  ```



### 3. 获取评论详细信息
- **URL**: `/biz/comment/{id}`
- **Method**: GET
- **路径参数**: id - 评论ID
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "评论ID",
      "content": "评论内容",
      "postId": "帖子ID",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }
  }
  ```

### 4. 新增评论
- **URL**: `/biz/comment`
- **Method**: POST
- **请求参数**:
  ```json
  {
    "content": "评论内容",
    "postId": "帖子ID"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 5. 修改评论
- **URL**: `/biz/comment`
- **Method**: PUT
- **请求参数**:
  ```json
  {
    "id": "评论ID",
    "content": "评论内容",
    "postId": "帖子ID"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 6. 删除评论
- **URL**: `/biz/comment/{ids}`
- **Method**: DELETE
- **路径参数**: ids - 评论ID数组
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

## 发帖接口

### 1. 查询发帖列表
- **URL**: `/biz/post/list`
- **Method**: GET
- **请求参数**:
  ```json
  {
    "imageUrl": "图片地址",
    "content": "内容",
    "createdAt": "创建时间",
    "updatedAt": "更新时间",
    "createdBy": "创建人",
    "updatedBy": "更新人"
  }
  ```
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "帖子ID",
      "imageUrl": "图片地址",
      "content": "内容",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }]
  }
  ```

### 2. 查询带评论的发帖列表
- **URL**: `/biz/post/compose/list`
- **Method**: GET
- **请求参数**: 同查询发帖列表
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "帖子ID",
      "imageUrl": "图片地址",
      "content": "内容",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人",
      "comments": [{
        "id": "评论ID",
        "content": "评论内容",
        "postId": "帖子ID",
        "createdAt": "创建时间",
        "updatedAt": "更新时间",
        "createdBy": "创建人",
        "updatedBy": "更新人"
      }]
    }]
  }
  ```


### 4. 获取发帖详细信息
- **URL**: `/biz/post/{id}`
- **Method**: GET
- **路径参数**: id - 帖子ID
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "帖子ID",
      "imageUrl": "图片地址",
      "content": "内容",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }
  }
  ```

### 5. 新增发帖
- **URL**: `/biz/post`
- **Method**: POST
- **请求参数**:
  ```json
  {
    "imageUrl": "图片地址",
    "content": "内容"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 6. 修改发帖
- **URL**: `/biz/post`
- **Method**: PUT
- **请求参数**:
  ```json
  {
    "id": "帖子ID",
    "imageUrl": "图片地址",
    "content": "内容"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 7. 删除发帖
- **URL**: `/biz/post/{ids}`
- **Method**: DELETE
- **路径参数**: ids - 帖子ID数组
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

## 商品接口

### 1. 查询商品列表
- **URL**: `/biz/product/list`
- **Method**: GET
- **请求参数**:
  ```json
  {
    "productName": "商品名称",
    "productImage": "商品图片",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "productStatus": "商品状态",
    "createdAt": "创建时间",
    "updatedAt": "更新时间",
    "createdBy": "创建人",
    "updatedBy": "更新人"
  }
  ```
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "商品ID",
      "productName": "商品名称",
      "productImage": "商品图片",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "productStatus": "商品状态",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }]
  }
  ```



### 3. 获取商品详细信息
- **URL**: `/biz/product/{id}`
- **Method**: GET
- **路径参数**: id - 商品ID
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "商品ID",
      "productName": "商品名称",
      "productImage": "商品图片",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "productStatus": "商品状态",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }
  }
  ```

### 4. 新增商品
- **URL**: `/biz/product`
- **Method**: POST
- **请求参数**:
  ```json
  {
    "productName": "商品名称",
    "productImage": "商品图片",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "productStatus": "商品状态"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 5. 修改商品
- **URL**: `/biz/product`
- **Method**: PUT
- **请求参数**:
  ```json
  {
    "id": "商品ID",
    "productName": "商品名称",
    "productImage": "商品图片",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "productStatus": "商品状态"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 6. 删除商品
- **URL**: `/biz/product/{ids}`
- **Method**: DELETE
- **路径参数**: ids - 商品ID数组
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

## 标签接口

### 1. 查询标签列表
- **URL**: `/biz/tag/list`
- **Method**: GET
- **请求参数**:
  ```json
  {
    "tagData": "标签数据",
    "tagType": "标签类型",
    "tagTypeId": "标签类型ID",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "lastVerificationTime": "最新验证时间",
    "createdAt": "创建时间",
    "updatedAt": "更新时间",
    "createdBy": "创建人",
    "updatedBy": "更新人"
  }
  ```
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "标签ID",
      "tagData": "标签数据",
      "tagType": "标签类型",
      "tagTypeId": "标签类型ID",
      "productId": "商品ID",
      "productName": "商品名称",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "verificationCount": "验证次数",
      "verificationResult": "验证结果",
      "lastVerificationTime": "最新验证时间",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }]
  }
  ```



### 3. 获取标签详细信息
- **URL**: `/biz/tag/{id}`
- **Method**: GET
- **路径参数**: id - 标签ID
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "标签ID",
      "tagData": "标签数据",
      "tagType": "标签类型",
      "tagTypeId": "标签类型ID",
      "productId": "商品ID",
      "productName": "商品名称",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "verificationCount": "验证次数",
      "verificationResult": "验证结果",
      "lastVerificationTime": "最新验证时间",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }
  }
  ```

### 4. 新增标签
- **URL**: `/biz/tag`
- **Method**: POST
- **请求参数**:
  ```json
  {
    "tagData": "标签数据",
    "tagType": "标签类型",
    "tagTypeId": "标签类型ID",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "lastVerificationTime": "最新验证时间"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 5. 修改标签
- **URL**: `/biz/tag`
- **Method**: PUT
- **请求参数**:
  ```json
  {
    "id": "标签ID",
    "tagData": "标签数据",
    "tagType": "标签类型",
    "tagTypeId": "标签类型ID",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "lastVerificationTime": "最新验证时间"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 6. 删除标签
- **URL**: `/biz/tag/{ids}`
- **Method**: DELETE
- **路径参数**: ids - 标签ID数组
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

## 标签日志接口

### 1. 查询标签日志列表
- **URL**: `/biz/log/list`
- **Method**: GET
- **请求参数**:
  ```json
  {
    "tagId": "标签ID",
    "tagData": "标签数据",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "city": "城市",
    "province": "省份",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "verificationTime": "本次验证时间",
    "createdAt": "创建时间",
    "updatedAt": "更新时间",
    "createdBy": "创建人",
    "updatedBy": "更新人"
  }
  ```
- **返回参数**:
  ```json
  {
    "total": "总记录数",
    "rows": [{
      "id": "日志ID",
      "tagId": "标签ID",
      "tagData": "标签数据",
      "productId": "商品ID",
      "productName": "商品名称",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "city": "城市",
      "province": "省份",
      "verificationCount": "验证次数",
      "verificationResult": "验证结果",
      "verificationTime": "本次验证时间",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }]
  }
  ```


### 3. 获取标签日志详细信息
- **URL**: `/biz/log/{id}`
- **Method**: GET
- **路径参数**: id - 日志ID
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "日志ID",
      "tagId": "标签ID",
      "tagData": "标签数据",
      "productId": "商品ID",
      "productName": "商品名称",
      "productType": "商品类型",
      "productTypeId": "商品类型ID",
      "city": "城市",
      "province": "省份",
      "verificationCount": "验证次数",
      "verificationResult": "验证结果",
      "verificationTime": "本次验证时间",
      "createdAt": "创建时间",
      "updatedAt": "更新时间",
      "createdBy": "创建人",
      "updatedBy": "更新人"
    }
  }
  ```

### 4. 新增标签日志
- **URL**: `/biz/log`
- **Method**: POST
- **请求参数**:
  ```json
  {
    "tagId": "标签ID",
    "tagData": "标签数据",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "city": "城市",
    "province": "省份",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "verificationTime": "本次验证时间"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 5. 修改标签日志
- **URL**: `/biz/log`
- **Method**: PUT
- **请求参数**:
  ```json
  {
    "id": "日志ID",
    "tagId": "标签ID",
    "tagData": "标签数据",
    "productId": "商品ID",
    "productName": "商品名称",
    "productType": "商品类型",
    "productTypeId": "商品类型ID",
    "city": "城市",
    "province": "省份",
    "verificationCount": "验证次数",
    "verificationResult": "验证结果",
    "verificationTime": "本次验证时间"
  }
  ```
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ```

### 6. 删除标签日志
- **URL**: `/biz/log/{ids}`
- **Method**: DELETE
- **路径参数**: ids - 日志ID数组
- **返回参数**:
  ```json
  {
    "code": 200,
    "msg": "操作成功"
  }
  ``` 