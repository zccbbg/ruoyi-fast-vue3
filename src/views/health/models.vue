<template>
  <main class="models-page">
    <header class="models-header">
      <div><p class="eyebrow">MODEL SETTINGS</p><h1>模型配置</h1></div>
      <el-button type="primary" :icon="Plus" @click="openCreate">添加模型</el-button>
    </header>
    <section v-for="section in sections" :key="section.value" class="model-section">
      <div class="section-heading"><h2>{{ section.label }}</h2><span>{{ models.filter(item => item.purpose === section.value).length }} 个模型</span></div>
      <el-empty v-if="!models.some(item => item.purpose === section.value)" description="尚未配置模型" :image-size="80" />
      <div v-for="item in models.filter(model => model.purpose === section.value)" :key="item.id" class="model-row">
        <div class="model-identity">
          <strong>{{ item.name }}</strong>
          <span>{{ providerNames[item.provider] || item.provider }} · {{ item.modelId }}</span>
        </div>
        <div class="model-actions">
          <el-tag v-if="item.isDefault" type="success" effect="plain">默认</el-tag>
          <el-button v-else type="primary" link @click="makeDefault(item)">设为默认</el-button>
          <el-button :icon="Delete" circle title="删除模型" aria-label="删除模型" @click="deleteItem(item)" />
        </div>
      </div>
    </section>
    <section class="model-section">
      <div class="section-heading"><h2>问答系统提示词</h2></div>
      <p class="prompt-hint">保存后，新发起的问答会使用这里的内容。</p>
      <el-input v-model="systemPrompt" type="textarea" :rows="8" maxlength="10000" show-word-limit placeholder="填写问答系统提示词" />
      <div class="prompt-actions"><el-button v-hasPermi="['system:config:edit']" type="primary" :loading="promptSaving" @click="savePrompt">保存提示词</el-button></div>
    </section>
    <el-dialog v-model="visible" title="添加模型" width="min(520px, 94vw)">
      <el-form :model="form" label-position="top">
        <el-form-item label="用途"><el-radio-group v-model="form.purpose">
          <el-radio-button v-for="item in sections" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group></el-form-item>
        <el-form-item label="服务商"><el-select v-model="form.provider">
          <el-option label="DeepSeek" value="DEEPSEEK" /><el-option label="OpenAI" value="OPENAI" />
          <el-option label="千问" value="QWEN" />
        </el-select></el-form-item>
        <el-form-item label="显示名称"><el-input v-model="form.name" maxlength="80" placeholder="例如：日常问答" /></el-form-item>
        <el-form-item label="模型编号"><el-input v-model="form.modelId" maxlength="100" placeholder="填写服务商提供的模型 ID" /></el-form-item>
        <el-form-item label="API Key"><el-input v-model="form.apiKey" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item label="设为默认"><el-switch v-model="form.makeDefault" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listModels, addModel, setDefaultModel, removeModel, getHealthPrompt, saveHealthPrompt } from '@/api/health'

const sections = [{ value: 'CHAT', label: '资料问答' }, { value: 'REPORT', label: '报告识别' }]
const providerNames = { DEEPSEEK: 'DeepSeek', OPENAI: 'OpenAI', QWEN: '千问' }
const models = ref([])
const visible = ref(false)
const saving = ref(false)
const systemPrompt = ref('')
const promptSaving = ref(false)
const form = reactive({ name: '', provider: 'DEEPSEEK', purpose: 'CHAT', modelId: '', apiKey: '', makeDefault: true })

// 用途：读取不含密钥的模型列表；参数：无；返回值：无。
async function refresh() {
  const result = await listModels()
  models.value = result.data || []
}

// 用途：读取数据库中的问答系统提示词并填入编辑框；参数：无；返回值：无。
async function loadPrompt() {
  const prompt = await getHealthPrompt()
  systemPrompt.value = prompt.data || ''
}

// 用途：将编辑后的问答系统提示词保存到数据库；参数：无；返回值：无。
async function savePrompt() {
  if (!systemPrompt.value.trim()) {
    ElMessage.warning('系统提示词不能为空')
    return
  }
  promptSaving.value = true
  try {
    await saveHealthPrompt(systemPrompt.value)
    ElMessage.success('系统提示词已保存')
  } finally {
    promptSaving.value = false
  }
}

// 用途：清空模型表单并打开弹窗；参数：无；返回值：无。
function openCreate() {
  Object.assign(form, { name: '', provider: 'DEEPSEEK', purpose: 'CHAT', modelId: '', apiKey: '', makeDefault: true })
  visible.value = true
}

// 用途：提交模型配置并清除页面上的密钥；参数：无；返回值：无。
async function save() {
  if (!form.name.trim() || !form.modelId.trim() || !form.apiKey.trim()) {
    ElMessage.warning('请填写名称、模型编号和 API Key')
    return
  }
  saving.value = true
  try {
    await addModel({ ...form })
    form.apiKey = ''
    visible.value = false
    await refresh()
    ElMessage.success('模型已保存')
  } finally {
    saving.value = false
  }
}

// 用途：将模型设为对应用途的默认配置；参数：模型条目；返回值：无。
async function makeDefault(item) {
  await setDefaultModel(item.id)
  await refresh()
  ElMessage.success('默认模型已更新')
}

// 用途：确认后删除模型配置；参数：模型条目；返回值：无。
async function deleteItem(item) {
  await ElMessageBox.confirm(`删除模型“${item.name}”？`, '删除模型', { type: 'warning' })
  await removeModel(item.id)
  await refresh()
  ElMessage.success('模型已删除')
}

onMounted(refresh)
onMounted(loadPrompt)
</script>

<style scoped>
/* 配置页沿用健康工作区的浅色背景。 */
.models-page { min-height: calc(100vh - 68px); padding: 28px clamp(16px, 3vw, 48px) 56px; background: #f7f9f8; color: #22312f; }
/* 页面标题和新增命令并排。 */
.models-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; max-width: 960px; margin: 0 auto 30px; }
/* 英文小标题保持统一视觉标记。 */
.eyebrow { margin: 0 0 5px; color: #0e827b; font-size: 11px; font-weight: 700; }
/* 标题保持管理页面的紧凑字号。 */
.models-header h1 { margin: 0; font-size: 28px; }
/* 模型类型作为独立的页面区域。 */
.model-section { max-width: 960px; margin: 0 auto 32px; }
/* 类型标题和数量保持平衡。 */
.section-heading { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #d9e2df; }
/* 区域标题避免超大字。 */
.section-heading h2 { margin: 0; font-size: 18px; }
/* 模型数量使用次级色。 */
.section-heading span { color: #697a74; font-size: 13px; }
/* 每个配置独立成行便于扫描。 */
.model-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 68px; border-bottom: 1px solid #e2e8e5; }
/* 模型名称和编号按阅读顺序排列。 */
.model-identity { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
/* 模型编号可换行以避免窄屏溢出。 */
.model-identity span { color: #6b7974; font-size: 13px; overflow-wrap: anywhere; }
/* 状态和删除命令保持稳定间距。 */
.model-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 10px; }
/* 提示文字使用次级色并与输入框留出间距。 */
.prompt-hint { margin: 14px 0 12px; color: #697a74; font-size: 13px; }
/* 保存按钮靠右排列。 */
.prompt-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
/* 手机端缩小页面留白和标题。 */
@media (max-width: 760px) {
  /* 页面外边距适合手机。 */
  .models-page { padding: 18px 14px 36px; }
  /* 标题与现有工作区一致。 */
  .models-header h1 { font-size: 23px; }
}
</style>
