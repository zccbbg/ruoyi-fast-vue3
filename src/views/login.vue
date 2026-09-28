<template>
  <div class="login-page">
    <header class="login-header">
      <div class="brand">
        <img class="brand-mark" src="@/assets/logo/logo.png" alt="" />
        <span class="brand-name">ruoyi-fast后台管理系统</span>
      </div>
      <span class="header-note">安全登录</span>
    </header>

    <main class="login-main">
      <div class="login-card">
        <div class="card-heading">
          <h1>欢迎回来</h1>
          <p>高效管理，从这里开始。</p>
        </div>

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <div class="form-group">
            <label class="form-label" for="login-username">账号</label>
            <el-form-item prop="username">
              <el-input
                id="login-username"
                v-model="loginForm.username"
                type="text"
                size="large"
                autocomplete="username"
                placeholder="请输入您的账号"
                class="login-input"
              >
                <template #prefix><svg-icon icon-class="user" class="input-icon" /></template>
              </el-input>
            </el-form-item>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">密码</label>
            <el-form-item prop="password">
              <el-input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                size="large"
                autocomplete="current-password"
                placeholder="请输入密码"
                show-password
                class="login-input"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="password" class="input-icon" /></template>
              </el-input>
            </el-form-item>
          </div>

          <div class="action-row">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          </div>

          <el-form-item class="submit-item">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="submit-button"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登录系统 &rarr;</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </main>

    <footer class="login-footer">
      <span>© 2026 ruoyi-fast后台管理系统</span>
      <span>高效、可靠的后台管理体验</span>
    </footer>
  </div>
</template>

<script setup>
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }]
};

const loading = ref(false);

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const redirect = route.query.redirect;
        router.push({
          path: typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
            ? redirect
            : "/"
        });
      }).catch(() => {
        loading.value = false;
      });
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCookie();
</script>

<style lang="scss" scoped>
/* 登录页采用浅色背景与纵向布局。 */
.login-page {
  --login-blue: #003eb3;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  background-image:
    radial-gradient(circle at 10% 80%, rgba(200, 215, 240, 0.4), transparent 40%),
    radial-gradient(circle at 90% 20%, rgba(240, 245, 255, 0.8), transparent 40%);
  color: #1a2b4c;
}

/* 顶部品牌栏沿用当前系统名称。 */
.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 50px;
}

/* 品牌标识与名称保持横向对齐。 */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 登录页使用参考系统的品牌图标。 */
.brand-mark {
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  object-fit: contain;
}

/* 顶部系统名称使用醒目的品牌字重。 */
.brand-name {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* 右侧短文案平衡页面布局。 */
.header-note {
  color: #64748b;
  font-size: 14px;
}

/* 主区域让登录卡片在可用空间内居中。 */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 24px 56px;
}

/* 登录卡片沿用参考页面的尺寸、圆角与轻阴影。 */
.login-card {
  width: min(100%, 440px);
  padding: 48px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 48px rgba(26, 43, 76, 0.07);
}

/* 标题区域与表单保持足够间距。 */
.card-heading {
  margin-bottom: 38px;
  text-align: center;
}

/* 主标题突出欢迎信息。 */
.card-heading h1 {
  margin: 0 0 10px;
  color: #172033;
  font-size: 28px;
  font-weight: 650;
}

/* 副标题提供轻量说明。 */
.card-heading p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* 每组字段保持一致的间距。 */
.form-group {
  margin-bottom: 24px;
}

/* 字段标签对应输入框。 */
.form-label {
  display: block;
  margin-bottom: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

/* 清除组件默认间距，交由字段分组控制。 */
.form-group :deep(.el-form-item) {
  margin-bottom: 0;
}

/* 输入框使用参考页面的浅灰底色。 */
:deep(.login-input .el-input__wrapper) {
  padding: 1px 14px;
  border-radius: 8px;
  background: #f3f5f8;
  box-shadow: none;
}

/* 悬停和聚焦时显示蓝色边界。 */
:deep(.login-input .el-input__wrapper:hover),
:deep(.login-input .el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px var(--login-blue) inset;
}

/* 输入内容保持足够的点击高度。 */
:deep(.login-input .el-input__inner) {
  height: 48px;
  color: #263449;
  font-size: 15px;
}

/* 输入图标与文字保持合适间距。 */
:deep(.input-icon) {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: #8c98a4;
}

/* 记住密码区域与提交按钮分隔。 */
.action-row {
  display: flex;
  align-items: center;
  margin: 2px 0 28px;
}

/* 复选框文字保持轻量。 */
.action-row :deep(.el-checkbox__label) {
  color: #64748b;
}

/* 提交区域不保留组件默认外边距。 */
.submit-item {
  margin-bottom: 0;
}

/* 主按钮占满卡片宽度并强调登录操作。 */
.submit-button {
  width: 100%;
  height: 52px;
  border-color: var(--login-blue);
  border-radius: 8px;
  background: var(--login-blue);
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
}

/* 按钮交互使用深蓝反馈。 */
.submit-button:hover,
.submit-button:focus {
  border-color: #002c80;
  background: #002c80;
  transform: translateY(-1px);
}

/* 页脚以弱对比文案收束页面。 */
.login-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 50px;
  color: #8490a2;
  font-size: 13px;
}

/* 窄屏时压缩页边距并适配卡片宽度。 */
@media (max-width: 640px) {
  /* 移动端品牌栏保留舒适侧边距。 */
  .login-header {
    padding: 24px;
  }

  /* 移动端缩小品牌文字避免溢出。 */
  .brand-name {
    font-size: 16px;
  }

  /* 窄屏隐藏装饰文案以保证品牌可读。 */
  .header-note {
    display: none;
  }

  /* 移动端主区域保留卡片四周空白。 */
  .login-main {
    padding: 20px 20px 44px;
  }

  /* 移动端收紧卡片内部空间。 */
  .login-card {
    padding: 38px 28px;
  }

  /* 移动端页脚改为居中堆叠。 */
  .login-footer {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 20px 16px;
    text-align: center;
  }
}
</style>
