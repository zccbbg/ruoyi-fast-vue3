import request from '@/utils/request'

// 用途：读取家人目录；参数：无；返回值：目录响应。
export function listMembers() {
  return request({ url: '/health/members', method: 'get' })
}

// 用途：读取回答引用的 Markdown；参数：成员和相对路径；返回值：文件原文。
export function getSource(member, path) {
  return request({ url: '/health/source', method: 'get', params: { member, path } })
}

// 用途：提交文字问题；参数：问答数据；返回值：回答与引用来源。
export function askHealth(data) {
  return request({ url: '/health/ask', method: 'post', data, timeout: 120000 })
}

// 用途：读取聊天会话；参数：成员名称；返回值：会话列表。
export function listConversations(member) {
  return request({ url: '/health/conversations', method: 'get', params: { member } })
}

// 用途：读取会话消息；参数：成员名称和会话编号；返回值：消息列表。
export function getConversation(member, id) {
  return request({ url: `/health/conversations/${id}`, method: 'get', params: { member } })
}

// 用途：读取结构化指标；参数：成员名称；返回值：指标列表。
export function listTrends(member) {
  return request({ url: '/health/trends', method: 'get', params: { member } })
}

// 用途：上传 PDF 或图片并取得草稿；参数：上传表单；返回值：待确认报告。
export function uploadReport(data) {
  return request({ url: '/health/reports', method: 'post', data, timeout: 120000,
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false } })
}

// 用途：列出待确认报告；参数：成员名称；返回值：草稿列表。
export function listDrafts(member) {
  return request({ url: '/health/reports/drafts', method: 'get', params: { member } })
}

// 用途：读取待核对草稿对应的原始报告；参数：成员和草稿编号；返回值：报告 Blob。
export function getDraftOriginal(member, id) {
  return request({ url: `/health/reports/drafts/${id}/original`, method: 'get',
    params: { member }, responseType: 'blob' })
}

// 用途：确认核对后的报告；参数：成员名称和草稿；返回值：操作结果。
export function confirmReport(member, data) {
  return request({ url: '/health/reports/confirm', method: 'post', params: { member }, data })
}

// 用途：读取可用模型；参数：无；返回值：不含密钥的模型列表。
export function listModels() {
  return request({ url: '/health/models', method: 'get' })
}

// 用途：添加模型配置；参数：配置表单；返回值：模型编号。
export function addModel(data) {
  return request({ url: '/health/models', method: 'post', data })
}

// 用途：将指定模型设为该用途默认值；参数：模型编号；返回值：操作结果。
export function setDefaultModel(id) {
  return request({ url: `/health/models/${id}/default`, method: 'post' })
}

// 用途：删除模型配置；参数：模型编号；返回值：操作结果。
export function removeModel(id) {
  return request({ url: `/health/models/${id}`, method: 'delete' })
}
