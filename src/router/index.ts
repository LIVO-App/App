import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/learning_blocks' //Sistemare in base a role
  },
  {
    path: '/learning_blocks',
    component: () => import ('../views/LearningBlocks.vue')
  },
  {
    path: '/curriculum',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/openbadges',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/citizenship_report',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/settings',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/info',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/project_courses',
    component: () => import ('../views/NotImplemented.vue')
  },
  {
    path: '/course_propose',
    component: () => import ('../views/NotImplemented.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
