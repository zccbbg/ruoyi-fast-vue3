<template>
  <div class="dashboard">
    <section class="welcome-card" aria-labelledby="welcome-title">
      <div class="welcome-heading">
        <h1 id="welcome-title">你好，{{ userStore.name || '用户' }}</h1>
        <span class="welcome-badge">工作台</span>
      </div>
      <p>欢迎使用 ruoyi-fast 管理系统。</p>
    </section>
  </div>
</template>

<script setup name="Index">
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
</script>

<style scoped lang="scss">
/* 工作台保留统一的页面留白。 */
.dashboard {
  min-height: calc(100vh - 68px);
  padding: 30px clamp(20px, 2.4vw, 48px) 48px;
  color: #111820;
}

/* 欢迎卡仅展示当前可用的账户信息。 */
.welcome-card {
  padding: 38px 40px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

/* 标题和工作台标记保持并排。 */
.welcome-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 欢迎标题保持清晰的视觉层级。 */
.welcome-heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

/* 工作台标记沿用导航的橙色强调。 */
.welcome-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #fff1e8;
  color: #ec6a20;
  font-size: 14px;
}

/* 欢迎说明使用易读的次级文字。 */
.welcome-card > p {
  margin: 12px 0 0;
  color: #59616b;
  font-size: 18px;
  line-height: 1.55;
}

/* 手机端缩小外边距与内边距。 */
@media (max-width: 767px) {
  /* 页面内容保留手机端安全留白。 */
  .dashboard {
    padding: 20px 16px 36px;
  }

  /* 欢迎卡适应较窄视口。 */
  .welcome-card {
    padding: 26px 22px;
  }

  /* 手机端标题使用较小字号。 */
  .welcome-heading h1 {
    font-size: 22px;
  }

  /* 说明文字保持手机端可读性。 */
  .welcome-card > p {
    font-size: 16px;
  }
}
</style>
