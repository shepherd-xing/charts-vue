import 'babel-polyfill'
import './css/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import Vue from 'vue'
import app from './app.vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import routerObj from './router.js'
import axios from 'axios'
Vue.prototype.$axios = axios
import Chart from 'chart.js'
window.Promise = Promise
import 'animate.css'
import store from './store.js'

const vm = new Vue({
    el: '#app',
    data: {
    },
    render: function(c){
        return c(app)
    },
    router: routerObj,
    store
})