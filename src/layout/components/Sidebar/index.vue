<template>
  <div class="drawer-panel">
    <div class="drawer-heading">
      <router-link class="drawer-brand" to="/index" @click="closeDrawer">
        <img src="@/assets/logo/logo.png" alt="" width="28" height="28" />
        <span>ruoyi-fast</span>
      </router-link>
      <button class="drawer-close" type="button" aria-label="关闭导航菜单" @click="closeDrawer">
        <el-icon><Close /></el-icon>
      </button>
    </div>

    <el-scrollbar class="drawer-scroll">
      <nav aria-label="手机端主导航">
        <el-menu :default-active="activeMenu" :unique-opened="true" class="drawer-menu" @select="closeDrawer">
          <sidebar-item v-for="(item, index) in menuRoutes" :key="item.path + index" :item="item" :base-path="item.path" />
        </el-menu>
      </nav>

      <div class="drawer-account">
        <p class="drawer-section-title">个人中心</p>
        <p class="drawer-user">{{ userStore.name }}</p>
        <button class="drawer-logout" type="button" @click="$emit('logout')">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </button>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import SidebarItem from './SidebarItem.vue'
import useAppStore from '@/store/modules/app'
import usePermissionStore from '@/store/modules/permission'
import useUserStore from '@/store/modules/user'

defineEmits(['logout'])

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()
const menuRoutes = computed(() => permissionStore.sidebarRouters)
const activeMenu = computed(() => route.meta.activeMenu || route.path)

// 用途：选中页面或点击关闭按钮后收起抽屉；参数：无；返回值：无。
function closeDrawer() {
  appStore.closeSideBar({ withoutAnimation: false })
}
</script>
