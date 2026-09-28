<template>
  <main class="health-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">HEALTH RECORD</p>
        <h1>健康资料</h1>
      </div>
      <el-select v-model="member" class="member-select" placeholder="选择家人"
        :disabled="asking || uploading || confirming" @change="memberChanged">
        <el-option v-for="item in members" :key="item" :label="item" :value="item" />
      </el-select>
    </header>

    <nav class="view-tabs" aria-label="健康资料视图">
      <button v-for="item in tabs" :key="item.value" type="button"
        :class="{ active: tab === item.value }" @click="selectTab(item.value)">{{ item.label }}</button>
    </nav>

    <section v-if="tab === 'ask'" class="work-section">
      <div class="section-heading">
        <h2>资料问答</h2>
        <div class="heading-actions">
          <el-select v-model="modelId" class="model-select" placeholder="选择问答模型">
            <el-option v-for="item in chatModels" :key="item.id"
              :label="`${item.name} · ${item.provider === 'DEEPSEEK' ? 'DeepSeek' : 'OpenAI'}`" :value="item.id" />
          </el-select>
          <el-button :icon="Plus" circle title="新对话" aria-label="新对话" @click="newConversation" />
        </div>
      </div>
      <el-alert v-if="!chatModels.length" type="warning" :closable="false" class="config-alert">
        <template #title>请先在<router-link to="/health/models">模型配置</router-link>中添加问答模型</template>
      </el-alert>
      <div class="conversation-layout">
        <aside class="conversation-list" aria-label="最近对话">
          <button type="button" :class="{ selected: !conversationId }" @click="newConversation">新对话</button>
          <button v-for="item in conversations" :key="item.id" type="button"
            :class="{ selected: conversationId === item.id }" @click="openConversation(item.id)">
            {{ item.title }}
          </button>
        </aside>
        <div class="chat-column">
          <div class="messages" aria-live="polite">
            <el-empty v-if="!messages.length" description="暂无对话" :image-size="88" />
            <article v-for="(item, index) in messages" :key="index" class="message"
              :class="item.role === 'user' ? 'message-user' : 'message-answer'">
              <span class="message-role">{{ item.role === 'user' ? '你' : '健康资料助手' }}</span>
              <p>{{ item.content }}</p>
              <div v-if="item.sources?.length" class="sources">
                <button v-for="path in item.sources" :key="path" type="button" @click="openSource(path)">
                  <el-icon><Document /></el-icon><span>{{ path }}</span>
                </button>
              </div>
            </article>
          </div>
          <form class="ask-form" @submit.prevent="submitQuestion">
            <el-input v-model="question" type="textarea" :rows="2" resize="none"
              placeholder="输入想了解的健康资料问题" :maxlength="2000" />
            <el-button type="primary" :icon="Promotion" native-type="submit" :loading="asking"
              :disabled="!member || !question.trim() || !chatModels.length">提问</el-button>
          </form>
        </div>
      </div>
    </section>

    <section v-else-if="tab === 'reports'" class="work-section">
      <div class="section-heading"><h2>上传报告</h2><span class="section-count">{{ drafts.length }} 份待核对</span></div>
      <el-alert v-if="!reportModels.length" type="warning" :closable="false" class="config-alert">
        <template #title>请先在<router-link to="/health/models">模型配置</router-link>中添加报告识别模型</template>
      </el-alert>
      <form class="upload-form" @submit.prevent="submitReport">
        <label>报告日期<el-date-picker v-model="reportDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" /></label>
        <label>报告名称<el-input v-model="reportTitle" placeholder="例如：年度体检报告" maxlength="80" /></label>
        <label class="file-field">PDF / JPG / PNG
          <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" @change="fileChanged" />
        </label>
        <el-button type="primary" native-type="submit" :loading="uploading"
          :disabled="!member || !reportDate || !reportTitle.trim() || !reportFile || !reportModels.length">
          上传并生成草稿
        </el-button>
      </form>
      <div class="drafts">
        <h3>待核对</h3>
        <el-empty v-if="!drafts.length" description="暂无待核对报告" :image-size="80" />
        <button v-for="item in drafts" :key="item.id" type="button" class="draft-row" @click="editDraft(item)">
          <span><strong>{{ item.title }}</strong><small>{{ item.date }}</small></span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </section>

    <section v-else class="work-section">
      <div class="section-heading"><h2>指标趋势</h2><span class="section-count">{{ filteredTrends.length }} 条记录</span></div>
      <div class="trend-controls">
        <el-select v-model="metric" placeholder="选择指标" filterable class="metric-select">
          <el-option v-for="item in metricNames" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div v-if="filteredTrends.length" ref="chartEl" class="trend-chart" role="img" :aria-label="metric + '趋势图'" />
      <el-empty v-else description="暂无可展示的指标" />
      <div v-if="filteredTrends.length" class="observation-list">
        <div v-for="(item, index) in filteredTrends" :key="index" class="observation-row">
          <time>{{ item.date }}</time><strong>{{ item.value }} {{ item.unit }}</strong>
          <span>{{ item.status }} · {{ item.source }}</span>
        </div>
      </div>
    </section>

    <el-dialog v-model="sourceVisible" :title="sourcePath" width="min(800px, 94vw)">
      <pre class="source-text">{{ sourceText }}</pre>
    </el-dialog>

    <el-dialog v-model="draftVisible" title="核对报告草稿" width="min(850px, 96vw)" class="draft-dialog">
      <div v-if="draft" class="draft-editor">
        <p class="draft-note">请对照原始报告核对文字与指标。确认后会更新健康档案。</p>
        <el-button :icon="View" class="original-button" @click="showOriginal">查看原始报告</el-button>
        <label>报告名称<el-input v-model="draft.title" /></label>
        <label>报告日期<el-date-picker v-model="draft.date" value-format="YYYY-MM-DD" type="date" /></label>
        <label>关键摘要<el-input v-model="draft.summary" type="textarea" :rows="4" /></label>
        <label>报告原文转写<el-input v-model="draft.transcription" type="textarea" :rows="8" /></label>
        <div class="draft-subheading"><h3>提取的指标</h3><el-button :icon="Plus" circle title="添加指标" aria-label="添加指标" @click="addObservation" /></div>
        <div v-for="(item, index) in draft.observations" :key="index" class="observation-edit">
          <el-input v-model="item.name" placeholder="指标" />
          <el-input v-model="item.value" placeholder="数值" />
          <el-input v-model="item.unit" placeholder="单位" />
          <el-button :icon="Delete" circle title="移除指标" aria-label="移除指标" @click="draft.observations.splice(index, 1)" />
        </div>
        <label>待确认事项（每行一项）<el-input v-model="todoText" type="textarea" :rows="3" /></label>
      </div>
      <template #footer>
        <el-button @click="draftVisible = false">稍后核对</el-button>
        <el-button type="primary" :loading="confirming" @click="confirmDraft">确认并归档</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="originalVisible" title="原始报告" width="min(950px, 96vw)" @closed="clearOriginal">
      <iframe v-if="originalUrl && draft?.originalName.endsWith('.pdf')" :src="originalUrl" class="original-preview" title="报告 PDF 原件" />
      <img v-else-if="originalUrl" :src="originalUrl" class="original-image" alt="报告原件" />
    </el-dialog>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Plus, Promotion, Document, ArrowRight, Delete, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { listMembers, askHealth, getSource, listConversations, getConversation,
  listTrends, uploadReport, listDrafts, getDraftOriginal, confirmReport, listModels } from '@/api/health'

const tabs = [{ value: 'ask', label: '提问' }, { value: 'reports', label: '报告' }, { value: 'trends', label: '趋势' }]
const tab = ref('ask')
const members = ref([])
const member = ref('')
const models = ref([])
const modelId = ref('')
const question = ref('')
const asking = ref(false)
const conversationId = ref('')
const conversations = ref([])
const messages = ref([])
const sourceVisible = ref(false)
const sourcePath = ref('')
const sourceText = ref('')
const reportDate = ref(new Date().toLocaleDateString('sv-SE'))
const reportTitle = ref('')
const reportFile = ref(null)
const fileInput = ref(null)
const uploading = ref(false)
const drafts = ref([])
const draft = ref(null)
const draftVisible = ref(false)
const originalVisible = ref(false)
const originalUrl = ref('')
const todoText = ref('')
const confirming = ref(false)
const trends = ref([])
const metric = ref('')
const chartEl = ref(null)
let chart = null
const chatModels = computed(() => models.value.filter(item => item.purpose === 'CHAT'))
const reportModels = computed(() => models.value.filter(item => item.purpose === 'REPORT'))
const metricNames = computed(() => [...new Set(trends.value.filter(item => item.status !== '待核对')
  .map(item => `${item.name} (${item.unit || '无单位'})`))])
const filteredTrends = computed(() => trends.value.filter(item =>
  `${item.name} (${item.unit || '无单位'})` === metric.value && item.status !== '待核对'))

// 用途：加载成员和模型配置；参数：无；返回值：无。
async function initialize() {
  const [memberResult, modelResult] = await Promise.all([listMembers(), listModels()])
  members.value = memberResult.data || []
  models.value = modelResult.data || []
  member.value = members.value[0] || ''
  modelId.value = chatModels.value.find(item => item.isDefault)?.id || chatModels.value[0]?.id || ''
  if (member.value) await memberChanged()
}

// 用途：切换成员并刷新当前资料；参数：无；返回值：无。
async function memberChanged() {
  newConversation()
  const [history, pending, data] = await Promise.all([
    listConversations(member.value), listDrafts(member.value), listTrends(member.value)
  ])
  conversations.value = history.data || []
  drafts.value = pending.data || []
  trends.value = data.data || []
  metric.value = metricNames.value[0] || ''
}

// 用途：切换工作区视图；参数：视图名称；返回值：无。
function selectTab(value) {
  tab.value = value
  if (value === 'trends') nextTick(drawChart)
}

// 用途：新建空白对话；参数：无；返回值：无。
function newConversation() {
  conversationId.value = ''
  messages.value = []
}

// 用途：打开历史对话；参数：会话编号；返回值：无。
async function openConversation(id) {
  const result = await getConversation(member.value, id)
  conversationId.value = id
  messages.value = (result.data || []).map(item => ({ ...item,
    sources: item.sources ? JSON.parse(item.sources) : [] }))
}

// 用途：提交资料问题并显示回答；参数：无；返回值：无。
async function submitQuestion() {
  if (!member.value || !modelId.value || !question.value.trim() || asking.value) return
  const text = question.value.trim()
  asking.value = true
  try {
    const result = await askHealth({ member: member.value, text, modelId: modelId.value,
      conversationId: conversationId.value || null })
    conversationId.value = result.data.conversationId
    messages.value.push({ role: 'user', content: text, sources: [] },
      { role: 'assistant', content: result.data.text, sources: result.data.sources })
    question.value = ''
    const history = await listConversations(member.value)
    conversations.value = history.data || []
  } finally {
    asking.value = false
  }
}

// 用途：打开回答引用的原始 Markdown；参数：相对路径；返回值：无。
async function openSource(path) {
  const result = await getSource(member.value, path)
  sourcePath.value = path
  sourceText.value = result.data
  sourceVisible.value = true
}

// 用途：记录用户所选报告文件；参数：文件选择事件；返回值：无。
function fileChanged(event) {
  reportFile.value = event.target.files?.[0] || null
}

// 用途：上传报告并打开识别草稿；参数：无；返回值：无。
async function submitReport() {
  if (!member.value || !reportDate.value || !reportTitle.value.trim() || !reportFile.value || uploading.value) return
  const data = new FormData()
  data.append('member', member.value)
  data.append('date', reportDate.value)
  data.append('title', reportTitle.value.trim())
  data.append('file', reportFile.value)
  uploading.value = true
  try {
    const result = await uploadReport(data)
    drafts.value.unshift(result.data)
    editDraft(result.data)
    reportFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    reportTitle.value = ''
    ElMessage.success('报告草稿已生成，请核对')
  } finally {
    uploading.value = false
  }
}

// 用途：复制待确认报告供编辑；参数：草稿；返回值：无。
function editDraft(item) {
  draft.value = structuredClone(item)
  todoText.value = (draft.value.todos || []).join('\n')
  draftVisible.value = true
}

// 用途：从服务器取得草稿原件并显示预览；参数：无；返回值：无。
async function showOriginal() {
  clearOriginal()
  const blob = await getDraftOriginal(member.value, draft.value.id)
  originalUrl.value = URL.createObjectURL(blob)
  originalVisible.value = true
}

// 用途：释放报告预览使用的浏览器对象地址；参数：无；返回值：无。
function clearOriginal() {
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  originalUrl.value = ''
}

// 用途：在草稿中增加一条手工核对的指标；参数：无；返回值：无。
function addObservation() {
  draft.value.observations.push({ date: draft.value.date, name: '', value: '', unit: '', source: '', status: '已核对' })
}

// 用途：确认草稿并刷新报告与趋势；参数：无；返回值：无。
async function confirmDraft() {
  if (!draft.value || confirming.value) return
  await ElMessageBox.confirm('确认已对照原始报告核对文字和指标？', '确认归档', { type: 'warning' })
  confirming.value = true
  try {
    draft.value.todos = todoText.value.split('\n').map(item => item.trim()).filter(Boolean)
    await confirmReport(member.value, draft.value)
    draftVisible.value = false
    const [pending, data] = await Promise.all([listDrafts(member.value), listTrends(member.value)])
    drafts.value = pending.data || []
    trends.value = data.data || []
    metric.value = metricNames.value[0] || ''
    ElMessage.success('报告已归档')
  } finally {
    confirming.value = false
  }
}

// 用途：绘制选中指标的时间趋势；参数：无；返回值：无。
async function drawChart() {
  await nextTick()
  if (tab.value !== 'trends' || !chartEl.value || !filteredTrends.value.length) return
  if (chart && chart.getDom() !== chartEl.value) { chart.dispose(); chart = null }
  if (!chart) chart = echarts.init(chartEl.value)
  chart.setOption({
    grid: { left: 48, right: 20, top: 28, bottom: 48 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: filteredTrends.value.map(item => item.date), boundaryGap: false },
    yAxis: { type: 'value', name: filteredTrends.value[0].unit, scale: true },
    series: [{ type: 'line', smooth: false, symbolSize: 8, color: '#178b82',
      data: filteredTrends.value.map(item => Number(item.value)) }]
  }, true)
  chart.resize()
}

// 用途：在视口变化时重算图表尺寸；参数：无；返回值：无。
function resizeChart() {
  chart?.resize()
}

watch([tab, metric, trends], drawChart)
onMounted(() => { initialize(); window.addEventListener('resize', resizeChart) })
onBeforeUnmount(() => { window.removeEventListener('resize', resizeChart); chart?.dispose(); clearOriginal() })
</script>

<style scoped>
/* 页面采用适合持续查看资料的浅色工作台。 */
.health-page { min-height: calc(100vh - 68px); padding: 28px clamp(16px, 3vw, 48px) 56px; background: #f7f9f8; color: #22312f; }
/* 标题与成员选择保持一眼可见。 */
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 18px; max-width: 1280px; margin: 0 auto 26px; }
/* 小标签用冷色强调资料属性。 */
.eyebrow { margin: 0 0 5px; color: #0e827b; font-size: 11px; font-weight: 700; }
/* 页面标题保持工具页面的紧凑比例。 */
.page-header h1 { margin: 0; font-size: 28px; line-height: 1.25; }
/* 成员选择在手机上也保留稳定宽度。 */
.member-select { width: min(220px, 46vw); }
/* 视图切换与内容左边缘对齐。 */
.view-tabs { display: flex; gap: 22px; max-width: 1280px; margin: 0 auto; border-bottom: 1px solid #d9e2df; }
/* 页签保留固定点击区。 */
.view-tabs button { min-width: 62px; height: 44px; padding: 0 4px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #667571; font-size: 15px; cursor: pointer; }
/* 当前页签以清晰的底线表示。 */
.view-tabs button.active { border-bottom-color: #14877f; color: #155f5a; font-weight: 700; }
/* 工作区保持单层容器与适度行宽。 */
.work-section { max-width: 1280px; margin: 0 auto; padding-top: 22px; }
/* 标题区域适应右侧工具与计数。 */
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
/* 工作区标题避免占用过多高度。 */
.section-heading h2 { margin: 0; font-size: 19px; }
/* 次要统计信息采用低对比度文字。 */
.section-count { color: #65746f; font-size: 13px; }
/* 模型缺失时的操作提示与工作区留出间距。 */
.config-alert { margin-bottom: 16px; }
/* 模型和新对话按钮放在同一操作带。 */
.heading-actions { display: flex; align-items: center; gap: 10px; }
/* 模型菜单有稳定宽度。 */
.model-select { width: min(230px, 40vw); }
/* 对话区域在桌面分成历史和正文。 */
.conversation-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; min-height: 570px; }
/* 历史列表使用分隔线界定。 */
.conversation-list { display: flex; flex-direction: column; gap: 4px; padding-right: 16px; border-right: 1px solid #d9e2df; }
/* 历史行固定高度并省略长标题。 */
.conversation-list button { height: 38px; overflow: hidden; padding: 0 10px; border: 0; border-radius: 4px; background: transparent; color: #53615c; text-align: left; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
/* 当前会话突出显示。 */
.conversation-list button.selected { background: #e4f2ef; color: #075d57; font-weight: 600; }
/* 对话正文稳定承载消息和输入框。 */
.chat-column { display: flex; min-width: 0; flex-direction: column; border: 1px solid #d9e2df; border-radius: 6px; background: #fff; }
/* 消息列表保持滚动区域稳定。 */
.messages { flex: 1; min-height: 400px; max-height: 62vh; overflow: auto; padding: 20px 24px; }
/* 单条消息按角色显示留白。 */
.message { margin-bottom: 22px; }
/* 用户消息保持轻量的区分。 */
.message-user { padding-left: 18px; border-left: 3px solid #e7b15d; }
/* 助手消息突出资料回答。 */
.message-answer { padding-left: 18px; border-left: 3px solid #178b82; }
/* 角色标签采用小号字体。 */
.message-role { color: #59716b; font-size: 12px; font-weight: 700; }
/* 回答保留原始换行与长词换行。 */
.message p { margin: 8px 0; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
/* 来源链接可换行展示。 */
.sources { display: flex; flex-wrap: wrap; gap: 8px; }
/* 来源按钮保留清晰点击目标。 */
.sources button { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 5px 8px; border: 1px solid #d7e4e0; border-radius: 4px; background: #f7fbf9; color: #286e66; cursor: pointer; }
/* 来源文件名避免溢出按钮。 */
.sources span { overflow-wrap: anywhere; text-align: left; }
/* 输入区固定在对话正文末尾。 */
.ask-form { display: flex; align-items: end; gap: 12px; padding: 14px; border-top: 1px solid #e2e8e5; }
/* 文字输入框在窄屏中可收缩而不挤出提问按钮。 */
.ask-form .el-textarea { min-width: 0; }
/* 上传表单按可扫描的字段排列。 */
.upload-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 20px; max-width: 760px; padding-bottom: 28px; }
/* 表单标签保持输入控件间距。 */
.upload-form label, .draft-editor label { display: flex; flex-direction: column; gap: 7px; color: #50615b; font-size: 13px; font-weight: 600; }
/* 文件字段保留浏览器原生上传控件。 */
.file-field input { min-height: 34px; max-width: 100%; color: #33433f; }
/* 上传命令占一个独立网格单元。 */
.upload-form > .el-button { align-self: end; justify-self: start; }
/* 草稿列表与表单通过线条分区。 */
.drafts { max-width: 760px; padding-top: 18px; border-top: 1px solid #d9e2df; }
/* 草稿区标题保持紧凑。 */
.drafts h3, .draft-subheading h3 { margin: 0 0 14px; font-size: 16px; }
/* 草稿行整行可点击。 */
.draft-row { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 15px 0; border: 0; border-bottom: 1px solid #e2e8e5; background: transparent; color: #263b35; text-align: left; cursor: pointer; }
/* 草稿名称和日期保持垂直层级。 */
.draft-row span { display: flex; flex-direction: column; gap: 4px; }
/* 草稿日期采用次级色。 */
.draft-row small { color: #72807b; }
/* 趋势选择器保持合理宽度。 */
.metric-select { width: min(320px, 100%); }
/* 图表容器固定高度避免重绘跳动。 */
.trend-chart { width: 100%; height: 360px; margin-top: 20px; background: #fff; }
/* 指标历史采用横向对齐的列表。 */
.observation-list { margin-top: 22px; border-top: 1px solid #d9e2df; }
/* 历史行支持日期、数值和来源。 */
.observation-row { display: grid; grid-template-columns: 140px 160px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-bottom: 1px solid #e2e8e5; font-size: 13px; }
/* 来源使用次级文字色。 */
.observation-row span { color: #6c7a75; overflow-wrap: anywhere; }
/* 原文保留格式并在弹窗内滚动。 */
.source-text { max-height: 65vh; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
/* 草稿字段按阅读顺序纵向排列。 */
.draft-editor { display: flex; flex-direction: column; gap: 18px; max-height: 65vh; overflow-y: auto; padding-right: 8px; }
/* 核对提示与字段保持同一文字体系。 */
.draft-note { margin: 0; color: #7a5a26; font-size: 13px; }
/* 原件入口贴近核对提示。 */
.original-button { align-self: flex-start; }
/* PDF 原件在弹窗中保持可滚动高度。 */
.original-preview { width: 100%; height: 70vh; border: 0; }
/* 图片原件完整显示并限制弹窗高度。 */
.original-image { display: block; max-width: 100%; max-height: 70vh; margin: 0 auto; object-fit: contain; }
/* 指标标题与添加按钮对齐。 */
.draft-subheading { display: flex; align-items: center; justify-content: space-between; }
/* 指标编辑行在桌面保持四列。 */
.observation-edit { display: grid; grid-template-columns: 2fr 1fr 1fr 36px; gap: 8px; }
/* 手机端收起历史侧栏并压缩留白。 */
@media (max-width: 760px) {
  /* 手机页面使用较小边距。 */
  .health-page { padding: 18px 14px 36px; }
  /* 标题使用适合工具页的比例。 */
  .page-header h1 { font-size: 23px; }
  /* 对话栏单列展示。 */
  .conversation-layout { grid-template-columns: 1fr; gap: 8px; min-height: 0; }
  /* 历史会话横向滚动。 */
  .conversation-list { flex-direction: row; overflow-x: auto; padding: 0 0 8px; border-right: 0; }
  /* 横向历史行保留可点击宽度。 */
  .conversation-list button { min-width: 96px; max-width: 180px; flex: 0 0 auto; }
  /* 手机消息区留出阅读空间。 */
  .messages { min-height: 42vh; max-height: 58vh; padding: 16px; }
  /* 提问输入区压缩按钮宽度。 */
  .ask-form { gap: 8px; padding: 10px; }
  /* 上传字段改成单列。 */
  .upload-form { grid-template-columns: 1fr; }
  /* 指标行在手机上压缩为两列。 */
  .observation-row { grid-template-columns: 108px minmax(0, 1fr); }
  /* 来源在手机指标行占满下一行。 */
  .observation-row span { grid-column: 1 / -1; }
}
</style>
