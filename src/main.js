import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import index from './components/index.vue'
import favorite from './components/favorite.vue'
import me from './components/me.vue'
import List from './components/List.vue'
import Detail from './components/detail.vue'

Vue.use(MuseUI)
Vue.use(VueRouter)

const routes = [
  {path: '/', name: 'home', component: index, meta: {keepAlive: true}},
  {path: '/detail/:id', name: 'detail', component: Detail},
  {path: '/favorite', name: 'favorite', component: favorite},
  {path: '/me', name: 'me', component: me, meta: {keepAlive: true}}
]
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  } else {
    const position = {}
    if (to.hash) {
      position.selector = to.hash
    }
    if (to.matched.some(m => m.meta.scrollToTop)) {
      position.x = 0
      position.y = 0
    }
    return position
  }
}

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior
})

/* eslint-disable no-new */
new Vue({
  template: '<App/>',
  components: {App},
  router
}).$mount('#app')
