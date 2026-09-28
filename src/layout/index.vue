<template>
  <div class="app-wrapper" :class="{ mobile: isMobile, 'drawer-open': isMobile && sidebar.opened }">
    <div v-if="isMobile && sidebar.opened" class="drawer-bg" @click="closeDrawer" />
    <sidebar class="sidebar-container" @logout="logout" />
    <div class="main-container">
      <div class="fixed-header">
        <navbar @logout="logout" />
      </div>
      <app-main />
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar } from './components'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()
const sidebar = computed(() => appStore.sidebar)
const isMobile = computed(() => appStore.device === 'mobile')
const { width } = useWindowSize()

// 用途：根据屏幕宽度切换桌面导航和手机抽屉；参数：无；返回值：无。
watchEffect(() => {
  const device = width.value < 992 ? 'mobile' : 'desktop'
  if (appStore.device !== device) {
    appStore.toggleDevice(device)
    appStore.closeSideBar({ withoutAnimation: true })
  }
})

// 用途：点击遮罩时收起手机导航；参数：无；返回值：无。
function closeDrawer() {
  appStore.closeSideBar({ withoutAnimation: false })
}

// 用途：确认后退出当前账号；参数：无；返回值：无。
function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = import.meta.env.VITE_APP_CONTEXT_PATH + 'index'
    })
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
/* 页面外壳占满视口并为固定顶部导航提供定位基准。 */
.app-wrapper {
  min-height: 100%;
  width: 100%;
  position: relative;
}

/* 主区域占满可用宽度，并清除旧侧栏布局可能留下的左边距。 */
.main-container {
  min-height: 100%;
  width: 100%;
  margin-left: 0;
}

/* 顶部导航固定并铺满整页，覆盖旧侧栏布局的宽度计算。 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  margin-left: 0;
  z-index: 10;
}

/* 手机抽屉展开时的遮罩覆盖正文和顶部导航。 */
.drawer-bg {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.42);
}
</style>
