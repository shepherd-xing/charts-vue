<template id="exchange">
    <div id="exchange_list">
        <table class="table table-hover">
            <thead>
            <tr>
                <th>排名</th>
                <th>交易所名字</th>
                <th>交易对数量</th>
                <th>交易量（24h）</th>
                <th>交易量变化（24h）</th>
                <th>交易量占比</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(ex, index) in display_data" :key="index">
                <td>{{ ex['rank'] }}</td>
                <td><img :src="ex['icon_src']"><router-link :to="'/exchange/' + ex['name']">{{ ex['name'] }}</router-link></td>
                <td>{{ ex['pairs'] }}</td>
                <td>{{ ex['volume'] }}</td>
                <td :class="['change', {'down': parseFloat(ex['change']) < 0}]">{{ ex['change'] }}</td>
                <td class="bar">
                    <div :class="['percent']" :style="percents['width'][index]">
                    </div>
                    {{ percents['percents'][index] }}%
                </td>
            </tr>
            </tbody>
        </table>
        <div v-show="topFlag" class="toTop" :style="'left:' + width" @click="goToTop"></div>
    </div>
</template>

<script>
    var exchange = {
        template: '#exchange',
        data(){
            return {
                data: [],       //所有的数据
                display_data: [],    //初始显示30条
                remain_data: [],          //滚动要加载的列表，整个列表减去初始列表
                topFlag: false,
            }
        },
        props: ['windowWidth'],
        created(){
            this.getData()
        },
        mounted(){
             addEventListener('scroll', this.scroll);
        },
        methods: {
            getData: function(){
                this.$axios.get('/api/ex').then(res => {
                    this.data = res.data['ex'];
                    this.display_data = res.data['ex'].slice(0, 30);        //初始显示30条数据
                    this.remain_data = res.data['ex'].slice(30)       //滚动加载的整个列表
                })
            },
            showMore: function(){
                this.display_data = this.display_data.concat(this.remain_data.splice(0, 15))      //滚动加载
            },
            scroll: function(){
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                var contentHeight = document.documentElement.scrollHeight || document.body.scrollHeight
                var bottom = contentHeight - innerHeight - scrollTop;
                if (bottom <= 20){
                    this.showMore()
                }
                if (scrollTop >= innerHeight * 0.5){
                    this.topFlag = true
                }
                if (scrollTop < innerHeight * 0.5){
                    this.topFlag = false
                }
            },
            goToTop: function(){
                scrollTo(0, 0);
            },
        },
        computed: {
            'percents': function(){
                var obj = {}
                this.$emit('getPercents', this.display_data, obj)
                return obj
            },
            width: function(){
                return this.windowWidth - 70 + 'px'
            }
        }
    }

    export default exchange
</script>

<style scoped>
    .down {
        color: red
    }
    .bar {
        width: 50%;
    }
    tbody tr:hover {
        transform: skew(-10deg) scale(1.04, 1.05)
    }
</style>