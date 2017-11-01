const Request = require('../lib/request')
const assert = require('assert')

describe('Request', function () {
  describe('测试params', function () {
    it('可以设置url和options', function () {
      let request = new Request('www.request.com', {type: 'post'})
      assert.deepEqual(request.options, {url: 'www.request.com', type: 'post'})
    })
    it('url必须为string', function () {
      let request1 = new Request()
      let request2 = new Request(123)
      let request3 = new Request({})
      let request4 = new Request('www.request.com')

      assert.deepEqual(request1.options, {})
      assert.deepEqual(request2.options, {})
      assert.deepEqual(request3.options, {})
      assert.deepEqual(request4.options, {url: 'www.request.com'})
    })
    it('options必须是对象', function () {
      let request1 = new Request('www.request.com', 123)
      let request2 = new Request('www.request.com', 'a')
      let request3 = new Request()
      let request4 = new Request('www.request.com', {type: 'post'})

      assert.deepEqual(request1.options, {url: 'www.request.com'})
      assert.deepEqual(request2.options, {url: 'www.request.com'})
      assert.deepEqual(request3.options, {})
      assert.deepEqual(request4.options, {url: 'www.request.com', type: 'post'})
    })
  })

})