<template id="compareTemp">
    <div id="compare">
        <div class="choices_container">
            <div class="choices_list">
                <div v-for="(item, index) in showList" :key="index" class="choices_item">
                    {{ item.name }} ({{ item.symbol }})
                    <button class="choices_button" @click="remove(index); removeTable(item.symbol)">X</button>
                </div>
            </div>
            <div class="pullDownContainer" @mouseleave="flag=false">
                <input type="text" class="choices_input" @mouseenter="flag=true" v-model="input">
                <div class="pullDown" v-if="flag">
                    <ul>
                        <li v-for="(item, index) in pullDownList" :key="index"
                            @click="getCoinInfo(item.symbol); addToShowList(item.symbol, item.name)">
                            {{ item.name }} ({{ item.symbol }})</li>
                    </ul>
                </div>
            </div>
            <button class="btn btn-info">比一比</button>
        </div>

        <div class="tableContainer">
            <table class="table table-striped table-bordered table-condensed tableLeft">
                <thead>
                <tr>
                    <th>货币</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>市值排名</td>
                </tr>
                <tr>
                    <td>价格</td>
                </tr>
                <tr>
                    <td>市值</td>
                </tr>
                <tr>
                    <td>流通量/总量</td>
                </tr>
                <tr>
                    <td>主页</td>
                </tr>
                <tr>
                    <td>可交易的交易所</td>
                </tr>
                </tbody>
            </table>
            <dragabble :options="{animation: 1300}" class="drag">
                <div v-for="(item, index) in coinInfo" :key="index">
                    <table class="table table-bordered table-condensed infoTable">
                        <thead>
                        <tr>
                            <th colspan="2" class="withTitle">
                                <img :src="detail[item['symbol']]['icon_src']">
                                {{ detail[item['symbol']]['name'] }} ({{ item['symbol'] }})
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td colspan="2">{{ detail[item['symbol']]['rank'] }}</td>
                        </tr>
                        <tr>
                            <td colspan="2">$ {{ detail[item['symbol']]['price'] | formatDec }}</td>
                        </tr>
                        <tr>
                            <td colspan="2">$ {{ detail[item['symbol']]['cap'] | toInt }}</td>
                        </tr>
                        <tr>
                            <td colspan="2">{{ item['supplies']['Circulating Supply'] || '未知' }} / {{ item['supplies']['Max Supply'] || '未知' }}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><a :href="item['links']['Website']" target="_blank">{{ item['links']['Website'] }}</a></td>
                        </tr>
                        <tr>
                            <td>交易所</td>
                            <td>交易量</td>
                        </tr>
                        <tr v-for="(info, index) in item['trade_info']" :key="index">
                            <td>
                                <img :src="info['icon_src']">
                                {{ info['ex_name']}}
                                <div>
                                    <div>
                                        <img :src="info['icon_src']">
                                        {{ info['ex_name'] }}
                                    </div>
                                    <div>
                                        <div>交易对</div>
                                        <div>交易量</div>
                                    </div>
                                    <div v-for="(v, k) in info['pairs']" :key="k">
                                        <div>{{ v.pair }}</div>
                                        <div>{{ v.volume }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                $ {{ info['volume'].toLocaleString() }}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </dragabble>

        </div>
    </div>
</template>

<script>
    import dragabble from 'vuedraggable';

    var compare = {
        template: '#compareTemp',
        data(){
            return {
                showList: [],
                coinInfo: [],
                flag: false,
                detail: {},
                input: '',
            }
        },
        created(){
            this.setInfo();
        },
        components: {
            dragabble
        },
        methods: {
            setInfo: function(){
                var id = setInterval(() => {
                    if(this.allCoins.length > 0){
                        this.showList = this.allCoins.filter(item => item.symbol !== 'USDT').slice(0, 4).map(item => {
                            var obj = {};
                            obj.symbol = item.symbol;
                            obj.name = item.name;
                            return obj
                        });
                        this.allCoins.forEach(item => {
                            var obj = {};
                            obj.name = item.name;
                            obj.price = item.price;
                            obj.cap = item.cap;
                            obj.rank = item.rank;
                            obj.icon_src = item.icon_src;
                            this.detail[item.symbol] = obj
                        });
                        this.getInfo();
                        clearInterval(id)
                    }
                }, 100)
            },
            getCoinInfo: function(symbol){      //获取coin详细信息
                var url = '/api/coins/' + symbol;
                this.$axios.get(url).then(res => {
                    var data = res.data.detail;
                    data['symbol'] = symbol;
                    data['trade_info'] = this.deduplicate(data['trade_info']);
                    this.coinInfo.push(data)
                })
            },
            getInfo: function(){
                this.showList.forEach(item => this.getCoinInfo(item.symbol))
            },
            addToShowList: function(symbol, name){
                var obj = {};
                obj.symbol = symbol;
                obj.name = name;
                this.showList.push(obj)
            },
            remove: function(index){
                this.showList.splice(index, 1)
            },
            removeTable: function(symbol){
                this.coinInfo = this.coinInfo.filter(item => item['symbol'] !== symbol)
            },
            deduplicate: function(trade_info){       //数组去重，并重新组织数据
                var list = [], obj = {}, volObj = {}, pairObj = {};
                trade_info.forEach(item => {
                    var obj1 = {};       //单个交易所信息
                    var name = item['ex_name'];     //交易所名字
                    obj1['ex_name'] = name;
                    obj1['icon_src'] = item['icon_src'];
                    var volume = parseInt(item['volume'].replace(/\$|,/g, ''));
                    volObj[name] = volObj[name] ? volObj[name] + volume : volume;   //交易量求和，得到每个交易所的当前coin的总交易量
                    obj[name] = obj1;
                    var obj2 = {};
                    obj2.pair = item.pair;
                    obj2.volume = item.volume;
                    if (Array.isArray(pairObj[name])) {
                        pairObj[name].push(obj2)
                    }
                    else {
                        pairObj[name] = [];
                        pairObj[name].push(obj2)
                    }
                });
                for (var key in obj){      //key为交易所名字
                    obj[key]['volume'] = volObj[key];
                    obj[key]['pairs'] = pairObj[key];
                    list.push(obj[key]);
                };
                list = list.sort(function(a, b){
                    return b.volume - a.volume
                });
                return list
            }
        },
        computed: {
            pullDownList: function(){
                return this.allCoins.filter(val => {
                    var list = this.showList.map(item => item.symbol);
                    this.input = this.input.replace(/^ +/, '');
                    return list.indexOf(val.symbol) === -1 &&
                        (val.symbol.indexOf(this.input.toUpperCase()) > -1 ||
                            val.name.toUpperCase().indexOf(this.input.toUpperCase()) > -1)
                })
            },
            allCoins: function(){
                var obj = localStorage.getItem('$coinList');
                var localeData = JSON.parse(obj);
                var storeData = this.$store.state.allCoins;
                return storeData.length > 0 ? storeData: localeData
            }
        },
        filters: {
            toInt: function(num){
                return parseInt(num).toLocaleString()
            },
            formatDec: function(num){
                if(num>10){
                    return num.toFixed(2)
                }
                else if(num>0.1){
                    return num.toFixed(3)
                }
                else{
                    return num.toFixed(4)
                }
            }
        }
    };
    export default compare
</script>

<style scoped>
    #compare {
        margin: 0 100px;
    }
    .choices_container {
        display: inline-block;
        margin: 0 auto;
        padding: 4px;
        background: #f9f9f9;
        border: 1px solid #ddd;
    }
    .choices_list {
        display: inline
    }
    .choices_item {
        display: inline-block;
        margin-right: 3px;
        padding: 3px 8px;
        color: #8dc647;
        border: 1px solid #8dc647
    }
    .choices_button {
        display: inline-block;
        border: none;
        margin-left: 8px;
        padding-left: 8px;
        background: white;
        border-left: 1px solid #8dc647;
    }
    .pullDownContainer {
        display: inline-block;
        position: relative
    }
    .choices_input {
        background: #f9f9f9
    }
    .pullDown {
        max-height: 300px;
        width: 100%;
        background: honeydew;
        position: absolute;
        overflow: auto
    }
    .pullDown li:hover {
        color: lightcoral;
        cursor: pointer
    }
    .tableContainer {
        display: flex;
    }
    tbody tr:hover {
        transform: none
    }
    .tableLeft {
        width: 90px;
    }
    .tableLeft tbody tr:nth-child(4){
        height: 50px;
    }
    .tableLeft tbody tr:nth-child(6) td {
        padding: 200px 40px;
    }
    .drag {
        display: flex;
        justify-content: left
    }
    .drag > div {
        flex: 1;
    }
    .infoTable {
        border-top: 1px solid lightseagreen;
        border-right:3px double lightseagreen;
    }
    .infoTable tbody tr:hover {
        background: plum;
    }
    .infoTable thead th:first-child {
        cursor: pointer
    }
    .infoTable th, .infoTable td {
        text-align: center
    }
    .infoTable tr:nth-child(n+7) td {
        text-align: left
    }
    .infoTable tbody tr:nth-child(4), .infoTable tr:nth-child(n+7){
        height: 50px;
    }
    .infoTable tbody tr:nth-child(n+7) td:first-child {
        position: relative
    }
    .infoTable tbody tr:nth-child(6) td {
        width: 50%
    }
    .withTitle:hover:after {
        content: '点击进行拖拽';
        color: mediumorchid;
        position: absolute;
        margin-left: 10px;
        margin-top: -5px;
        background: honeydew;
        font: italic 18px 华文新魏;
    }
    td > div {
        display: none
    }
    td:hover > div{
        display: block;
        position: absolute;
        left: 60%;
        top: -50%;
        width: auto;
        padding-left: 3px;
        color: mediumorchid;
        background-image: url(../images/background.jpg);
        border: 1px solid mediumorchid;
        border-radius: 15px;
    }
    td:hover > div > div {
        display: table-row;
        height: 30px;
    }
    td:hover > div > div:nth-child(n+2) {
        border-top: 1px solid mediumorchid;
    }
    td:hover > div > div > div {
        display: table-cell;
        padding: 5px
    }
    td:hover > div > div > div:first-child {
        border-right: 1px solid mediumorchid;
    }
</style>