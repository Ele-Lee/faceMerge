import Axios from 'axios';

//默认请求头
const DEFAULT_HEADER = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

const API_ROOT = ''
const API_ROOT_DEV = ''

const API_HOST = () => (process.env.NODE_ENV === 'production' ? API_ROOT : API_ROOT_DEV)

class Api {
    constructor(vue) {
        this.vue = vue
        this.axios = null
        this._initAxios()
    }

    _initAxios() {
        this.axios = Axios.create({
            baseURL: API_HOST(),
            headers: DEFAULT_HEADER
        })

        this.axios.interceptors.request.use((config) => {
            // 配置公共header
            let entrance = this._getCookie('entrance')
            let jwt;
            if(process.env.NODE_ENV === 'prod') {
                jwt = this._getCookie(`_entry_${entrance}_sid`)
            } else {
                jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJyZXNpZCI6IiIsIm9wZW5pZCI6Im9JelM0d2Q0Ykl6OWkxWWpBdzdYNTZMdWtsb0kiLCJ1bmlvbmlkIjoib2p1UVR3bFlNOEZ4NUpkdnBNZzdEWXNrbUp2YyIsInd4YXBwaWQiOiJ3eGVjMmI2YzllNGJjNDdhZjgiLCJzY29wZSI6InByaXZhdGUiLCJleHAiOjE1NDQ2NzI4ODgsIm5pY2tuYW1lIjoieW91LiIsImhlYWRpbWd1cmwiOiJodHRwOi8vdGhpcmR3eC5xbG9nby5jbi9tbW9wZW4vdmlfMzIvZ2tVWm0wTUhWUnhUTWFBbEpEMThEaHVMbG9abE5ta25jYVN3ekRtYlBpYll6d2o0aWJPQkF4UHBFWEtwY1h5R3NkQlFyU2FYcEhnUW1HdHN3QUY5dFlady8xMzIiLCJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKeVpYTnBaQ0k2SWlJc0ltOXdaVzVwWkNJNkltOUplbE0wZDJRMFlrbDZPV2t4V1dwQmR6ZFlOVFpNZFd0c2Iwa2lMQ0oxYm1sdmJtbGtJam9pYjJwMVVWUjNiRmxOT0VaNE5VcGtkbkJOWnpkRVdYTnJiVXAyWXlJc0luZDRZWEJ3YVdRaU9pSjNlR1ZqTW1JMll6bGxOR0pqTkRkaFpqZ2lMQ0p6WTI5d1pTSTZJbkJ5YVhaaGRHVWlMQ0psZUhBaU9qRTFORFEyTnpJNE9EZ3NJbWxoZENJNk1UVTBOREEyT0RBNE9IMC5ObVA3TGVvWjR3OE5ZNEd6M3ljckhhTHVVRm85RmVQRjJHUHB6ZFMxSUFBIn0sImVudHJhbmNlIjoiY29tcGFueToxOmFwcGlkOjE6Z2FtZWlkOjY4IiwiaWF0IjoxNTQ0MDY4MDg4LCJleHAiOjE1NDQxNTQ0ODh9.-rQSA7GNGa2YsrXhxLOWMDWL8cmeT_xjq6o9Dd-0kRw'
            }
            if (jwt) {
                config.headers.Authorization = `Bearer ${jwt}`
            }
            return config
        }, (error) => {
            return Promise.reject(error)
        })

        this.axios.interceptors.response.use((response) => {
            if (response.data.code == 0) {
                return response.data.payload || response.data
            }
            console.log('elelee test: 请求失败1', error);
            return Promise.reject('请求失败', response)
        }, (error) => {
            console.log('elelee test: 请求失败2', error.response);
            if(error.response.status == 413) {
                this.vue.prototype.$bus.$emit('alert', '图片文件大小过大')
            }
            return Promise.reject(error.response)
        })
    }

    _getCookie(name) {
        console.log(name)
        let reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")

        let arr = null
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2])
        }
        return null
    }

    /**
     *  获取微信jssdk配置
     * @param {*} url
     */
    getWxSignPackage(url = window.location.href.split('#')[0]) {
        return this.axios
            .get('https://custom.24haowan.com/public/wechat/sdk-config', { params: { url: url } })
            .then(data => {
                // 传入的data需要看看接口返回的数据是否包多一层payload等等
                // console.log(data)
                return this.vue.prototype.$wxsdk.configWx(data)
            })
    }

    /**
     * 获取用户信息
     */
    getWxUserInfo() {
        return this.axios.get('/userInfo')
    }

    merge(params = {}, _reqTimes) {
        let url = 1 ? 'https://custom.24haowan.com/cd/merge' : 'http://192.168.0.108:3000/cd/merge';
        // let url = process.env.NODE_ENV === 'prod' ? 'https://custom.24haowan.com/cd/merge' : 'http://192.168.0.108:3000/cd/merge';
        let reqTimes = _reqTimes || 3;
        if (reqTimes-- && reqTimes <= 0) {
            this.vue.prototype.$bus.$emit('concurrent')
            return '0';
        }
        return this.axios.post(url, params)
            .then(e => {
                const res = JSON.parse(e.res);
                if(/BAD_ARGUMENTS/.test(res.error_message)) {
                    this.vue.prototype.$bus.$emit('alert', '解析出错')
                    return '';
                }
                if(/NO_FACE_FOUND/.test(res.error_message)) {
                    this.vue.prototype.$bus.$emit('alert', '图片未检测到人脸')
                    return '';
                }
                if(/BAD_FACE/.test(res.error_message)) {
                    this.vue.prototype.$bus.$emit('alert', '图片未检测正面人脸')
                    return '';
                }
                if(/INVALID_RECTANGLE/.test(res.error_message)) {
                    this.vue.prototype.$bus.$emit('alert', '图片未检测正面人脸')
                    return '';
                }
                if(/CONCURRENCY_LIMIT_EXCEEDED/.test(res.error_message)) {
                    console.log('elelee test:', '重新发1');
                    return this.merge(params, reqTimes);
                }
                if (res.result.length < 1000) {
                    this.vue.prototype.$bus.$emit('alert', '解析出错,请重试')
                    return ''
                }
                const base64Src = 'data:image/jpeg;base64,' + res.result;
                // return this.beauty(base64Src);
                return base64Src
            })
            .catch((err) => {
                this.vue.prototype.$bus.$emit('hideAlertLoading');
                if(err.data.code == '0004' || err.status == 403) {
                    this.vue.prototype.$bus.$emit('alert', '您已经超过融合次数', null, 2600);
                    return '0'
                }
                if(err.status == 500) {
                    // 500 可能是高并发了
                    console.log('elelee test:', '重新发2');
                    return this.merge(params, reqTimes);
                }
                if(error.status == 413) {
                    this.vue.prototype.$bus.$emit('alert', '图片文件大小过大')
                    return '0'
                }
                // error_message
            });
    }

    beauty(imgSrc, _reqTimes) {
        const url = 'https://api-cn.faceplusplus.com/facepp/beta/beautify';
        let form = new FormData();
        let params = {
            api_key: 'Kj743TFIP9STXEsmW5NxFe8j9NrM9XDZ',
            api_secret: 'QwqCbdaXQfbDJKsoSidLlxbLtpoI0vE0'
        };
        let reqTimes = _reqTimes || 3;
        if (reqTimes-- && reqTimes <= 0) {
            // 并发太高不美颜
            return imgSrc;
        }
        Object.keys(params).forEach(key => {
            form.append(key, params[key]);
        });
        form.append('image_base64', imgSrc);
        form.append('smoothing', 50);
        form.append('whitening', 50);
        return Axios.post(url, form)
                    .then(res => {
                        let result = res.data;
                        if(/BAD_ARGUMENTS/.test(res.error_message)) {
                            this.vue.prototype.$bus.$emit('alert', '解析出错')
                            return '0';
                        }
                        if(/CONCURRENCY_LIMIT_EXCEEDED/.test(res.error_message)) {
                            return this.beauty(imgSrc, reqTimes);
                        }
                        if (!result.error_message) {
                            return ('data:image/jpeg;base64,' + result.result);
                        } else {
                            return imgSrc;
                        }
                    })
                    .catch(err => {
                        console.log('beauty2', err, form);
                        // return Promise.resolve(this.imgSrc);
                        if(err.status == 500 || err.status == 403) {
                            // 500 可能是高并发了
                        }
                        return this.beauty(imgSrc, reqTimes);
                    });
    }
}

export default {
    install: function install(Vue) {
        Vue.prototype.$api = new Api(Vue);
    }
};
