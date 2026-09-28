<template>
  <main class="app-main" id="main-content">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>
</template>

<style lang="scss" scoped>
/* 正文为固定顶栏预留高度，并使用工作台的浅灰底色。 */
.app-main {
  min-height: 100vh;
  width: 100%;
  padding-top: 68px;
  background: #f3f3f3;
  overflow: hidden;
}
</style>
