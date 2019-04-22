window.baidu = (type, action, label) => {
    if (process.env.NODE_ENV !== 'prod') {
        console.log('dev模式不上报百度统计：')
    } else {
        _hmt ? _hmt.push(['_trackEvent', type, action, label]) : (console.log('elelee test:', '_hmt does not exist'));
    }
}


import { getAllUrlQuery } from '@common/util'
import VConsole from '@static/js/vconsole.min.js'
// 放在前面，先打开vconsole，不然有些可能先打印的会看不到
// 获取链接附带的参数
window.params = getAllUrlQuery()
// 有debug参数，打开vconsole
if (window.params.debug == 'true') {
    new VConsole()
    console.log('params:', params)
}

import Vue from 'vue'

import App from './App'
import router from './router'
import wxsdk from '@common/wxsdk'
import bus from '@common/bus'
import api from '@common/api'
// import cache from '@common/cache'
// import audioUtil from '@common/audioUtil'
import Face from '@common/Face'

Vue.config.productionTip = false

Vue.use(wxsdk)
Vue.use(api)
// Vue.use(cache)
Vue.use(bus)
Vue.use(Face)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router: router(),
    template: '<App/>',
    components: {
        App,
    },
})
