import { isWeixinBrowser } from './util'
import {Howl, Howler} from '@static/js/howler.min.js'

class AudioUtil {
    constructor() {
        this.audioList = {}
        this.muted = false
        this.loadListener = null
        this.loaded = 0
        this.preloadLen = 0
    }

    /**
     * 添加音频接在进度监听
     * @param {*} listener 
     */
    addLoadListener(listener) {
        this.loadListener = listener
        return this
    }

    /**
     * 加载音频列表
     * @param {*} list 
     */
    load(list = {}) {
        if(Object.keys(list).length <= 0) {
            this.loadListener && this.loadListener(0)
            return
        }
        Object.keys(list).forEach(key=> {
            const audio = list[key]
            let params = {
                src: audio.src,
                onplay: (id)=> {
                    // 播放成功会有id，保存起来，下次直接播放该id，避免重复播放
                    this.audioList[key].id = id
                },
                onload: ()=> {
                    this.loaded++
                    if (!audio.noPreload) {
                        this.preloadLen++
                        this.loadListener && this.loadListener(this.preloadLen)
                    }
                },
                onloaderror: (id)=> {
                    this.loaded++
                    this.audioList[key].loaderror = true
                    console.log('music loaderror', key)
                    if (!audio.noPreload) {
                        this.preloadLen++
                        this.loadListener && this.loadListener(this.preloadLen)
                    }
                }
            }
            if (audio.autoplay) {
                params.autoplay = true
            }
            if (audio.loop) {
                params.loop = true
            }
            this.audioList[key] = {
                id: -1,
                audio: new Howl(params)
            }
        })
        this._autoPlayInWeiXin()
    }

    /**
     * 自动播放
     */
    _autoPlayInWeiXin() {
        if (isWeixinBrowser()) {
            document.addEventListener('WeixinJSBridgeReady', () => {
                console.log('audio WeixinJSBridgeReady')
                Object.keys(this.audioList).forEach(key=>{
                    let data = this.audioList[key]
                    // 找出需要自动播放的音频
                    if (data.audio._autoplay) {
                        // 设置定时器，再音频加载完成是自动播放并清除定时器，如果加载失败直接清除定时器
                        let t = setInterval(()=> {
                            console.log('music', data.audio.state(), key)
                            if (!data.loaderror) {
                                if(data.audio.state() === 'loaded') {
                                    clearInterval(t)
                                    data.id === -1 ? data.audio.play() : ''
                                    console.log('自动播放音乐', key)
                                }
                            } else {
                                clearInterval(t)
                            }
                        }, 500)
                    }
                })
            }, false)
        }
    }

    /**
     * 设置是否静音
     * 
     * @param {*} muted 是否静音
     */
    mute(muted = false) {
        console.log('music meted', muted)
        Howler.mute(muted)
        if (!muted && muted !== this.muted) {
            Object.keys(this.audioList).forEach(key=>{
                let data = this.audioList[key]
                if (data.audio._autoplay) {
                    if(data.audio.state() === 'loaded') {
                        data.id === -1 ? data.audio.play() : data.audio.play(data.id)
                        console.log('自动播放音乐', key)
                    }
                }
            })
        }
        this.muted = muted
    }

    /**
     * 播放音频
     * 
     * @param {*} name 播放的音乐的名称
     */
    play(name) {
        if (this.audioList[name]) {
            let id = this.audioList[name].id
            if (id !== -1) {
                this.audioList[name].audio.play(id)
            } else {
                this.audioList[name].audio.play()
            }
        }
    }

    /**
     * 暂停播放音频
     * 
     * @param {*} name 暂停的音乐的名称
     */
    pause(name) {
        if (this.audioList[name]) {
            let id = this.audioList[name].id
            if (id !== -1) {
                this.audioList[name].audio.pause(id)
            } else {
                this.audioList[name].audio.pause()
            }
        }
    }

    /**
     * 暂停所有音乐
     */
    pauseAll() {
        Object.keys(this.audioList).forEach(key=>{
            let id = this.audioList[key].id
            if (id !== -1) {
                this.audioList[key].audio.pause(id)
            }
        })
    }

    /**
     * 停止播放音乐
     * @param {*} name 停止播放音乐的名称
     */
    stop(name) {
        if (this.audioList[name]) {
            let id = this.audioList[name].id
            if (id !== -1) {
                this.audioList[name].audio.stop(id)
            } else {
                this.audioList[name].audio.stop()
            }
        }
    }

    /**
     * 停止播放所有音乐
     */
    stopAll() {
        Object.keys(this.audioList).forEach(key=>{
            let id = this.audioList[key].id
            if (id !== -1) {
                this.audioList[key].audio.stop(id)
            }
        })
    }
}

export default {
    install: function install(Vue) {
        const audioUtil = new AudioUtil()
        Vue.prototype.$audio = audioUtil
    }
}