<template id="coin_detail">
    <div id="coin_info">
        <div class="col-md-5">
            <table class="table table-hover table-bordered">
                <thead>
                <tr>
                <th width="15%">类型</th>
                <th style="text-align:center">网站地址</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(word, key) in word_obj" :key="key">
                    <td>{{ word }}</td>
                    <td>
                        <span v-for="(item, index) in websites[key]" :key="index">
                            <a :href="item" style="color: dodgerblue" target="_blank">
                                <span v-if="websites[key].length > 1">
                                    站点{{ index+1 }}：</span>{{ item }}
                            </a><br>
                        </span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <div id="chartjs_container" class="col-md-5">
            <canvas ref="pie"></canvas>
        </div>

        <div id="trade_info">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>交易所</th>
                        <th>交易对</th>
                        <th>交易量（24小时）</th>
                        <th>价格</th>
                        <th>占比</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in display_info" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <img :src="item['icon_src']">
                            {{ item['ex_name'] }}
                        </td>
                        <td>{{ item['pair'] }}</td>
                        <td>{{ item['volume'] }}</td>
                        <td>{{ item['price'] }}</td>
                        <td class="bar"><div :style="percents['width'][index]"></div>
                            {{ percents['percents'][index] }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-show="topFlag" class="toTop" :style="'left:' + width" @click="goToTop"></div>
    </div>
</template>

<script>
    var coin_info = {
        template: '#coin_detail',
        data(){
            return {
                words: ['Website', 'Explorer', 'Message', 'Chat', 'Code', 'Documentation'],
                word_obj: {
                    'Website': '主页', 'Explorer': '区块链浏览器', 'Message': '论坛',
                    'Chat': '社交聊天', 'Code': '源代码', 'Documentation': '白皮书'
                },
                detail: {},
                websites: {},
                config: {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: [0, '未知'],
                            backgroundColor: ['#FF9F40', '#9AD0F5']
                        }],
                        labels: ['流通量', '剩余流通量']
                    },
                    options: {
                        responsive: true
                    }
                },
                symbol: '',
                trade_info: [],
                display_info: [],
                remain_info: [],
                flag: true,        //决定饼图是否渲染
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
        updated(){
            this.showChart()
        },
        methods: {
            getData: function(){
                this.symbol = this.$route.params.symbol;
                var url = '/api/coins/' + this.symbol;
                this.$axios.get(url).then(res => {
                    this.detail = res.data.detail;
                    var linksObj = this.detail.links;
                    this.getWebsites(linksObj);
                    this.getSupply();
                    this.getTradeInfo()
                })
            },
            getWebsites: function(linksObj){        //构建websites对象
                for (var word of this.words){
                    var arr = []
                    var keysList = Object.keys(linksObj)
                    for (var key of keysList){
                        if (key.indexOf(word) > -1){
                            arr.push(linksObj[key])
                        }
                    }
                    this.websites[word] = arr
                }
            },
            showChart: function(){
                if (this.flag){
                    var pieChart = this.$refs.pie.getContext('2d')
                    this.myPie = new Chart(pieChart, this.config)
                    this.flag = false
                }
            },
            getSupply: function(){
                var supplies = this.detail['supplies']
                var circ_supply = parseInt(supplies['Circulating Supply'].replace(/,/g, ''))
                this.config.data.datasets[0].data[0] = circ_supply
                if(supplies['Max Supply']){
                    this.config.data.datasets[0].data[1] = parseInt(supplies['Max Supply'].replace(/,/g, '')) - circ_supply
                }
            },
            getTradeInfo: function(){
                this.trade_info = this.detail['trade_info']
                this.display_info = this.trade_info.slice(0, 25)
                this.remain_info = this.trade_info.slice(25)
            },
            showMore: function(){
                this.display_info = this.display_info.concat(this.remain_info.splice(0, 20))
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
                scrollTo(0, 0)
            },
        },
        computed: {
            percents: function(){
                var obj = {}
                this.$emit('getPercents', this.trade_info, obj)
                return obj
            },
            width: function(){
                return this.windowWidth - 70 + 'px'
            }
        }
    }

    export default coin_info
</script>

<style scoped>
    #coin_info {
        margin: 0 60px;
        padding-left: 0
    }
    .col-md-5 {
        padding-left:0
    }
    td div {
        height: 20px;
        float: left;
        background-color: mediumvioletred;
    }
    .bar {
        width: 50%;
    }
</style>