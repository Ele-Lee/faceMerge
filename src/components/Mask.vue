<!--
    @touchstart.prevent 是防止点击穿透，插槽内所有点击缓存touchend,不能滑动！！！
 -->
<template>
    <transition name="fade">
        <div class="masking" @touchstart.prevent :style="`background: ${rgba}`" @touchend="closeMask">
            <main class="masking__main" @touchend.stop ref="maskMain">
                <input type="text" class="input" placeholder="请输入您的名字" maxlength="7" @touchend="clickInput" v-model="name"
                    ref="input">
                <div class="input-after"></div>
                     <button class="sure" @touchend="beSure">确定</button>
                <div class="sure-after"></div>
            </main>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'masking',
        props: {
            maskColor: {
                type: String,
                default: '#000000'
            },
            maskAlpha: {
                type: String,
                default: '0.6'
            },
            size: {
                type: String,
                default: 'small'
            }
        },
        data() {
            return {
                name: '',
                rgba: '(0,0,0,0.8)'
            };
        },
        mounted() {
            this.$bus.name && (this.name = this.$bus.name);
        },
        watch: {
            name(val) {
                this.$bus.name = val
            }
        },
        methods: {
            clickInput() {
                let u = navigator.userAgent, app = navigator.appVersion;
                let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                if (isiOS) {
                    window.setTimeout(function(){
                        window.scrollTo(0,0);
                    }, 500);
                    this.$refs.maskMain.style.top = '30%'
                }
                this.$refs.input.focus();
            },
            beSure() {
                if (!this.name) {
                    return this.$bus.$emit('alert', '请输入昵称');
                }
                this.$emit('sure', true);
            },
            closeMask() {
                this.$emit('closeMask');
                let u = navigator.userAgent, app = navigator.appVersion;
                let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                if (isiOS) {
                    window.setTimeout(function(){
                        window.scrollTo(0, document.body.clientHeight);
                    }, 500);
                    this.$refs.maskMain.style.top = '60%';
                }
            },
            hexToRgba(hex, opacity) {
                let _hex = hex.substr(1);
                if (_hex.length == 3) {
                    let temp = [];
                    let _hexArr = _hex.split('');
                    for (let i in _hexArr) {
                        temp[i] = _hexArr[i] + _hexArr[i];
                    }
                    _hex = temp.join('');
                }
                return (
                    'rgba(' +
                    parseInt('0x' + _hex.slice(0, 2)) +
                    ',' +
                    parseInt('0x' + _hex.slice(2, 4)) +
                    ',' +
                    parseInt('0x' + _hex.slice(4, 6)) +
                    ',' +
                    opacity +
                    ')'
                );
            }
        },
        created() {
            this.rgba = this.hexToRgba(this.maskColor, this.maskAlpha);
        }
    };
</script>

<style lang="scss">
    .masking {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        z-index: 30;
        content: ' ';
        .masking__main {
            position: absolute;
            top: 60%;
            left: 1.75rem;
            /* margin: 0 auto;
            margin-top: 6rem; */
            width: 4rem;
            height: 2.2rem;
            font-size: 0.3rem;
            .input {
                position: absolute;
                left: 0.1rem;
                top: 0;
                box-sizing: border-box;
                display: block;
                width: 3.72rem;
                height: 0.64rem;
                line-height: 0.64rem;
                color: #741013;
                text-align: center;
                /* text-indent: 1em; */
                border: 0.04rem solid #ffa286;
                border-radius: 0.2rem;
                background: #f87047;
                z-index: 1;
                &::placeholder {
                    color: #741013;
                }
            }
            .input-after {
                position: absolute;
                top: 0.1rem;
                left: 0.2rem;
                box-sizing: border-box;
                width: 3.72rem;
                height: 0.64rem;
                display: block;
                border: 0.04rem solid #ffa286;
                border-radius: 0.2rem;
                background: transparent;
                content: '';
            }
            .sure {
                position: absolute;
                top: 1.5rem;
                left: 1.4rem;
                height: 0.5rem;
                width: 1.32rem;
                color: #741013;
                border: 0.04rem solid #ffa286;
                border-radius: 0.1rem;
                background: #f87047;
                z-index: 1;
            }
            .sure-after {
                position: absolute;
                top: 1.56rem;
                left: 1.46rem;
                height: 0.5rem;
                width: 1.32rem;
                border: 0.04rem solid #ffa286;
                border-radius: 0.1rem;
                background: transparent;
            }
        }
    }
</style>
