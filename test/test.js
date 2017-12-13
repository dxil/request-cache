const Request = require('../lib/request')
const assert = require('assert')
// const express = require('express')

// const app = express()

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

  describe('可以定制请求', function () {
    describe('GET请求', function () {
      it('url 不能为空', function () {
        const req1 = new Request()
        const req2 = new Request('aaaa')

        assert.throws(req1.get, Error, 'Error thrown')
        assert.throws(req2.get, Error, 'Error thrown')
      })
      describe('hooked', function () {
        let server 
        // before(function () {
        //   server = app.get('/', function (req, res) {
        //     console.log('BEFORE req.header')
        //     res.send('I am ok')
        //   })
        //   app.listen(3000)
        // })
        describe('可以发送请求', function () {
          it('retcode 为 0, 正常取得数据', function (done) {
            const req = new Request('http://127.0.0.1:3000')

            req.get().then(res => {
              console.log('asdfadssss')
              console.log(res)
              done()
            })
          })
        })
      })
      
    })
  })
})
