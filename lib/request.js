/**
 * Created by cuzz on 2017/9/19.
 */

const Tapable = require('tapable');
// const HTTP = require('http')

function _isFunction (f) {
  return typeof f === 'function'
}

function _isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

class Request extends Tapable {
  constructor (url, options) {
    super();
    this.options = initOptions(url, options)
  }

  // request
  get (params) {
    if(_isObject(params)) {
      this.options = Object.assign({}, this.options, params)
    }
    // this.applyPluginsAsyncWaterfall('options', this.options);

    if (!this.options.url) {
      throw new Error('url cannot be empty')
    }

    // 缓存策略获取
    const cacheStrategy = pickupCacheStrategy(this.options)
    if (typeof cacheStrategy === 'string') {
      return Promise.resolve(cacheStrategy)
    }

    let strategyPromise
    switch (cacheStrategy) {
      case 0:
        strategyPromise = useCacheInDefaultMode.call(this)
        break;
      case 1:
        strategyPromise = useCacheInLazyMode()
        break;
      case 2:
        strategyPromise = useCacheInMaxageMode()
        break;
    }
    return strategyPromise
  }

  post () {

  }

  jsonp () {

  }
}

function initOptions (url, options) {
  let params = {};
  if (typeof url === 'string') {
    params.url = url
  }
  if (_isObject(options)) {
    params = Object.assign({}, options, params)
  }

  return params
}

module.exports = Request;

function pickupCacheStrategy (options) {
  let strategy = 0
  if (options.lazy && options.maxAge) return 'cache strategy CANNOT include both lazy and maxAge'
  strategy = options.lazy ? 1 : strategy
  strategy = options.maxAge ? 2 : strategy
  return strategy
}

function useCacheInDefaultMode() {
  return this.applyPluginsBailResult('get', this.options)
    .then(res => {
      console.log('in plugins');
      return Promise.resolve(res)
    })
    .catch(e => {
      return Promise.reject(e)
    })
}

function useCacheInLazyMode() {

}

function useCacheInMaxageMode() {

}