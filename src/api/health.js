import request from '@/utils/request'
import { getToken } from '@/utils/auth'

// 用途：读取家人目录；参数：无；返回值：目录响应。
export function listMembers() {
  return request({ url: '/health/members', method: 'get' })
}

// 用途：读取回答引用的 Markdown；参数：成员和相对路径；返回值：文件原文。
export function getSource(member, path) {
  return request({ url: '/health/source', method: 'get', params: { member, path } })
}

// 用途：提交文字问题并逐段读取流式回答；参数：问答数据、事件回调和取消信号；返回值：会话编号与引用来源。
export async function askHealth(data, onEvent, signal) {
  const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/health/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: JSON.stringify(data),
    signal
  })
  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/event-stream')) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.msg || '问答暂时无法完成，请重试')
  }
  if (!response.body) throw new Error('问答暂时无法完成，请重试')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let boundary
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        if (!frame.startsWith('data:')) continue
        const event = JSON.parse(frame.slice(5))
        if (event.type === 'error') throw new Error(event.message)
        if (event.type === 'chunk') onEvent(event.text)
        if (event.type === 'done') return event
      }
    }
    throw new Error('回答中断，请重试')
  } finally {
    reader.releaseLock()
  }
}

// 用途：通知服务端停止指定的问答生成；参数：本轮请求编号；返回值：停止操作响应。
export function stopHealth(requestId) {
  return request({ url: `/health/ask/${requestId}`, method: 'delete' })
}

// 用途：读取聊天会话；参数：成员名称；返回值：会话列表。
export function listConversations(member) {
  return request({ url: '/health/conversations', method: 'get', params: { member } })
}

// 用途：读取会话消息；参数：成员名称和会话编号；返回值：消息列表。
export function getConversation(member, id) {
  return request({ url: `/health/conversations/${id}`, method: 'get', params: { member } })
}

// 用途：读取当前账号对指定成员的跨会话记忆；参数：成员名称；返回值：记忆列表响应。
export function listMemories(member) {
  return request({ url: '/health/memories', method: 'get', params: { member } })
}

// 用途：修改当前账号的一条记忆；参数：成员名称、记忆编号和新内容；返回值：操作响应。
export function updateMemory(member, id, content) {
  return request({ url: `/health/memories/${id}`, method: 'put', data: { member, content } })
}

// 用途：删除当前账号的一条记忆；参数：成员名称和记忆编号；返回值：操作响应。
export function deleteMemory(member, id) {
  return request({ url: `/health/memories/${id}`, method: 'delete', params: { member } })
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

// 用途：读取数据库中的问答系统提示词；参数：无；返回值：提示词响应。
export function getHealthPrompt() {
  return request({ url: '/health/prompt', method: 'get' })
}

// 用途：保存问答系统提示词；参数：提示词内容；返回值：操作响应。
export function saveHealthPrompt(content) {
  return request({ url: '/health/prompt', method: 'put', data: { content } })
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
