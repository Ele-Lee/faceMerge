<template>
    <section class='loading'>
        <!-- <div class="loading__logo"></div> -->
        <div class='loading__bar'>
            <div class="loading__bar__content" :style='{width: width}'></div>
        </div>
    </section>
</template>
<script>
    import Preload from '@common/preload';
    export default {
        name: 'Loading',
        data() {
            return {
                width: '0%'
            };
        },
        async mounted() {
            baidu('page2', 'loading', '进入加载页');
            new Preload(this)
                .onProgress(this.onPreloadProgress)
                .onComplete(this.onPreloadComplete)
                .start();
        },
        methods: {
            onPreloadProgress(progress) {
                progress = Math.min(100, Math.max(0, progress));
                this.width = `${progress}%`;
            },
            onPreloadComplete() {
                this.width = '100%';
                this.$bus.ready = true;
                setTimeout(() => {
                    // 等300毫秒再跳转，因为进度条动画是300毫秒
                    this.$router.replace('home');
                }, 300);
            }
        }
    };
</script>
<style lang='scss'>
    .loading {
        @include full-screen;
        background: #fff;
        &__logo {
            width: 2.82rem;
            height: 3.2rem;
            margin: 3.2rem auto 1rem;
            @include contain-bg('~@imgs/loading.png');
        }
        &__bar {
            position: absolute;
            left: 1.25rem;
            top: 55%;
            background-color: $white;
            width: 5rem;
            height: 10px;
            margin: 0 auto;
            border-radius: 10px;
            overflow: hidden;
            &__content {
                height: 100%;
                border-radius: 10px;
                background-color: #b0181f;
                transition: width 0.3s;
            }
        }
    }
</style>
