import { constantRoutes } from '@/router'

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      sidebarRouters: []
    }),
    actions: {
      /**
       * 初始化硬编码路由。
       *
       * @return 无返回值
       */
      initializeRoutes() {
        this.routes = constantRoutes
        this.sidebarRouters = constantRoutes
      }
    }
  })

export default usePermissionStore
