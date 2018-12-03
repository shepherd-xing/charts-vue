<template>
    <div id="app">
        <div id="content">
            <ul class="nav nav-pills">
                <li><router-link to="/coin">虚拟货币</router-link></li>
                <li><router-link to="/exchange">交易所</router-link></li>
                <li><a href="/chart">图表</a></li>
            </ul>
        </div>
        <transition mode="out-in" enter-active-class="rollIn" :duration="5000">
            <router-view @getPercents="getPercents" :windowWidth="windowWidth" class="animated"></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                windowWidth: 0
            }
        },
        mounted(){
            this.getWindowSize();
            onresize = this.getWindowSize;
        },
        methods: {
            getPercents: function(arr, obj){
                var volumes = arr.map(function(item){
                    return Number(item['volume'].slice(1).replace(/,/g, ''))
                })
                var totalVol = volumes.reduce(function(total, currentVal){
                    return total + currentVal
                })
                var percents = volumes.map(function(item){
                    return (item / totalVol * 100).toFixed(2)
                })
                var widthArr = percents.map(function(item){
                    var first_item = percents[0]
                    var width = item / first_item * 90 + '%'
                    return {width: width}
                })
                obj['percents'] = percents;
                obj['width'] = widthArr;
            },
            getWindowSize: function(){
                this.windowWidth = innerWidth;
            },
        }
    }

</script>

<style scoped>
    .router-link-active{
        background: plum;
    }
    /*.v-enter, v-leave-to{*/
        /*transform: translateX(1000px)*/
    /*}*/
    /*.v-enter-active, v-leave-active{*/
        /*transition: all 1s ease-in*/
    /*}*/

</style>