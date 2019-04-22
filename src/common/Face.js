import axios from 'axios';

const FACE_API = {
    DETECT: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
    MERGE: 'https://api-cn.faceplusplus.com/imagepp/v1/mergeface'
}

const AUTH_PARAMS = {
    API_KEY: 'oZiEGjMDAlXHZuWZAUYdF4mdObOyDw5V',
    API_SECRET: '72A7IuA-MiBccBPFKFAZ9lu1AeP20_oE'
}

class Face {
    constructor() {
        this._initTplList();
        this._initResultList();
    }

    // 模板对象数组，4个，顺序对应tpl_list里面模板顺序
    _initTplList() {
        this.tplList = {};
        const rectList = {
            1: `178,257,139,139`,
            2: `178,257,139,139`,
            3: `178,257,139,139`,
            4: `178,257,139,139`,
        }
        let i = 1;
        while (i <= 4) {
            this.tplList[i] = {
                origin: null,
                style1: null,
                style2: null,
                style3: null,
                rect: rectList[i]
            };
            i++;
        }
    }

    _initResultList() {
        this.resultList = {
            result1: null,
            result2: null,
            result3: null
        }
    }

    initParamsForm(typeParams) {
        let form = new FormData();
        form.append('api_key', AUTH_PARAMS.API_KEY);
        form.append('api_secret', AUTH_PARAMS.API_SECRET);
        Object.keys(typeParams).forEach(key => {
            form.append(key, typeParams[key])
        })
        return form
    }

    // detectTpl(_base64, num) {
    //     if (this.tplList[num].rect) return;
    //     let form = initParamsForm({ image_base64: _base64 })
    //     return axios.post(FACE_API.DETECT, form)
    //         .then(res => {
    //             let result = res.data
    //             if (!result.error_message) {
    //                 if (result['faces'].length > 0) {
    //                     let rect = result['faces'][0]['face_rectangle']
    //                     rect['top'] = parseInt(rect['top'])
    //                     rect['left'] = parseInt(rect['left'])
    //                     rect['width'] = parseInt(rect['width'])
    //                     rect['height'] = parseInt(rect['height'])
    //                     this.tplList[num].rect = `${rect['top']},${rect['left']},${rect['width']},${rect['height']}`
    //                     return Promise.resolve(this.tplList[num].rect)
    //                 }
    //             } else {
    //                 console.log('detectTpl', result)
    //             }
    //         })
    //         .catch(err => {
    //             console.log(err)
    //             return Promise.reject()
    //         })
    // }

    selectTpl(num) {
        let tpl = this.tplList[num]['origin'];
        if (!tpl) {
            this.getImgBase64(num)
        }
    }

    getImgBase64(num, isOrigin = true) {
        let tempType = {
            0: 'origin',
            1: 'style1',
            2: 'style2',
            3: 'style3'
        }
        let tempUrl = isOrigin ? 'origin_list' : 'result_list';
        return axios.get(require(`@imgs/${tempUrl}/tpl_${num}.jpg`), { responseType: 'blob' })
            .then(res => {
                return _getImgBase64(res.data);
                // return this.tplList[tempType[num]] = _getImgBase64(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        function _getImgBase64(source) {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.readAsDataURL(source);
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
            });
        }
    }

    async merge(num, style, _base64) {
        // TODO 靠第二个参数控制合哪个
        const a = await this.getImgBase64(1);
        let form = this.initParamsForm({
            template_base64: a,
            template_rectangle: this.tplList[num].rect,
            merge_base64: _base64,
            merge_rate: window.mergeRate || 66,
        })

        return axios.post(FACE_API.MERGE, form)
            .then(res => {
                let result = res.data;
                if (!result.error_message) {
                    // this.resultList[`result${num}`] = 'data:image/jpeg;base64,' + res.data.result;
                    return Promise.resolve('data:image/jpeg;base64,' + res.data.result);
                }
                // TODO 写一个错误对象，处理错误，特别处理403※
            })
            // .catch(err => {
            //     console.log('mergeface', err);
            //     this.loading = false;
            // });
    }
}


export default {
    install: function install(Vue) {
        const face = new Face();
        Vue.prototype.$face = face;
    }
}
