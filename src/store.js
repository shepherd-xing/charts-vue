import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const state = {
    allCoins: [],
}

const mutations = {
    getData: function(state){       //获取所有coin信息
        axios.get('/api/coins').then(res => {
            state.allCoins = res.data.coins;
            var list = JSON.stringify(state.allCoins);
            localStorage.setItem('$coinList', list);
        }, function(e){
            console.log(e)
        });
    },
}

export default new Vuex.Store({
    state,
    mutations
})