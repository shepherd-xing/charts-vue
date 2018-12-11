import VueRouter from 'vue-router'
import coin_list from './com/coin_list.vue'
import coin_detail from './com/coin_detail.vue'
import ex_list from './com/ex_list.vue'
import ex_info from './com/ex_info.vue'
import compare from './com/compare.vue'
var routerObj = new VueRouter({
    routes: [
        {path: '/', redirect: '/coin'},
        {path: '/coin', component: coin_list},
        {path: '/exchange', component: ex_list},
        {path: '/coin/:symbol', component: coin_detail},
        {path: '/exchange/:ex', component: ex_info},
        {path: '/compare', component: compare}
    ],
    scrollBehavior: function(to, from, savedPosition){
        return {x:0, y:0}
    }
})

export default routerObj