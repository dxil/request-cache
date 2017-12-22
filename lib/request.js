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
        strategyPromise = useCacheInLazyMode.call(this)
        break;
      case 2:
        strategyPromise = useCacheInMaxageMode.call(this)
        break;
    }
    return strategyPromise
  }

  post (params) {
    this.options = Object.assign({}, this.options, params)
    this.options.method = 'POST'

    if (!this.options.url) {
      throw new Error('url cannot be empty')
    }
    this.applyPluginsBailResult('post', this.options)
    return this
  }

  jsonp (params) {
    const url = this.applyPluginsBailResult('url', this.options)
    var script = document.createElement('script')
    script.src = url
    document.getElementsByTagName('head')[0].appendChild(script)
    console.log('jsonp url:', url)
    console.log('jsonp script:', script)
    console.log('jsonp options:', this.options)
    console.log('jsonp head:', document.getElementsByTagName('head')[0])
    return this
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
  const key = this.options.pathname && this.options.pathname.replace('/', '')
  const obj = JSON.parse(window.localStorage.getItem(key))
  this.flag = !!(!this.second && obj)
  if (this.flag) {
    this.second = true
    setTimeout(() => {
      this.resolve(obj)
      useCacheInDefaultMode.call(this)
    },50)
    return this
  }
  this.second = false
  setTimeout(() => {
    this.applyPluginsBailResult('get', this)
  }, 100)
  // console.log('returns')
  return this
}

function useCacheInLazyMode() {
  console.log('useCacheInLazyMode')
  const key = this.options.pathname && this.options.pathname.replace('/', '')
  const obj = JSON.parse(window.localStorage.getItem(key))
  setTimeout(() => {
    this.resolve(obj)
  }, 50)
  this.applyPluginsBailResult('get', this)
  return this
}

function useCacheInMaxageMode() {
  console.log('useCacheInMaxageMode')
  const key = this.options.pathname && this.options.pathname.replace('/', '')
  const obj = JSON.parse(window.localStorage.getItem(key))
  console.log('obj:',obj)
  this.flag = !!(obj && (Date.now() - obj.timestamp < this.options.maxAge))
  if (this.flag) {
    setTimeout(() => {
      this.resolve(obj)
    }, 100)
    return this
  }
  setTimeout(() => {
    this.applyPluginsBailResult('get')
  }, 100)
  return this
}

module.exports = Request;