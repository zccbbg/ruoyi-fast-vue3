<template>
  <header class="navbar">
    <button v-if="isMobile" class="menu-toggle" type="button" aria-label="打开导航菜单" :aria-expanded="appStore.sidebar.opened" @click="toggleDrawer">
      <el-icon><Expand /></el-icon>
    </button>

    <router-link class="brand" to="/index" aria-label="返回首页">
      <img src="@/assets/logo/logo.png" alt="" width="30" height="30" />
      <span>ruoyi-fast</span>
    </router-link>

    <nav v-if="!isMobile" class="desktop-nav" aria-label="主导航">
      <el-menu :default-active="activeMenu" mode="horizontal" class="top-menu">
        <sidebar-item v-for="(item, index) in menuRoutes" :key="item.path + index" :item="item" :base-path="item.path" />
      </el-menu>
    </nav>

    <el-dropdown class="account-menu" trigger="click" @command="$emit('logout')">
      <button class="account-trigger" type="button" aria-label="账户菜单">
        <el-icon><User /></el-icon>
        <span class="account-name">{{ userStore.name }}</span>
        <el-icon><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
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
/* 顶栏采用参考图的浅色背景与水平排列。 */
.navbar {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 68px;
  padding: 0 32px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

/* 品牌入口保持图文紧凑排列。 */
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

/* 路由菜单占据品牌和账户之间的空间。 */
.desktop-nav {
  flex: 1;
  min-width: 0;
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

/* 一级菜单使用截图中的浅橙色选中态。 */
.top-menu :deep(.el-menu-item),
.top-menu :deep(.el-sub-menu__title) {
  height: 42px;
  margin: 0 3px;
  padding: 0 15px;
  border: 0 !important;
  border-radius: 10px;
  color: #626870;
  font-size: 15px;
}

/* 菜单图标与文字保持一致的间距。 */
.top-menu :deep(.svg-icon) {
  margin-right: 7px;
  font-size: 18px;
}

/* 当前页面和悬停菜单展示品牌强调色。 */
.top-menu :deep(.is-active > .el-sub-menu__title),
.top-menu :deep(.el-menu-item.is-active),
.top-menu :deep(.el-menu-item:hover),
.top-menu :deep(.el-sub-menu__title:hover) {
  background: #fff1e8;
  color: #f26b21;
}

/* 账户操作始终靠右。 */
.account-menu {
  flex: none;
  margin-left: auto;
}

/* 账户按钮提供完整的触控区域和清晰的焦点状态。 */
.account-trigger,
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

/* 键盘操作时突出显示当前控件。 */
.account-trigger:focus-visible,
.menu-toggle:focus-visible {
  outline: 2px solid #f26b21;
  outline-offset: 2px;
}

/* 手机端入口默认不占用桌面导航空间。 */
.menu-toggle {
  display: none;
}

/* 窄屏导航采用菜单按钮、品牌和用户入口三段式布局。 */
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

  /* 账户名称过长时截断，保证菜单按钮始终可见。 */
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

  /* 隐藏账户文字但保留可访问的账户按钮。 */
  .account-name {
    display: none;
  }
}
</style>
