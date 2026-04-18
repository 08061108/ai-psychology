import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user' // 引入用户仓库
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: '数据分析', icon: 'PieChart', requiresAuth: true, role: 2 }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: { title: '知识文章', icon: 'ChatLineSquare', requiresAuth: true, role: 2 }
      },
      {
        path: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: { title: '咨询记录', icon: 'Message', requiresAuth: true, role: 2 }
      },
      {
        path: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: { title: '情绪日志', icon: 'User', requiresAuth: true, role: 2 }
      }
    ]
  }
]

const frontendRoutes = [
  {
    path: '/',
    component: FrontendLayout,
    children: [
      { path: '', component: () => import('@/views/home.vue') },
      { path: 'home', component: () => import('@/views/home.vue') },
      { path: 'consultation', component: () => import('@/views/consultation.vue') },
      { path: 'emotion-diary', component: () => import('@/views/emotionDiary.vue') },
      { path: 'knowledge', component: () => import('@/views/frontendKnowledge.vue') },
      { path: 'knowledge/article/:id', component: () => import('@/views/articleDetail.vue'), props: true }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: () => import('@/views/login.vue'), meta: { title: '登录' } },
      { path: 'register', component: () => import('@/views/register.vue'), meta: { title: '注册' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})

/**
 * 核心权限守卫
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore() // 获取 Pinia 中的用户信息
  const isLogin = userStore.isLogin()
  const userType = userStore.userType()

  // 1. 如果访问的是后台页面 (/back)
  if (to.path.startsWith('/back')) {
    if (!isLogin) {
      // 未登录 -> 去登录页
      return next('/auth/login')
    }
    if (userType !== 2) {
      // 登录了但不是管理员 -> 踢回前台首页
      return next('/')
    }
    // 是管理员 -> 放行
    return next()
  }

  // 2. 如果访问的是登录/注册页，且已经登录了
  if (to.path.startsWith('/auth') && isLogin) {
    // 管理员去后台，普通用户去前台
    return next(userType === 2 ? '/back/dashboard' : '/')
  }

  // 3. 其他页面（前台页面）直接放行
  next()
})

export default router