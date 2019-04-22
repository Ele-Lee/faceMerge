<template>
    <div id="app">
        <transition name="turn-on">
            <router-view></router-view>
        </transition>
        <cc-toast></cc-toast>
    </div>
</template>

<script>
    import ccToast from '@components/Toast';
    export default {
        created() {
            let visProp = this.getHiddenProp();
            this.evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
            document.addEventListener(this.evtname, this.visibilityChange, false);
        },
        beforeDestroy() {
            document.removeEventListener(this.evtname, this.visibilityChange, false);
        },
        methods: {
            getHiddenProp() {
                var prefixes = ['webkit', 'moz', 'ms', 'o'];
                // if 'hidden' is natively supported just return it
                if ('hidden' in document) {
                    return 'hidden';
                }
                // otherwise loop over all the known prefixes until we find one
                for (var i = 0; i < prefixes.length; i++) {
                    if (prefixes[i] + 'Hidden' in document) {
                        return prefixes[i] + 'Hidden';
                    }
                }
                // otherwise it's not supported
                return null;
            },
            getVisibilityState() {
                var prefixes = ['webkit', 'moz', 'ms', 'o'];
                if ('visibilityState' in document) return 'visibilityState';
                for (var i = 0; i < prefixes.length; i++) {
                    if (prefixes[i] + 'VisibilityState' in document) {
                        return prefixes[i] + 'VisibilityState';
                    }
                }
                // otherwise it's not supported
                return null;
            },
            visibilityChange() {
                switch (document[this.getVisibilityState()]) {
                    case 'visible':
                        console.log('页面显示');
                        break;
                    case 'hidden':
                    default:
                        console.log('页面隐藏');
                        break;
                }
            }
        },
        components: {
            ccToast
        }
    };
</script>

<style lang="scss">
    .header {
        width: 100%;
        height: 0.32rem;
        @include contain-bg('~@imgs/text.png');
    }
</style>
