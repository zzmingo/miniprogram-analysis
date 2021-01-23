import Vue from 'vue'
import VueRouter from 'vue-router'
import VCharts from 'v-charts'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import Index from './Index.vue'
import PkgSize from './pages/PkgSize.vue'
import DepsAna from './pages/DepsAna.vue'

Vue.use(VueRouter)
Vue.use(Vuetify)
Vue.use(VCharts)


const router = new VueRouter({
    routes: [
        { path: '/page/pkg-size', component: PkgSize },
        { path: '/page/deps-ana', component: DepsAna }
    ],
})

new Vue({
    el: '#app',
    router,
    vuetify: new Vuetify(),
    render: h => h(Index)
})