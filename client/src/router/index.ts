import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TimesheetView from '../views/TimesheetView.vue'
import ExpenseView from '../views/ExpenseView.vue'
import AdminView from '../views/AdminView.vue'

import { useHandleTimesheetDisplay } from '../stores/useDataStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/timesheets',
      name: 'timesheets',
      component: TimesheetView
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpenseView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
  ]
})

router.beforeEach((to, from, next) => {
  const { resetTimesheetDisplay } = useHandleTimesheetDisplay()
  resetTimesheetDisplay()
  next()
})

export default router
