<template id="ex_info">
    <div id="exchange_info">
        <div id="links">
            <table class="table table-hover table-bordered">
                <thead>
                <tr>
                    <th>分类</th>
                    <th>网址</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>主页</td>
                    <td>
                        <a :href="links['Website']" target="_blank">{{ links['Website'] }}</a>
                    </td>
                </tr>
                <tr>
                    <td>推特</td>
                    <td>
                        <a :href="links['Twitter']" target="_blank">{{ links['Twitter'] }}</a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div>
            <table class="table table-hover">
                <caption>可交易的市场</caption>
                <thead>
                <tr>
                    <th>排名</th>
                    <th>货币</th>
                    <th>交易对</th>
                    <th>交易量（24小时）</th>
                    <th>价格</th>
                    <th>占比</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in display_data" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                        <img :src="item['icon_src']">
                        {{ item['coin_name'] }}</td>
                    <td>{{ item['pair'] }}</td>
                    <td>{{ item['volume'] }}</td>
                    <td>{{ item['price'] }}</td>
                    <td class="bar"><div :style="percents['width'][index]"></div>{{ percents['percents'][index] }}%</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div v-show="topFlag" class="toTop" :style="'left:' + width" @click="goToTop"></div>
    </div>
</template>

<script>
    var ex_info = {
        template: '#ex_info',
        data(){
            return {
                ex_name: '',
                ex_info : {},           //交易所详细信息
                trade_info: [],        //所有交易数据数组
                display_data: [],     //页面显示的数据
                remain_data: [],      //剩余数据
                links: {},
                topFlag: false,
            }
        },
        props: ['windowWidth'],
        created(){
            this.getData()
        },
        mounted(){
            addEventListener('scroll', this.scroll)
        },
        methods: {
            getData: function(){
                this.ex_name = this.$route.params.ex.split('.')[0]
                var url = '/api/ex/' + this.ex_name
                this.$axios.get(url).then(res => {
                    this.ex_info = res.data['ex_info']
                    this.trade_info = this.ex_info['trade_info']
                    this.links = this.ex_info['links']
                    this.display_data = this.trade_info.slice(0, 25)
                    this.remain_data = this.trade_info.slice(25)
                })
            },
            showMore: function(){
                this.display_data = this.display_data.concat(this.remain_data.splice(0, 20))
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
                this.$emit('getPercents', this.trade_info, obj)
                return obj
            },
            width: function(){
                return this.windowWidth - 70 + 'px'
            }
        }
    }
    export default ex_info
</script>

<style scoped>
    #exchange_info {
        margin: 0 20px;
    }
    #links {
        margin-top: 5px;
        width: 30%;
    }
    caption {
        font-size: large;
        text-align: center;
        color: black;
    }
    td div {
        float:left;
        height: 20px;
        background-color: palevioletred;
    }
    .bar {
        width: 50%;
    }
</style>