import { constantRoutes } from '@/router'

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      /**
       * 初始化硬编码路由。
       *
       * @return 无返回值
       */
      initializeRoutes() {
        this.setRoutes([])
        this.setSidebarRouters(constantRoutes)
        this.setDefaultRoutes(constantRoutes)
        this.setTopbarRoutes(constantRoutes)
      }
    }
  })

export default usePermissionStore
