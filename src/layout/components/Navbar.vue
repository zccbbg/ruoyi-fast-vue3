<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>
      <div class="user-actions">
        <span class="right-menu-item user-name">
          <el-icon><User /></el-icon>
          {{ userStore.name }}
        </span>
        <span class="right-menu-item hover-effect logout-action" @click="logout">
          <el-icon><SwitchButton /></el-icon>
          退出
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = import.meta.env.VITE_APP_CONTEXT_PATH + 'index';
    })
  }).catch(() => { });
}
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #F8F9FD;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    /* 用户名称与退出操作采用横向常驻布局。 */
    .user-actions {
      margin-right: 40px;
      /* 用户名以紧凑图文形式展示。 */
      .user-name {
        font-size: 14px;
        /* 图标与用户名保持垂直居中。 */
        vertical-align: middle;
      }
      /* 退出操作使用与用户名一致的紧凑字号。 */
      .logout-action {
        font-size: 14px;
      }
    }
  }
}
</style>
