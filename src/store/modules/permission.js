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
      generateRoutes() {
        return new Promise(resolve => {
          this.setRoutes([])
          this.setSidebarRouters(constantRoutes)
          this.setDefaultRoutes(constantRoutes)
          this.setTopbarRoutes(constantRoutes)
          resolve([])
        })
      }
    }
  })

export default usePermissionStore
