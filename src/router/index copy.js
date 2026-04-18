import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

// 路由配置
const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',  // 默认重定向到数据分析页面
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { // 数据分析页面元数据 包含页面标题和图标
          title: '数据分析',
          icon: 'PieChart',
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        }
      },
      {
        path: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',
        }
      }
    ]
  },
  {
    path: '/auth',
    redirect: '/auth/login',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
          title: '登录'
        }
      },
      {
        path: 'register',
        component: () => import('@/views/register.vue'),
        meta: {
          title: '注册'
        }
      }
    ]
  }
]

const frontendRoutes = [
  {
    path: '/',
    component: FrontendLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/home.vue'),
      },
      {
        path: 'home',
        component: () => import('@/views/home.vue'),
      },
      {
        path: 'consultation',
        component: () => import('@/views/consultation.vue')
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/emotionDiary.vue')
      },
      {
        path: 'knowledge',
        component: () => import('@/views/frontendKnowledge.vue')
      },
      {
        path: 'knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
        props: true    // 传递路由参数到组件
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo.userType === 2) {
      // 如果用户的是管理员 那么跳转到后端首页
      if (to.path.startsWith('/back')) {
        next()
      } else {
        // 如果访问的是乱码 那么自动跳转到后端首页
        next('/back/dashboard')
      }
    } else if (userInfo.userType === 1) {
      // 如果用户的是普通用户 那么跳转到前端首页
      if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
        next('/')
      } else {
        next()
      }
    }
  } else {
    if (to.path.startsWith('/back')) {
      // 如果访问的是后端页面 那么跳转到登录页
      next('/auth/login')
    } else {
      // 如果访问的是前端页面
      next()
    }
  }
})

export default router