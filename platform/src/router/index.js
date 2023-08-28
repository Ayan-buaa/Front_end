import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login&register',
    name: 'login&register',
    component: () => import('../views/Login&RegisterView.vue')
  },
  {
    path: '/teamMember',
    name: 'teamMember',
    component: () => import('../views/TeamMemberView.vue')
  },
  {
    path: '/teamManage',
    name: 'teamManage',
    component: () => import('../views/TeamManageView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue')
  },
  {
    path: '/message',
    name: 'message',
    component: () => import('../views/MessageView.vue')
  },
  {
    path: '/itemManage',
    name: 'itemManage',
    component: () => import('../views/ItemManageView.vue')
  },
  {
    path: '/itemDesign',
    name: 'itemDesign',
    component: () => import('../views/ItemDesignView.vue')
  },
  {
    path: 'documentEditing',
    name: 'documentEditing',
    component: () => import('../views/DocumentEditingView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
