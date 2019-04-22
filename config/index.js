// Template version: 1.2.8
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path');
const ipv4 = require('./getIpv4');

// CDN路径，方便build出来不用拷贝过去 （/Users/yilei.li/dingzhi/test/）,
// 刷新CDN缓存网址：http://tools.i.24haowan.com/ , 目标URL: http://24haowan-cdn.shanyougame.com/dingzhi/test/
const LOCAL_CDN_PATH = '/Users/yilei.li/dingzhi/chengDuDaXue/'; //（/Users/yilei.li/dingzhi/test/）

module.exports = {
    dev: {

        // Paths
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {},

        // Various Dev Server settings
        host: ipv4, // can be overwritten by process.env.HOST
        port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
        autoOpenBrowser: false,
        errorOverlay: true,
        notifyOnErrors: true,
        poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

        // Use Eslint Loader?
        // If true, your code will be linted during bundling and
        // linting errors and warnings will be shown in the console.
        useEslint: true,
        // If true, eslint errors and warnings will also be shown in the error overlay
        // in the browser.
        showEslintErrorsInOverlay: false,

        /**
         * Source Maps
         */

        // https://webpack.js.org/configuration/devtool/#development
        devtool: 'cheap-module-eval-source-map',

        // If you have problems debugging vue-files in devtools,
        // set this to false - it *may* help
        // https://vue-loader.vuejs.org/en/options.html#cachebusting
        cacheBusting: true,

        cssSourceMap: true,
    },

    build: {
        // Template for index.html
        // index: path.resolve(__dirname, '../dist/index.html'),

        // Paths
        // assetsRoot: path.resolve(__dirname, '../dist'),
        // assetsSubDirectory: 'static',
        // assetsPublicPath: '/',

        index: LOCAL_CDN_PATH ? `${LOCAL_CDN_PATH}/dist/index.html` : path.resolve(__dirname, '../resource/dist/index.html'),
        assetsRoot: LOCAL_CDN_PATH ? `${LOCAL_CDN_PATH}/dist` : path.resolve(__dirname, '../resource/dist'),
        assetsSubDirectory: 'static',
        // cdn线上路径,eg: http://24haowan-cdn.shanyougame.com/dingzhi/test/resource/dist/
        assetsPublicPath: 'http://24haowan-cdn.shanyougame.com/dingzhi/chengDuDaXue/dist/',
        /**
         * Source Maps
         */

        productionSourceMap: true,
        // https://webpack.js.org/configuration/devtool/#production
        devtool: '#source-map',

        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],

        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        bundleAnalyzerReport: process.env.npm_config_report
    }
};
