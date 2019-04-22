<template>
    <div :class="$style.upload">
        <header :class="$style.header"></header>
        <div :class="$style.logo"></div>
        <main :class="$style['box--input']">
            <input :class="$style.input" @change="selectImg2Merge" type="file" id="imgUpload" capture="album">
            <label :class="[$style.label]" @touchend="triggerInput">
                <img :class="$style.img" :src="mergeImg" v-if="mergeImg" width="100%" height="auto">
            </label>
        </main>
        <section :class="$style['box--model']">
            <div :class="[$style.model, select == n ? $style.cover : '']" v-for="n in 2" :key="n"
                @touchend="selectHandler(n, n+type*2)">
                <!-- <div :class="[select !== n ? $style.cover : '']"></div> -->
                <img :src="require(`@imgs/origin_list/tpl_${n+type*2}.jpg`)" alt="" width="100%"
                    height="auto">
            </div>
        </section>
        <!-- <p :class="$style['hint']">请先选择模板图</p> -->
        <section :class="$style['box--btn']">
            <button :class="$style.button" @touchend="reUpload">{{mergeImg ? '重新上传': '上传图片'}}</button>
            <button :class="$style.button" @touchend="next">下一步</button>
        </section>
        <cc-mask v-if="maskSwitcher" @closeMask="closeMask" @sure="beSure"></cc-mask>
    </div>
</template>

<script>
    import ccMask from '@components/Mask';
    import { isIos } from '@/common/util';
    export default {
        name: 'unload',
        data() {
            return {
                mergeImg: '',
                // 如果是1，男生，0是女生
                type: this.$bus.sex,
                select: Number,
                maskSwitcher: false,
                originMergedResult: {
                    1: '',
                    2: ''
                },
                // 重新上传
                reUploadKey: false,
                selectKey: false
            };
        },
        created() {},
        beforeMount() {
            baidu('page2', 'upload', '进入上传页');

            this.select = 1;
            this.$bus.modelNum = this.type * 2 +1;
            this.originMergedResult = { 1: '', 2: ''};
        },
        mounted() {
        },
        methods: {
            beSure() {
                this.$bus.$emit('showAlertLoading');
                this.$api.merge({ base64: this.$bus.needMergeBase64, num: this.$bus.modelNum, style: (this.$bus.modelNum - 1) * 4 + 1 }).then(e => {
                    this.$bus.$emit('hideAlertLoading');
                    if(e === '0') return;
                    baidu('btn2', 'mergeImg', `融合海报_${this.$bus.modelNum}_1`);
                    this.$bus.result1Base64 = e;
                    this.$router.replace('posters');
                });
                // if (window.history && window.history.pushState) {
                //     window.history.pushState({}, '');
                //     window.history.back();
                // }
            },
            closeMask() {
                this.maskSwitcher = false;
            },
            async reUpload() {
                if (!this.$bus.modelNum) {
                    return this.$bus.$emit('alert', '请先选择要融合模板图', 'big');
                }
                this.reUploadKey = true;
                this.originMergedResult = { 1: '', 2: ''};
                if(!isIos()) {
                    document.querySelector('#imgUpload').click();
                    return;
                }

                // 苹果用WXSDK
                this.resetSelectKey();
                this.$bus.needMergeBase64 = await this.$wxsdk.getImage();
                baidu('btn2', 'uploadImg', '上传了照片');
                this.selectKey = true;
                let img = new Image();
                img.onload= ()=> {
                    let minSize = 200 * 200;
                    let maxSize = 4096 * 4096;
                    if(/jgp/.test(this.$bus.needMergeBase64.slice(0, 20))) {
                        this.$bus.needMergeBase64 = this.$bus.needMergeBase64.replace('jgp', 'jpeg')
                    }
                    if (!/jpeg|jpg/.test(this.$bus.needMergeBase64.slice(0, 20))) {
                        return alert('不是有效的jpeg图片文件!');
                    }
                    if (img.width * img.height < minSize) {
                        return alert('图片不能小于200*200像素');
                    }
                    if (img.width * img.height > maxSize) {
                        return alert('图片不能大于4096*4096像素');
                    }
                    this.$bus.$emit('showAlertLoading');
                    this.selectImg2Merge(null)
                }
                img.src = this.$bus.needMergeBase64;
            },
            selectHandler(currentNum, imgNum) {
                if(this.selectKey) return;
                const oldNum = this.select;
                this.select = currentNum;
                this.$bus.modelNum = imgNum;
                // 重新上传或者没有融合过才需要请求融合
                if (!this.originMergedResult[currentNum] && this.$bus.needMergeBase64 ) {
                    this.$bus.$emit('showAlertLoading');
                    this.mergeTpl();
                } else {
                    this.mergeImg = this.originMergedResult[currentNum];
                }
            },
            triggerInput() {
                this.reUpload();
            },
            resetSelectKey(cb) {
                setTimeout(()=> {
                    this.selectKey = false;
                    cb && cb();
                }, 800)
            },
            async selectImg2Merge(event) {
                if(event) {
                    let file = event.target.files[0];
                    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                        this.resetSelectKey();
                        return alert('不是有效的jpeg图片文件!');
                    }
                    this.$bus.$emit('showAlertLoading');
                    this.selectKey = true;
                    await this.getImgBase64(file);
                    event.target.value = '';
                }

                if(!this.reUploadKey && this.originMergedResult[this.select]) {
                    this.mergeImg = this.originMergedResult[this.select]
                } else {
                    this.mergeTpl();
                }
            },
            async mergeTpl() {
                await this.$api.merge({ base64: this.$bus.needMergeBase64, num: this.$bus.modelNum, style: (this.$bus.modelNum-1) * 4 })
                        .then(e => {
                            this.reUploadKey = false;
                            if(e === '0' || e == '') return;
                            baidu('btn2', 'mergeImg', `融合原始图${this.$bus.modelNum}`);
                            this.originMergedResult[this.select] = e;
                            return this.mergeImg = e
                        })
                        .catch(err => {
                            // TODO 状态码
                            // CONCURRENCY_LIMIT_EXCEEDED 403
                            this.$bus.$emit('alert', '图片有误');
                            console.log('elelee test: 图片有误', err);
                        });
                this.resetSelectKey(()=>{
                    this.$bus.$emit('hideAlertLoading');
                });
            },
            // 安卓走input event获取图片
            getImgBase64(source) {
                return new Promise((resolve, reject) => {
                    let reader = new FileReader();
                    reader.readAsDataURL(source);
                    reader.onload = e => {
                        let img = new Image();
                        img.onload= ()=> {
                            let minSize = 200 * 200;
                            let maxSize = 4096 * 4096;
                            if (img.width * img.height < minSize) {
                                this.$bus.$emit('hideAlertLoading');
                                return alert('图片不能小于200*200像素');
                            }
                            if (img.width * img.height > maxSize) {
                                this.$bus.$emit('hideAlertLoading');
                                return alert('图片不能大于4096*4096像素');
                            }

                            this.$bus.needMergeBase64 = e.target.result;
                            baidu('btn2', 'uploadImg', '上传了照片');
                            resolve(e.target.result);
                        }
                        img.src = e.target.result;
                    };
                });
            },
            next() {
                if (!this.mergeImg) {
                    return this.$bus.$emit('alert', '请先上传图片');
                }
                baidu('btn2', 'enterPosters', '进入海报页');

                this.maskSwitcher = true;
            }
        },
        components: { ccMask }
    };
</script>

<style module lang="scss">
    .upload {
        $borColor: #801015;
        @include full-screen;
        background-color: #ef7d5b;
        background-image: url('@imgs/building.png');
        background-position: 100% 100%;
        /* background-size: 3.1rem 2.3rem; */
        background-size: 5.1rem auto;
        background-repeat: no-repeat;
        .header {
            width: 100%;
            height: 0.32rem;
            @include contain-bg('@imgs/text.png');
        }
        .logo {
            position: fixed;
            top: 0.5rem;
            left: 0.48rem;
            width: 1.09rem;
            height: 1.09rem;
            z-index: 30;
            @include cover-bg('@imgs/logo1.png');
        }
        .box--input {
            font-size: 0;
            /* @media screen and (min-aspect-ratio: 375/667) {
                margin: 0.2rem auto 0;
            } */
            margin: 5% auto 0;
            /* width: 5.38rem; */
            /* height: 6.3rem; */
            width: 6.2rem;
            height: 7.2rem;
            position: relative;
            @include cover-bg('@imgs/upload.png');
            .label {
                position: absolute;
                top: -0.5rem;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto;
                width: 5.14rem;
                height: 6.2rem;
                /* width: 4.46rem; */
                /* height: 5.38rem; */
                font-size: 0;
                overflow: hidden;
            }
            .input {
                visibility: hidden;
            }
        }
        .box--model {
            @media screen and (min-aspect-ratio: 375/667) {
                /* 非IX等畸形屏样式 */
                margin-top: -0.1rem;
            }
            margin-top: 0.16rem;
            font-size: 0;
            text-align: center;
            .model {
                position: relative;
                display: inline-block;
                box-sizing: border-box;
                height: 2.2rem;
                width: 1.92rem;
                border: 0.06rem solid transparent;
                border-radius: 0.07rem;
                font-size: 0;
                z-index: 10;
                overflow: hidden;
                &:first-child {
                    float: left;
                    margin-left: 1.2rem;
                }
                &:last-child {
                    float: right;
                    margin-right: 1.2rem;
                }
                &.cover {
                    /* position: absolute; */
                    /* margin-left: 1.2rem; */
                    /* top: 0; */
                    /* left: 0; */
                    /* height: 2.2rem; */
                    /* width: 1.92rem; */
                    /* height: 120%; */
                    /* width: 100%; */
                    border: .06rem solid #a00107;
                    box-shadow: 0 0 20px 3px rgba(183, 9, 9, 0.75);
                    /* opacity: 0.65; */
                    /* z-index: 1; */
                }
            }
        }
        .hint {
            @media screen and (min-aspect-ratio: 375/667) {
                /* 非IX等畸形屏样式 */
                margin-top: 0.16rem;
            }
            margin-top: 0.32rem;
            margin-bottom: 0.2rem;
            text-align: center;
            font-size: 0.24rem;
            font-weight: 800;
            color: #b74b3b;
        }
        .box--btn {
            @media screen and (min-aspect-ratio: 375/667) {
                /* 非IX等畸形屏样式 */
                margin-top: 2.6rem;
            }
            margin-top: 3.2rem;
            text-align: center;
            font-size: 0;
            z-index: 10;
            clear: both;
            .button {
                width: 1.98rem;
                height: auto;
                line-height: 0.54rem;
                font-size: 0.32rem;
                font-weight: 800;
                border: 0.045rem solid $borColor;
                color: $borColor;
                background-color: #f8987c;
                &:first-child {
                    margin-right: 1.2rem;
                }
            }
        }
    }
</style>
