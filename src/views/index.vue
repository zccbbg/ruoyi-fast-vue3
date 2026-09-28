<template>
  <div class="dashboard">
    <section class="welcome-card" aria-labelledby="welcome-title">
      <div class="welcome-heading">
        <h1 id="welcome-title">你好，{{ userStore.name || '用户' }}</h1>
        <span class="welcome-badge">工作台</span>
      </div>
      <p>在这里管理你的智能体，并为它们创建与跟进任务。</p>
      <div class="welcome-actions">
        <button class="action-button action-secondary" type="button" disabled title="智能体功能尚未接入">
          <svg-icon icon-class="skill" />
          浏览智能体
        </button>
        <button class="action-button action-primary" type="button" disabled title="任务功能尚未接入">
          <el-icon><Plus /></el-icon>
          创建任务
        </button>
      </div>
    </section>

    <section class="overview-grid" aria-label="工作台概览">
      <article v-for="item in overviewCards" :key="item.title" class="overview-card">
        <span class="overview-icon" :class="item.tone"><svg-icon :icon-class="item.icon" /></span>
        <div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.value }}</p>
        </div>
      </article>
    </section>

    <section class="usage-section" aria-labelledby="usage-title">
      <div class="section-heading">
        <h2 id="usage-title">用量概览</h2>
        <span class="data-hint">暂无用量数据</span>
      </div>

      <div class="usage-grid">
        <article v-for="item in usageCards" :key="item.title" class="usage-card" :class="item.tone">
          <h3>{{ item.title }}</h3>
          <strong>{{ item.value }}</strong>
          <p v-if="item.detail">{{ item.detail }}</p>
        </article>
      </div>

      <h3 class="trend-heading">用量趋势（近 7 日）</h3>
      <div class="trend-grid">
        <article v-for="item in trendCards" :key="item" class="trend-card">
          <h4>{{ item }}</h4>
          <div class="trend-empty" role="img" :aria-label="`${item}近 7 日暂无数据`">
            <span>暂无数据</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup name="Index">
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const overviewCards = [
  { title: '智能体', value: '0 个', icon: 'skill', tone: 'orange' },
  { title: '全部任务', value: '0 个', icon: 'form', tone: 'orange' },
  { title: '进行中', value: '0 个', icon: 'online', tone: 'green' },
  { title: '积分余额', value: '0', icon: 'money', tone: 'orange' }
]
const usageCards = [
  { title: '期间调用', value: '0', detail: '成功 0 · 失败 0' },
  { title: '期间 Token', value: '0' },
  { title: '缓存命中 Token', value: '0', tone: 'highlight' },
  { title: '期间消耗积分', value: '0' },
  { title: '平均延迟', value: '--' },
  { title: '今日调用', value: '0' }
]
const trendCards = ['调用次数', '消耗积分', 'Token 用量']
</script>

<style scoped lang="scss">
/* 工作台使用参考图中的浅灰背景和宽屏留白。 */
.dashboard {
  min-height: calc(100vh - 68px);
  padding: 30px clamp(20px, 2.4vw, 48px) 48px;
  color: #111820;
}

/* 欢迎区为首页建立清晰的第一层级。 */
.welcome-card,
.overview-card,
.usage-section,
.usage-card,
.trend-card {
  border: 1px solid #dddddd;
  border-radius: 10px;
  background: #fff;
}

/* 欢迎卡保留宽松的上下空间。 */
.welcome-card {
  padding: 38px 40px;
}

/* 欢迎标题和工作台标记并排显示。 */
.welcome-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 欢迎标题采用稳重的深色粗体。 */
.welcome-heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

/* 工作台标记呼应参考图中的橙色品牌强调。 */
.welcome-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #fff1e8;
  color: #ec6a20;
  font-size: 14px;
}

/* 欢迎说明保持适中的行长与清晰的文字对比。 */
.welcome-card > p {
  margin: 12px 0 24px;
  color: #59616b;
  font-size: 18px;
  line-height: 1.55;
}

/* 快捷操作在窄屏下可自然换行。 */
.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

/* 尚未接入的业务入口以禁用状态展示，避免产生无效跳转。 */
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid #d8d8d8;
  border-radius: 7px;
  font: inherit;
  font-size: 16px;
  opacity: 0.7;
  cursor: not-allowed;
}

/* 次要入口使用白底描边。 */
.action-secondary {
  background: #fff;
  color: #202934;
}

/* 主要入口使用深色填充以保留截图层级。 */
.action-primary {
  border-color: #344256;
  background: #344256;
  color: #fff;
}

/* 四项概览在桌面端等宽排列。 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: 40px 0;
}

/* 概览卡中的图标与数据横向对齐。 */
.overview-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 100px;
  padding: 20px 24px;
}

/* 图标底块提供统一尺寸。 */
.overview-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 50px;
  height: 50px;
  border-radius: 9px;
  font-size: 23px;
}

/* 智能体、任务和积分使用橙色强调。 */
.overview-icon.orange {
  background: #fff0e6;
  color: #f26b21;
}

/* 进行中状态使用绿色强调。 */
.overview-icon.green {
  background: #e7f6ed;
  color: #1fa95a;
}

/* 概览名称比数值略重，匹配截图中的信息层级。 */
.overview-card h2 {
  margin: 0 0 3px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
}

/* 概览数值采用柔和的次级文字。 */
.overview-card p {
  margin: 0;
  color: #66717e;
  font-size: 14px;
}

/* 用量区域作为整块白色面板。 */
.usage-section {
  padding: 36px 40px 40px;
}

/* 用量标题与数据状态分列显示。 */
.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

/* 主标题强调工作台的数据区域。 */
.section-heading h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

/* 未接入数据的提示避免把占位数字误认为实时统计。 */
.data-hint {
  color: #6d7480;
  font-size: 14px;
}

/* 六项用量指标在大屏幕中保持等宽。 */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
}

/* 指标卡片保留数值与附注空间。 */
.usage-card {
  min-height: 130px;
  padding: 20px;
}

/* 缓存指标使用浅蓝色区别于常规指标。 */
.usage-card.highlight {
  border-color: #bfd8ff;
  background: #f4f8ff;
}

/* 指标标签采用次级灰色。 */
.usage-card h3 {
  margin: 0 0 12px;
  color: #66717e;
  font-size: 14px;
  font-weight: 400;
}

/* 大数字使用等宽数字以方便比较。 */
.usage-card strong {
  display: block;
  font-size: 28px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

/* 蓝色指标的数值使用同色强调。 */
.usage-card.highlight strong,
.usage-card.highlight h3 {
  color: #367bfa;
}

/* 成功和失败附注与主数值保持紧凑。 */
.usage-card p {
  margin: 8px 0 0;
  color: #697482;
  font-size: 13px;
}

/* 趋势区域与上方指标留出清晰间隔。 */
.trend-heading {
  margin: 24px 0 14px;
  font-size: 17px;
  font-weight: 600;
}

/* 三个趋势卡在桌面端并列展示。 */
.trend-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

/* 图表容器采用与指标相同的卡片边框。 */
.trend-card {
  min-width: 0;
  padding: 18px 20px;
}

/* 趋势标题采用轻量辅助文字。 */
.trend-card h4 {
  margin: 0 0 18px;
  color: #66717e;
  font-size: 14px;
  font-weight: 400;
}

/* 空数据图保留网格线的视觉节奏，同时明确标出暂无数据。 */
.trend-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 210px;
  border-bottom: 1px solid #cfd3d8;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 41px, #e8eaed 42px);
  color: #8a929b;
  font-size: 14px;
}

/* 中等屏幕调整指标列数，避免卡片被压窄。 */
@media (max-width: 1280px) {
  /* 概览卡保持两列的可读宽度。 */
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* 用量指标每行展示三项。 */
  .usage-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* 手机端将指标和图表改为单列。 */
@media (max-width: 767px) {
  /* 缩小页面边距并保留内容间距。 */
  .dashboard {
    padding: 20px 16px 36px;
  }

  /* 欢迎卡适应较窄的手机视口。 */
  .welcome-card {
    padding: 26px 22px;
  }

  /* 手机端标题保持明确层级。 */
  .welcome-heading h1 {
    font-size: 22px;
  }

  /* 说明文字在手机端自动换行。 */
  .welcome-card > p {
    font-size: 16px;
  }

  /* 四项概览按截图中的两列排列。 */
  .overview-grid {
    gap: 12px;
    margin: 22px 0 32px;
  }

  /* 手机端卡片收紧内边距。 */
  .overview-card {
    gap: 12px;
    min-height: 92px;
    padding: 14px;
  }

  /* 手机端图标底块按卡片宽度缩小。 */
  .overview-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  /* 手机端名称允许换行而不截断。 */
  .overview-card h2 {
    font-size: 15px;
  }

  /* 用量大面板留出舒适的手机边距。 */
  .usage-section {
    padding: 26px 20px;
  }

  /* 用量指标与趋势图按手机阅读顺序纵向排列。 */
  .usage-grid,
  .trend-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* 手机端缩短指标卡高度。 */
  .usage-card {
    min-height: 114px;
  }
}

/* 更窄屏幕继续保证概览卡文字有空间。 */
@media (max-width: 400px) {
  /* 概览卡图标和内容使用紧凑间距。 */
  .overview-card {
    gap: 8px;
    padding: 10px;
  }

  /* 窄屏图标缩小但保留辨识度。 */
  .overview-icon {
    width: 38px;
    height: 38px;
  }
}
</style>
