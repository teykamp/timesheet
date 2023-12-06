import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TimesheetView from '../views/TimesheetView.vue'
import ExpenseView from '../views/ExpenseView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/timesheet',
      name: 'timesheet',
      component: TimesheetView
    },
    {
      path: '/expense',
      name: 'timesheet',
      component: HomeView
    },
    {
      path: '/admin',
      name: 'admin',
      component: HomeView
    },
  ]
})

export default router
