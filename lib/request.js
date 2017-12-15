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
    // if(_isObject(params)) {
    //   this.options = Object.assign({}, this.options, params)
    // }

    // const url = this.options.url
    // console.log(url)
    // if (!url) {
    //   throw new Error('url 不能为空')
    // }

    // return new Promise((resolve, reject) => {
    //   const xhrOptions = {
    //     url: this.options.url,
    //     port: 3000
    //   }

    //   const xhr = HTTP.request(xhrOptions, function (res) {
    //     console.log('receiving res')
    //     res.on('data', (chunk) => {
    //       console.log(`${chunk}`)
    //       console.log('================')
    //       resolve(chunk.toString('utf8'))
    //     })
    //   })

    //   xhr.end()

    // })
    if(_isObject(params)) {
      this.options = Object.assign({}, this.options, params)
    }
    this.applyPluginsAsyncWaterfall('options', this.options);
    return this.applyPluginsBailResult('get', this.options)
      .then(res => {
        console.log('in plugins');
        console.log(res);
        return Promise.resolve(res)
      })
      .catch(e => {
        return Promise.reject(e)
      })
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