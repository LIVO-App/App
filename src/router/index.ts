import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/learning_blocks' //Da sistemare: in base a role
  },
  {
    path: '/learning_blocks',
    component: () => import('../views/LearningBlocks.vue')
  },
  {
    path: '/learning_blocks/:id',
    component: () => import('../views/StudentCourses.vue')
  },
  {
    path: '/curriculum',
    component: () => import('../views/StudentCurriculum.vue')
  },
  {
    path: '/openbadges',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/citizenship_report',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/settings',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/info',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/project_courses',
    component: () => import('../views/ProjectCourses.vue')
  },
  {
    path: '/project_courses/:course/:block',
    component: () => import('../views/ProjectClass.vue')
  },
  {
    path: '/course_proposition',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/announcements/:course/:block',
    component: () => import('../views/AnnouncementsPage.vue')
  },
  {
    path: '/announcements',
    component: () => import('../views/GeneralAnnouncements.vue')
  },
  {
    path: '/ordinary_classes',
    component: () => import('../views/OrdinaryClasses.vue')
  },
  {
    path: '/ordinary_classes',
    component: () => import('../views/OrdinaryClasses.vue')
  },
  {
    path: '/students/:id',
    component: () => import('../views/StudentDescription.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
