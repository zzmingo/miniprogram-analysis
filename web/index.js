import Vue from 'vue'
import VueRouter from 'vue-router'
import VCharts from 'v-charts'
import Index from './Index.vue'
import PkgSize from './pages/PkgSize.vue'
// import DepsAna from './pages/DepsAna.vue'
import PageAna from './pages/PageAna.vue'

Vue.use(VueRouter)
Vue.use(VCharts)


const router = new VueRouter({
    routes: [
        { path: '/page/pkg-size', component: PkgSize },
        // { path: '/page/deps-ana', component: DepsAna },
        { path: '/page/page-ana', component: PageAna }
    ],
})

new Vue({
    el: '#app',
    router,
    render: h => h(Index)
})