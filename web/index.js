import Vue from 'vue'
import VueRouter from 'vue-router'
import VCharts from 'v-charts'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import Index from './Index.vue'
import PackageSize from './pages/PackageSize.vue'

Vue.use(VueRouter)
Vue.use(Vuetify)
Vue.use(VCharts)

const routes = [
    { path: '/page/pkg-size', component: PackageSize },
]

const router = new VueRouter({
    routes
})

new Vue({
    el: '#app',
    router,
    vuetify: new Vuetify(),
    render: h => h(Index)
})