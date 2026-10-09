<template>
  <header class="navbar">
    <button v-if="isMobile" class="menu-toggle" type="button" aria-label="打开导航菜单" :aria-expanded="appStore.sidebar.opened" @click="toggleDrawer">
      <el-icon><Expand /></el-icon>
    </button>

    <router-link class="brand" to="/health/workspace" aria-label="返回健康资料">
      <img src="@/assets/logo/logo.png" alt="" width="30" height="30" />
      <span>健康资料</span>
    </router-link>

    <nav v-if="!isMobile" class="desktop-nav" aria-label="主导航">
      <el-menu :default-active="activeMenu" mode="horizontal" :ellipsis="false" class="top-menu">
        <sidebar-item v-for="(item, index) in menuRoutes" :key="item.path + index" :item="item" :base-path="item.path" />
      </el-menu>
    </nav>

    <div class="account-menu">
      <span class="account-user">
        <el-icon><User /></el-icon>
        <span class="account-name">{{ userStore.name }}</span>
      </span>
      <button class="logout-button" type="button" @click="$emit('logout')">
        <el-icon><SwitchButton /></el-icon>
        <span>退出</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import SidebarItem from './Sidebar/SidebarItem.vue'
import useAppStore from '@/store/modules/app'
import usePermissionStore from '@/store/modules/permission'
import useUserStore from '@/store/modules/user'

defineEmits(['logout'])

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const isMobile = computed(() => appStore.device === 'mobile')
const menuRoutes = computed(() => permissionStore.sidebarRouters)
const activeMenu = computed(() => route.meta.activeMenu || route.path)

// 用途：切换手机端导航抽屉；参数：无；返回值：无。
function toggleDrawer() {
  appStore.toggleSideBar(false)
}
</script>

<style lang="scss" scoped>
/* 桌面顶栏从左到右排列品牌、导航和账户。 */
.navbar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 68px;
  padding: 0 clamp(24px, 2.4vw, 48px);
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

/* 品牌入口固定在左侧起点并保持图文紧凑。 */
.brand {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: 10px;
  color: #121820;
  font-size: 19px;
  font-weight: 700;
  white-space: nowrap;
}

/* 路由菜单紧随品牌标题排列。 */
.desktop-nav {
  margin-left: 24px;
  width: max-content;
  overflow: visible;
}

/* 水平菜单与顶栏背景融为一体。 */
.top-menu {
  display: flex;
  align-items: center;
  height: 67px;
  border-bottom: 0;
  background: transparent;
}

/* 一级菜单保持纯文字导航的紧凑间距。 */
.top-menu :deep(.el-menu-item),
.top-menu :deep(.el-sub-menu__title) {
  height: 42px;
  margin: 0 2px;
  padding: 0 14px;
  border: 0 !important;
  border-radius: 6px;
  color: #626870;
  font-size: 15px;
}

/* 下拉箭头与菜单文字留出清晰间距。 */
.top-menu :deep(.el-sub-menu__title) {
  padding-right: 34px;
}

/* 下拉箭头贴近一级菜单文字右侧。 */
.top-menu :deep(.el-sub-menu__icon-arrow) {
  right: 14px;
}

/* 当前页面仅以橙色文字标识。 */
.top-menu :deep(.is-active > .el-sub-menu__title),
.top-menu :deep(.el-menu-item.is-active) {
  background: transparent;
  color: #f26b21;
}

/* 鼠标悬停和展开下拉时显示浅橙色反馈。 */
.top-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title),
.top-menu :deep(.el-menu-item:hover),
.top-menu :deep(.el-sub-menu__title:hover) {
  background: #fff1e8;
  color: #f26b21;
}

/* 用户名和退出按钮直接并列且贴齐右侧。 */
.account-menu {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: auto;
}

/* 用户名作为常显信息展示。 */
.account-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4c535b;
  white-space: nowrap;
}

/* 退出和菜单按钮提供完整的触控区域。 */
.logout-button,
.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4c535b;
  font: inherit;
  cursor: pointer;
}

/* 键盘操作时突出显示当前按钮。 */
.logout-button:focus-visible,
.menu-toggle:focus-visible {
  outline: 2px solid #f26b21;
  outline-offset: 2px;
}

/* 手机端入口默认不占用桌面导航空间。 */
.menu-toggle {
  display: none;
}

/* 窄屏导航采用菜单按钮、品牌和账户操作的紧凑排列。 */
@media (max-width: 991px) {
  /* 手机上收紧顶栏间距。 */
  .navbar {
    gap: 8px;
    padding: 0 16px;
  }

  /* 手机菜单按钮使用截图中的描边方形外观。 */
  .menu-toggle {
    display: inline-flex;
    flex: none;
    width: 44px;
    border: 1px solid #dedede;
  }

  /* 手机上缩小品牌字重与图标间距。 */
  .brand {
    gap: 6px;
    font-size: 17px;
  }

  /* 账户操作靠右并缩短用户名与退出按钮的间距。 */
  .account-menu {
    gap: 4px;
    margin-left: auto;
  }

  /* 账户名称过长时截断，保证退出按钮始终可见。 */
  .account-name {
    display: inline-block;
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 极窄手机上为品牌和用户名释放空间。 */
@media (max-width: 380px) {
  /* 缩短顶栏左右留白。 */
  .navbar {
    padding: 0 10px;
  }

  /* 极窄手机隐藏品牌文字，为用户名和退出按钮腾出空间。 */
  .brand span {
    display: none;
  }
}
</style>
