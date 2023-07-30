import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { store } from "../store";
import { Menu } from '@/types';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/auth'
  },
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/learning_blocks',
    name: 'learning_blocks',
    component: () => import('../views/LearningBlocks.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/UserAuthentification.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('../views/TmpLogout.vue')
  },
  {
    path: '/learning_blocks/:id',
    name: 'learning_block',
    component: () => import('../views/StudentCourses.vue')
  },
  {
    path: '/curriculum',
    name: 'curriculum',
    component: () => import('../views/StudentCurriculum.vue')
  },
  {
    path: '/openbadges',
    name: 'openbadges',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/citizenship_report',
    name: 'citizenship_report',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/project_courses',
    name: 'project_courses',
    component: () => import('../views/ProjectCourses.vue')
  },
  {
    path: '/project_courses/:course/:block',
    name: 'project_course',
    component: () => import('../views/ProjectClass.vue')
  },
  {
    path: '/course_proposition',
    name: 'course_proposition',
    component: () => import('../views/NotImplemented.vue')
  },
  {
    path: '/announcements/:course/:block',
    name: 'announcement',
    component: () => import('../views/AnnouncementsPage.vue')
  },
  {
    path: '/announcements',
    name: 'announcements',
    component: () => import('../views/GeneralAnnouncements.vue')
  },
  {
    path: '/ordinary_classes',
    name: 'ordinary_classes',
    component: () => import('../views/OrdinaryClasses.vue')
  },
  {
    path: '/students/:id',
    name: 'student',
    component: () => import('../views/StudentDescription.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  if (
    store.state.user == undefined &&
    to.name !== 'auth'
  ) {
    // redirect the user to the login page
    return { name: 'auth' }
  } else if (to.name !== 'auth' && to.name !== 'logout' && (store.state.menu as Menu)[store.state.user.user].findIndex(
    (page) => page.url === to.path
  ) == -1 || to.name === 'auth' && store.state.user != undefined) {
    return false;
  }
})

export default router
