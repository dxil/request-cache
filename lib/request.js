/**
 * Created by cuzz on 2017/9/19.
 */

const Tapable = require('tapable')

function _isFunction (f) {
  return typeof f === 'function'
}

function _isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

class Request extends Tapable {
  constructor (url, options) {
    super()
    this.options = initOptions(url, options)
  }

}

function initOptions (url, options) {
  let params = {}
  if (typeof url === 'string') {
    params.url = url
  }
  if (_isObject(options)) {
    params = Object.assign([], options, params)
  }

  return params
}

module.exports = Request