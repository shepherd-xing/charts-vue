<template id="compareTemp">
    <div id="compare">
        <div class="choices_container">
            <div class="choices_list">
                <div v-for="(symbol, index) in showList" :key="symbol" class="choices_item">
                    {{ allCoins[symbol] }} ({{ symbol }})
                    <button class="choices_button" @click="remove(index); removeTable(symbol)">X</button>
                </div>
            </div>
            <div class="pullDownContainer" @mouseleave="hidePullDown">
                <input type="text" class="choices_input" @click="showPullDown" v-model="input">
                <div class="pullDown" v-if="flag">
                    <ul>
                        <li v-for="symbol in pullDownList" :key="symbol"
                            @click="getCoinInfo(symbol); addToShowList(symbol)">{{ allCoins[symbol] }} ({{ symbol }})</li>
                    </ul>
                </div>
            </div>
            <button class="btn btn-info">比一比</button>
        </div>

        <div class="tableContainer">
            <table class="table table-striped table-bordered table-condensed table1">
                <thead>
                <tr>
                    <th>货币</th>
                </tr>
                </thead>
                <tbody>
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
            <dragabble :options="{animation: 1500}">
                <table v-for="(info, index) in coinInfo" :key="index" class="table table-bordered table-condensed infoTable">
                    <thead>
                    <tr>
                        <th colspan="2" title="点击进行拖拽">{{ allCoins[info['symbol']] }} ({{ info['symbol'] }})</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td colspan="2">{{ info['supplies']['Circulating Supply'] || '?' }} / {{ info['supplies']['Max Supply'] || '?' }}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><a :href="info['links']['Website']" target="_blank">{{ info['links']['Website'] }}</a></td>
                    </tr>
                    <tr>
                        <td>交易所</td>
                        <td>交易量</td>
                    </tr>
                    <tr v-for="(infos, index) in info['trade_info']" :key="index">
                        <td>
                            <img :src="infos['ex_info']['icon_src']">
                            {{ infos['ex_info']['ex_name']}}
                        </td>
                        <td>
                            $ {{ infos['ex_info']['volume'].toLocaleString() }}
                        </td>
                    </tr>
                    </tbody>
                </table>
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
                allCoins: {},
                symbols: [],
                showList: [],
                coinInfo: [],
                flag: false,
                obj: {},
                input: ''
            }
        },
        created(){
            this.getAllCoins();
            this.getInfo();
        },
        components: {
            dragabble
        },
        methods: {
            getAllCoins: function(){
                var obj = localStorage.getItem('$coinList');
                this.allCoins = JSON.parse(obj);
                for(var key in this.allCoins){
                    this.symbols.push(key)
                };
                this.showList = this.symbols.slice(0, 4);
            },
            getCoinInfo: function(symbol){
                var url = '/api/coins/' + symbol;
                this.$axios.get(url).then(res => {
                    var data = res.data.detail;
                    data['symbol'] = symbol;
                    data['trade_info'] = this.unique(data['trade_info']);
                    this.coinInfo.push(data)
                });
            },
            getInfo: function(){
                for (var symbol of this.showList){
                    this.getCoinInfo(symbol)
                }
            },
            addToShowList: function(symbol){
                this.showList.push(symbol)
            },
            remove: function(index){
                this.showList.splice(index, 1)
            },
            showPullDown: function(){
                this.flag = true
            },
            hidePullDown: function(){
                this.flag = false
            },
            removeTable: function(symbol){
                this.coinInfo = this.coinInfo.filter(item => item['symbol'] !== symbol)
            },
            unique: function(trade_info){       //数组去重
                var list = [], obj1 = {}, volObj = {};
                trade_info.forEach(item => {
                    var obj = {};
                    obj['ex_name'] = item['ex_name'];
                    obj['icon_src'] = item['icon_src'];
                    var volume = parseInt(item['volume'].replace(/\$|,/g, ''));
                    volObj[item['ex_name']] = volObj[item['ex_name']] ? volObj[item['ex_name']] + volume : volume;
                    obj1[item['ex_name']] = obj
                });
                for (var key in obj1){
                    var obj2 = {};
                    obj1[key]['volume'] = volObj[key];
                    obj2['ex_info'] = obj1[key];
                    list.push(obj2)
                }
                list = list.sort(function(a, b){
                    return b['ex_info']['volume'] - a['ex_info']['volume']
                })
                return list
            }
        },
        computed: {
            pullDownList: function(){
                return this.symbols.filter(val => this.showList.indexOf(val) === -1)
            },
        },
    }
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
        height: 300px;
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
    .table1 {
        width: 90px;
    }
    .table1 tbody tr:first-child{
        height: 50px;
    }
    .table1 tbody tr:nth-child(3){
        height: 800px;
    }
    .table1 tbody tr:nth-child(3) td {
        padding: 300px 40px;
    }
    .infoTable {
        width: 240px;
        float: left;
        border-top: 1px solid lightseagreen;
        border-right:3px double lightseagreen
    }
    .infoTable thead th:first-child {
        text-align: center;
        cursor: pointer
    }
    .infoTable tbody tr:first-child, .infoTable tr:nth-child(n+4){
        height: 50px;
    }
    .infoTable tbody tr:nth-child(3) td {
        width: 50%
    }
    tbody tr:hover {
        transform: skew(0) scale(1, 1);
    }
    .infoTable tbody tr:hover {
        background: lightblue;
    }
</style>