import Vue from 'vue'
import Router from 'vue-router'
import Preload from '@pages/Preload'
import Home from '@pages/Home'
import Upload from '@pages/Upload'
import Posters from '@pages/Posters'

export default () => {
    Vue.use(Router);
    const router = new Router({
        routes: [{
            path: '/',
            name: 'preload',
            component: Preload
        }, {
            path: '/home',
            name: 'home',
            component: Home
        }, {
            path: '/upload',
            name: 'upload',
            component: Upload
        }, {
            path: '/posters',
            name: 'posters',
            component: Posters
        }]
    })

    // 禁止越过loading页
    router.beforeEach((to, from, next) => {
        if (to.meta !== 'noGuard' && to.name !== 'preload' && !Vue.prototype.$bus.ready) {
            next({ path: '/', replace: true })
        }
        next()
    })

    return router
};
