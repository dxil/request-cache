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
    this.doneCb = []
    this.failCb = []
    this.catchCb = []
  }

  trigger (callbacks, args) {
    callbacks.forEach(cb => {
      try {
        cb.call(this, args)
      }catch (e) {
        this.trigger(this.catchCb, e)
      }
    })
    return this
  }

  resolve (args) {
    console.log('this.resolve:',args)
    console.log('this.resolve:',this.doneCb)
    this.trigger(this.doneCb, args)
    return this
  }

  reject (args) {
    this.trigger(this.failCb, args)
    return this 
  }

  done (fn) {
    console.log('this.done:',fn)
    this.doneCb.push(fn)
    return this
  }

  fail (fn) {
    this.failCb.push(fn)
    return this 
  }

  catch (fn) {
    this.catchCb.push(fn)
    return this
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
      throw new Error(cacheStrategy)
    }

    // default mode: 0
    // lazy mode: 1
    // maxAge mode: 2
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

function pickupCacheStrategy (options) {
  let strategy = 0
  if (options.lazy && options.maxAge) return 'cache strategy CANNOT include both lazy and maxAge'
  strategy = options.lazy ? 1 : strategy
  strategy = options.maxAge ? 2 : strategy
  return strategy
}

function useCacheInDefaultMode() {
  console.log('useCacheDefaultMod')
  const key = this.options.path && this.options.path.replace('/', '')
  const value = window.localStorage.getItem(key)
  this.flag = !!(!this.second && value)
  if (this.flag) {
    this.second = true
    console.log(`this.second = true`)
    setTimeout(() => {
      console.log(`useCacheInDefaultMode.call(this)`)
      console.log(this)
      this.resolve(value)
      console.log(this)
      useCacheInDefaultMode.call(this)
    },50)
    return this
  }
  this.second = false
  console.log(`this.second = false`)
  setTimeout(() => {
    console.log(`this.applyPlugsBailResult('get', this)`)
    this.applyPluginsBailResult('get', this)
  }, 100)
  // console.log('returns')
  return this
}

function useCacheInLazyMode() {

}

function useCacheInMaxageMode() {

}

module.exports = Request;