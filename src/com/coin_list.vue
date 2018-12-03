<template id="coin">
    <div id="coin_list">
        <form>
            <div class="form-inline">
                <div class="form-group">
                    <input type="text" class="form-control input-lg" v-model="input" @keyup="search" placeholder="请输入名称或代号">
                    <input type="button" value="搜索" class="btn btn-info btn-lg" @click="search">
                </div>
            </div>
        </form>
        <table class="table table-hover">
            <thead>
            <tr>
                <th>排名</th>
                <th>名称</th>
                <th>代号</th>
                <th>市值（美元）</th>
                <th>价格（美元）</th>
                <th>涨跌幅（24小时）</th>
                <th><input type="button" value="我的收藏" class="btn btn-info" @click="showPortfolio" ref="showbtn">
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="coin in display_data" :key="coin['symbol']">
                <td>{{ coin['rank'] }}</td>
                <td>
                    <img :src="coin['icon_src']">
                    <router-link :to="'/coin/' + coin['symbol']">{{ coin['name'] }}</router-link>
                </td>
                <td><router-link :to="'/coin/' + coin['symbol']">{{ coin['symbol'] }}</router-link></td>
                <td>$ {{ parseInt(coin['cap']).toLocaleString() }}</td>
                <td>$ {{ coin['price'] | toFix }}</td>
                <td :class="['change', {'down': parseFloat(coin['change']) < 0 }]">
                    {{ coin['change'] }}%
                </td>
                <td><div :class="['white_heart', portfolio.indexOf(coin['symbol']) > -1 ? 'red_heart': '']"
                         @click="addToPortfolio(coin['symbol'])" :title="titleObj[coin['symbol']]">
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
        <div v-show="topFlag" class="toTop" :style="'left:' + width" @click="goToTop" id="top"></div>
    </div>
</template>

<script>
    var coin = {
        template: '#coin',
        data(){
            return {
                data: [],       //所有数据
                remain_data: [],     //滚动加载的列表，整个列表减去初始列表
                display_data: [],     //要显示的列表
                input: '',              //输入的代号或者名字
                portfolio: [],           //本地存储的portfolio
                topFlag: false,
            }
        },
        props: ['windowWidth'],
        created(){
            this.getData();
            this.getPortfolio()
        },
        mounted(){
            addEventListener('scroll', this.scroll);
        },
        methods: {
            getData: function(){
                this.$axios.get('/api/coins').then(res => {
                    this.data = res.data['coins'];
                    this.display_data = this.data.slice(0, 30);     //初始显示30条数据
                    this.remain_data = this.data.slice(30);
                }, function(e){
                    console.log(e)
                });
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
            showMore: function(){
                this.display_data = this.display_data.concat(this.remain_data.splice(0, 20))     //每次滚动添加列表数据
            },
            search: function(){
                var btn = this.$refs.showbtn
                if (btn.value === '显示全部'){
                    var portfolio_data = this.data.filter(item =>{
                        return this.portfolio.indexOf(item['symbol']) > -1
                    })
                    if (this.input === ''){
                        this.display_data = portfolio_data
                    }
                    else {
                        this.display_data = portfolio_data.filter(item => {
                            return item['symbol'].indexOf(this.input.toUpperCase()) > -1 ||
                                item['name'].toUpperCase().indexOf(this.input.toUpperCase()) > -1
                        })
                    }
                }
                else {
                    if (this.input === ''){
                        this.display_data = this.data.slice(0, 30)
                    }
                    else{
                        this.display_data = this.data.filter(item => {
                            return item['symbol'].indexOf(this.input.toUpperCase()) > -1 ||
                                item['name'].toUpperCase().indexOf(this.input.toUpperCase()) > -1
                        })
                    }
                }
            },
            addToPortfolio: function(symbol){
                var local_portfolio = JSON.parse(localStorage.getItem('$portfolio'));
                local_portfolio = Array.isArray(local_portfolio) ? local_portfolio: [];
                if (local_portfolio.indexOf(symbol) === -1){
                    local_portfolio.push(symbol)
                    this.portfolio = local_portfolio.slice()
                    local_portfolio = JSON.stringify(local_portfolio)
                    localStorage.setItem('$portfolio', local_portfolio)
                }
                else {
                    var btn = this.$refs.showbtn
                    if (btn.value === '显示全部'){      //如果是在收藏列表中
                        this.display_data = this.display_data.filter(function(item){
                            return item['symbol'] !== symbol
                        })
                    }
                    local_portfolio.splice(local_portfolio.indexOf(symbol), 1)
                    this.portfolio = local_portfolio.slice()
                    local_portfolio = JSON.stringify(local_portfolio)
                    localStorage.setItem('$portfolio', local_portfolio)
                }
            },
            showPortfolio: function(){      //点击我的收藏或者全部
                var btn = this.$refs.showbtn
                if (btn.value === '我的收藏'){      //点击显示收藏
                    btn.value = '显示全部'
                    this.display_data = this.data.filter(item => {
                        return this.portfolio.indexOf(item['symbol']) > -1
                    })
                }
                else {      //点击显示全部
                    btn.value = '我的收藏'
                    this.display_data = this.data.slice(0, 30)
                    this.remain_data = this.data.slice(30)
                }
            },
            getPortfolio: function(){           //渲染页面时读取localStorage的portfolio
                var local_portfolio = JSON.parse(localStorage.getItem('$portfolio'))
                if(Array.isArray(local_portfolio)){
                    this.portfolio = local_portfolio
                }
            },
            goToTop: function(){
                scrollTo(0, 0);
            },
        },
        computed: {
            titleObj: function(){
                var obj = {};
                for (var item of this.data){
                    if (this.portfolio.indexOf(item['symbol']) > -1){
                        obj[item['symbol']] = '取消收藏'
                    }
                    else {
                        obj[item['symbol']] = '点击收藏'
                    }
                };
                return obj
            },
            width: function(){
                return this.windowWidth - 70 + 'px'
            }
        },
        filters: {
            toFix: function(num){
                switch (true){
                    case num < 0.1:
                        return num.toFixed(5);
                        break;
                    case num < 1:
                        return num.toFixed(3);
                        break;
                    default:
                        return num.toFixed(2);

                }
            }
        },
    }

    export default coin
</script>

<style scoped>
    .down {
        color: red
    }
    .white_heart {
        width: 24px;
        height: 20px;
        background: url('../images/heart.jpg');
        background-repeat: no-repeat;
    }
    .red_heart {
        background-position: -31px;
    }
    tbody tr:hover {
        transform: skew(-10deg) scale(1.06, 1.05)
    }

</style>