<template>
    <div :class="$style.home">
        <header :class="$style.header"></header>
        <main :class="$style.cover"></main>
        <p :class="$style.ask">与成大同行，你是</p>
        <div :class="$style['btn-box']">
            <button :class="[$style['button'], $style['boy']]" @click="next(1)"></button>
            <button :class="[$style['button'], $style['girl']]" @click="next(0)"></button>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'home',
        data() {
            return {};
        },
        created() {
            this.initWxShare()
        },
        beforeMount() {
            baidu('page2', 'home', '进入首页')
        },
        mounted() {
            this.$bus.needMergeBase64 = '';
        },
        methods: {
            next(type) {
                baidu('btn2', 'enterUpload', type ? '选男生' : '选女生');

                this.$bus.sex = type;
                this.$router.replace({ name: 'upload' });
            },
            /**
             * 微信分享相关
             * */
            initWxShare() {
                // 分享文案
                let opts = {
                    title: '与成大同行，我是封面人物！',
                    desc: '新时代 再出发！',
                    link: window.location.href.split('#')[0].split('?')[0],
                    imgUrl: require('@imgs/share_icon.png')
                };
                this.$wxsdk.share(opts);
            }
        }
    };
</script>
<style module lang='scss'>
    .home {
        @include full-screen;
        background-color: #ac181f;
        .header {
            width: 100%;
            height: 0.32rem;
            @include contain-bg('@imgs/text.png');
        }
        .cover {
            width: 6.8rem;
            height: 8.96rem;
            margin-left: 0.5rem;
            margin-top: 0.86rem;
            @media screen and (min-aspect-ratio: 375/667) {
                /* 非IX样式 */
                margin-top: 0.6rem;
            }
            @include contain-bg('@imgs/cover.png');
        }
        .ask {
            width: auto;
            height: 0.34rem;
            margin: 0.1rem auto 0.82rem;
            text-align: center;
            font-size: 0.34rem;
            font-weight: 900;
            color: #ffb8bb;
            font-family: 'SimHei';
            @media screen and (min-aspect-ratio: 375/667) {
                /* 非IX等畸形屏样式 */
                margin: -0.5rem auto 0.28rem;
            }
            /* @include contain-bg('@imgs/ask.png') */
        }
        .btn-box {
            text-align: center;
            font-size: 0;
        }
        .button {
            display: inline-block;
            width: 2.04rem;
            height: 0.88rem;
            &.boy {
                margin-right: 1.28rem;
                @include contain-bg('@imgs/btn_boy.png');
            }
            &.girl {
                width: 2.04rem;
                height: 0.88rem;
                @include contain-bg('@imgs/btn_girl.png');
            }
        }
    }
</style>
