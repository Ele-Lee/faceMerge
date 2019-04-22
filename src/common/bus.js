import Vue from 'vue';
import { isWeixinBrowser } from './util';

export default {
    install: function install(vue) {
        let bus = new Vue({
            data: {
                userInfo: {
                    avatar: '',
                    name: '',
                    openId: ''
                },
                isWeixinBrowser: isWeixinBrowser,
                ready: false,
                showLoading: false,
                // 这是一张BASE64,用户上传哪一张
                needMergeBase64: '',
                result1Base64: '',
                sex: Number,
                modelNum: '',
                name: '',
                canvasWidth: 638,
                canvasHeight: 882
            }
        });

        vue.prototype.$bus = bus;
    }
};
