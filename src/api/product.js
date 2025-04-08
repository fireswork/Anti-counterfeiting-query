import request from './request'

// 获取商品列表
export function getProducts(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

// 获取商品分类
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

// 商品上架
export function onShelfProduct(id) {
  return request({
    url: `/products/${id}/on-shelf`,
    method: 'patch'
  })
}

// 商品下架
export function offShelfProduct(id) {
  return request({
    url: `/products/${id}/off-shelf`,
    method: 'patch'
  })
}

// 上传商品图片
export function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 