import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'

const routes = [
  { path: '/',         name: 'Landing',  component: LandingPage },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginModal.vue')
      }
    ]
  },
  { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue') },

  { path: '/dashboard/inversor',    name: 'DashboardInversor',    component: () => import('@/views/dashboards/InversorView.vue'),    meta: { requiresAuth: true, rol: 'inversionista' } },
  { path: '/dashboard/propietario', name: 'DashboardPropietario', component: () => import('@/views/dashboards/PropietarioView.vue'), meta: { requiresAuth: true, rol: 'propietario'   } },
  { path: '/dashboard/zootecnista', name: 'DashboardZootecnista', component: () => import('@/views/dashboards/ZootecnistaView.vue'), meta: { requiresAuth: true, rol: 'zootecnista'   } },
  { path: '/dashboard/admin',       name: 'DashboardAdmin',       component: () => import('@/views/dashboards/AdminView.vue'),       meta: { requiresAuth: true, rol: 'administrador' } },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, _from) => {
  if (!to.meta.requiresAuth) return true

  const { useAuthStore } = await import('@/stores/auth.store')
  const auth = useAuthStore()

  if (!auth.estaAutenticado) return '/login'
  if (to.meta.rol && auth.rol !== to.meta.rol) return '/home'

  return true
})

export default router