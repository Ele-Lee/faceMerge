<template>
    <div :class="$style.posters">
        <!-- <img :src="downloadResult[styleIndex]" :class="$style['download-img2']" id="wrapper2"> -->
        <div :class="$style.wrapper" id="wrapper">
            <main :class="$style['poster-box']" id="postersBox" ref="postersBox">
                <article :class="$style['poster']" v-for="n in 3" :key="n">
                    <img :src="mergeResult[n]" :class="$style['show-img']">
                    <div :class="$style['text-box']">
                        <img :src="require(`@imgs/style_text/text_${n}_${textIndex}.png`)" :class="$style[`text_${n}_${textIndex}`]"
                            :style="`top:${coordList[n][textIndex-1][1]/100*fsRatio}px;left:${coordList[n][textIndex-1][0]/100*fsRatio}px`">
                    </div>
                    <img :src="downloadResult[n]" :class="$style['download-img']">

                    <!-- <img :src="b" :class="$style['show-img']" alt="" v-if="b && n==1"> -->
                </article>
            </main>
        </div>
        <p :class="$style['save-hint']" >- 长按可保存图片至相册 -</p>
        <section :class="$style['indicator-box']">
            <span :class="[$style.indicator, n == styleIndex ? $style['selected']: '']" v-for="n in 3"
                :key="n"></span>
        </section>
        <p :class="$style['hint']">左右滑动切换封面样式</p>
        <section :class="$style['box--btn']">
            <button :class="$style.button" @touchend="goHome">再玩一次</button>
            <button :class="$style.button" @touchend="changeText">换句祝福</button>
        </section>
    </div>
</template>

<script>
    import HScroll from '@common/HScroll';
    export default {
        name: 'posters',
        data() {
            return {
                b: '',
                // 这个要测试小屏幕手机 TODO
                fsRatio: window.fsRatio,
                styleIndex: 1,
                textIndex: 1,
                mergeResult: {
                    1: '',
                    2: '',
                    3: ''
                },
                downloadResult: {
                    1: '',
                    2: '',
                    3: ''
                },
                // 下标0是二维码的位置，1，2，3分别是对应风格海报的文字位置,数组内0-2(index-1)对应不同style的位置
                coordList: {
                    0: [[518, 736], [518, 736], [518, 756]],
                    1: [[544, 284], [564, 280], [554, 274]],
                    2: [[440, 450], [420, 460], [415, 450]],
                    3: [[44, 476], [36, 476], [44, 476]]
                },
                scrollKey: false,
            };
        },
        async created() {
            // this.mergeResult[1] = await this.drawImage(this.$bus.result1Base64);
            [this.mergeResult[1], this.downloadResult[1]] = await this.drawImage(this.$bus.result1Base64, null, this.styleIndex);
        },
        beforeMount() {
            baidu('page2', 'posters', '进入海报页');
        },
        async mounted() {
            this.initScroll();

            // let canvas = document.createElement('canvas');
            // canvas.width = this.$bus.canvasWidth;
            // canvas.height = this.$bus.canvasHeight;
            // let _poster = new Image();
            // _poster.crossOrigin = 'Anonymous';
            // _poster.onload = async () => {
            //     let ctx = canvas.getContext('2d');
            //     ctx.drawImage(_poster, 0, 0, canvas.width, canvas.height);
            //     await this.drawName(ctx)
            //     await this.drawPart(ctx, canvas, require('@imgs/qrcode.png'), 0, 3);
            //     await this.drawPart(ctx, canvas, require(`@imgs/style_text/text_3_1.png`), 3, 1);
            //     this.b = canvas.toDataURL('image/jpeg');
            // };
            // _poster.src = require('@imgs/result_list/style3_1.jpg');
        },
        methods: {
            drawName(ctx, num = this.styleIndex) {
                return new Promise((resolve, reject) => {
                    const namePosition = {
                        1: [552, 160, '#c1a55f', "900 35px/35px SimHei"],
                        2: [536, 365, '#ac191e', "900 35px/35px SimHei"],
                        3: [146, 420, '#c1a55f', '900 40px/40px SimHei']
                    }
                    ctx.textAlign = "center";
                    ctx.font = namePosition[num][3];
                    ctx.fillStyle = namePosition[num][2]
                    ctx.fillText(this.$bus.name, namePosition[num][0], namePosition[num][1])
                    resolve()
                })
            },
            initScroll() {
                new HScroll()
                    .setMinStartX(30)
                    .setMinDistance(15)
                    .setup(document.getElementById('wrapper'))
                    .listen({
                        onEnd: dir => this.scrollingBox(dir)
                    });
            },
            async scrollingBox(dir) {
                if(this.scrollKey) return;
                this.scrollKey = true;
                const oldIndex = this.styleIndex;
                this.styleIndex = Math.max(Math.min(this.styleIndex - dir, 3), 1);
                let tempStyleIndex = this.styleIndex;
                if(!this.mergeResult[tempStyleIndex]){
                    const result = await this.mergeOtherPoster(tempStyleIndex);
                    if(result === 'fail') {
                        this.styleIndex--;
                        return
                    } else {
                        [this.mergeResult[tempStyleIndex], this.downloadResult[tempStyleIndex]] = result;
                    }
                }
                // this.styleIndex = tempStyleIndex;
                // console.log('elelee test: index', this.styleIndex , tempStyleIndex);
                this.$refs['postersBox'].classList.remove(this.$style[`transform${oldIndex}`]);
                this.$refs['postersBox'].classList.add(this.$style[`transform${this.styleIndex}`]);
                setTimeout(()=> {
                    this.scrollKey = false;
                }, 1500)
            },
            mergeOtherPoster() {
                this.$bus.$emit('showAlertLoading');
                return this.$api.merge({ base64: this.$bus.needMergeBase64, num: this.$bus.modelNum, style: (this.$bus.modelNum - 1) * 4 + this.styleIndex })
                    .then(async e => {
                        this.$bus.$emit('hideAlertLoading');
                        if(e === '0' || e == '') {
                            return 'fail';
                        }
                        baidu('btn2', 'mergeImg', `融合海报_${this.$bus.modelNum}_${this.styleIndex}`);
                        return await this.drawImage(e, null);
                    })
                    .catch((err) => {
                        this.$bus.$emit('hideAlertLoading');
                        console.log('elelee test: mergeOtherPoster', err);
                        // error_message
                    });
                // return this.$face.merge(1, null, this.$bus.needMergeBase64).then(e => {
                //     this.$bus.$emit('hideAlertLoading');
                //     return this.drawImage(e);
                // });
            },
            goHome() {
                baidu('btn2', 'goBackHome', `再玩一次`);
                this.$router.replace('home')
            },
            async changeText() {
                this.$bus.$emit('showAlertLoading');
                this.textIndex = this.textIndex++ >= 3 ? 1 : this.textIndex++;
                this.downloadResult[this.styleIndex] = await this.drawImage(this.mergeResult[this.styleIndex], true);
                baidu('btn2', 'changeText', `换祝福语${this.textIndex}`);
                this.$bus.$emit('hideAlertLoading');
            },
            async drawImage(resultBase64, justGetDownloadImg = false) {
                return new Promise(async (resolve, reject) => {
                    let _poster = new Image();
                    // _poster.crossOrigin = 'Anonymous';
                    _poster.onload = async () => {
                        let showImgCanvas = this._initCanvas(_poster);
                        let _downloadImgCanvas = this._initCanvas(_poster);

                        await this.drawName(showImgCanvas.getContext('2d'));
                        await this.drawName(_downloadImgCanvas.getContext('2d'));

                        await this.callSameCtx(_downloadImgCanvas, require('@imgs/qrcode2.png'), 0, this.styleIndex); //二维码
                        let _name = `text_${this.styleIndex}_${this.textIndex}.png`
                        await this.callSameCtx(
                            _downloadImgCanvas,
                            require('@imgs/style_text/' + _name),
                            this.styleIndex,
                            this.textIndex
                        );

                        justGetDownloadImg
                            ? resolve(_downloadImgCanvas.toDataURL('image/jpeg'))
                            : resolve([showImgCanvas.toDataURL('image/jpeg'), _downloadImgCanvas.toDataURL('image/jpeg')]);
                        // this.poster1 = canvas.toDataURL('image/jpeg');
                    };
                    _poster.src = this.base64toBlob(resultBase64);
                });

            },
            base64toBlob(base64) {
                var arr = base64.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return URL.createObjectURL(new Blob([u8arr], {
                    type: mime
                }));
            },
            _initCanvas(_poster) {
                let canvas = document.createElement('canvas');
                canvas.useCORS = true;
                canvas.width = this.$bus.canvasWidth;
                canvas.height = this.$bus.canvasHeight;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(_poster, 0, 0, canvas.width, canvas.height);
                return canvas;
            },
            async callSameCtx(canvas, url, style, index) {
                let ctx = canvas.getContext('2d');
                // ...arguments
                await this.drawPart(ctx, canvas, url, style, index);
            },
            async drawPart(ctx, canvas, url, style, index) {
                // 下标0是二维码的位置，1，2，3分别是对应风格海报的文字位置,数组内0-2(index-1)对应不同style的位置
                let [_x, _y] = this.coordList[style][index - 1];
                let _img = new Image();
                // _img.crossOrigin = 'Anonymous';
                return new Promise((resovle, reject) => {
                    _img.onload = () => {
                        ctx.drawImage(_img, _x, _y, _img.width, _img.height);
                        resovle(1);
                    };
                    _img.src = this.base64toBlob(url);
                });
            }
        }
    };
</script>

<style module lang='scss'>
    .transform1 {
        transform: translateX(0rem);
    }
    .transform2 {
        transform: translateX(-7.5rem);
    }
    .transform3 {
        transform: translateX(-15rem);
    }
    $posterHeight: 8.83rem;
    .download-img2 {
        position: fixed;
        width: 6.38rem;
        height: $posterHeight;
        @media screen and (min-aspect-ratio: 375/667) {
                    /* 非IX等畸形屏样式 */
            top: 0.2rem;
        }
        top: 0.98rem;
        left: 50%;
        opacity: 1;
        transform: translateX(-50%);
        z-index: 400;
    }
    .posters {
        @include full-screen;
        $borColor: #801015;
        $selectedColor: #b74b3b;
        background-color: #ef7d5b;
        background-image: url('@imgs/building.png');
        background-position: 100% 100%;
        background-size: 3.1rem 2.3rem;
        background-repeat: no-repeat;
        .building {
            position: fixed;
            right: 0;
            bottom: 0;
            width: 3.1rem;
            height: 2.3rem;
            z-index: 0;
            @include contain-bg('@imgs/building.png');
        }
        .hint {
            margin-top: 0.16rem;
            margin-bottom: 0.2rem;
            text-align: center;
            font-size: 0.24rem;
            font-weight: 800;
            color: #6f251a;
        }
        .box--btn {
            /* margin-top: 0.3rem; */
            text-align: center;
            font-size: 0;
            .button {
                /* display: inline-block; */
                /* box-sizing: border-box; */
                width: 1.98rem;
                height: auto;
                line-height: 0.54rem;
                font-size: 0.32rem;
                font-weight: 800;
                border: 0.045rem solid $borColor;
                color: $borColor;
                background-color: #f8987c;
                &:first-child {
                    margin-right: 0.6rem;
                }
            }
        }
        .save-hint {
            margin-top: 0.16rem;
            font-size: 0.24rem;
            text-align: center;
            /* color: #cc0000; */
            color: #fff;
        }
        .indicator-box {
            width: 2.6rem;
            height: 0.22rem;
            margin: 0.16rem auto 0;
            text-align: center;
            font-size: 0;
            clear: both;
            content: '';
            .indicator {
                display: inline-block;
                width: 0.18rem;
                height: 0.18rem;
                border-radius: 50%;
                background: #ffd0c2;
                &.selected {
                    background: #b51f09 !important;
                }
                &:nth-child(2) {
                    margin: 0 0.2rem;
                }
            }
            .selected {
                background: $selectedColor !important;
            }
        }
        .wrapper {
            height: $posterHeight;
            width: 7.5rem;
            .poster-box {
                width: 22.5rem;
                @media screen and (min-aspect-ratio: 375/667) {
                    /* 非IX等畸形屏样式 */
                    margin-top: 0.2rem;
                }
                margin-top: 0.98rem;
                height: $posterHeight;
                transition: transform 1s;
                .poster {
                    float: left;
                    width: 33.33%;
                    position: relative;
                    /* box-sizing: border-box; */
                    width: 6.38rem;
                    height: $posterHeight;
                    /* padding: 0 0.7rem; */
                    margin-left: 0.55rem;
                    margin-right: 0.55rem;
                    .show-img {
                        width: 100%;
                        height: auto;
                        box-shadow: 0rem 0.02rem 0.4rem 0.01rem rgba($color: #000000, $alpha: 0.1);
                    }
                    .download-img {
                        position: absolute;
                        width: 100%;
                        height: auto;
                        top: 0;
                        left: 0rem;
                        opacity: 0;
                        z-index: 300;
                    }
                    .text-box {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 8.83rem;
                        img {
                            position: absolute;
                            height: auto;
                            /* transform: all 1s; */
                        }
                        .text_1_1 {
                            width: 0.63rem;
                        }
                        .text_1_2 {
                            width: 0.39rem;
                        }
                        .text_1_3 {
                            width: 0.51rem;
                        }
                        .text_2_1 {
                            width: 1.82rem;
                        }
                        .text_2_2 {
                            width: 2.05rem;
                        }
                        .text_2_3 {
                            width: 2.07rem;
                        }
                        .text_3_1 {
                            width: 2.27rem;
                        }
                        .text_3_2 {
                            width: 2.32rem;
                        }
                        .text_3_3 {
                            width: 2.2rem;
                        }
                    }
                }
            }
        }
    }
</style>
