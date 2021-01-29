import Vue from 'vue'
import VueRouter from 'vue-router'
import VCharts from 'v-charts'
import Index from './Index.vue'
import PkgSize from './pages/PkgSize.vue'
import PageAna from './pages/PageAna.vue'
import MainAna from './pages/MainAna.vue'

Vue.use(VueRouter)
Vue.use(VCharts)


const router = new VueRouter({
    routes: [
        { path: '/page/pkg-size', component: PkgSize },
        { path: '/page/page-ana', component: PageAna },
        { path: '/page/main-ana', component: MainAna },
    ],
})

new Vue({
    el: '#app',
    router,
    render: h => h(Index)
})