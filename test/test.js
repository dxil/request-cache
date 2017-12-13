const Request = require('../lib/request')
const assert = require('assert')
const HTTP = require('http')
const server = require('../mock-server').server
const app = require('../mock-server').app

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
        before(function () {
          app.get('/', function (req, res) {
            console.log('BEFORE req.header')
            res.send('I am ok')
          })
        })

        describe('可以自定义 GET 请求', function (done) {
          it('retcode 为 0, 请求成功', function (done) {
            class AA extends Request {
              constructor (options) {
                super()
                this.options = options
                console.log(`this.options:${this.options.url}`)
                this.plugin('get', () => {
                  return new Promise((resolve, reject) => {
                    const req = HTTP.request(this.options, (resp) => {
                      resp.on('data', (chunk) => {
                        console.log(chunk.toString('utf8'))
                        resolve(chunk.toString('utf8'))
                      })
                    })
                    req.on('error', (e) => {
                      console.log(e)
                      reject(e)
                    })
                    req.end()
                  })
                })
              }
            }

            const aa = new AA({url: 'localhost', post: 3000})
            aa.get().then(res => {
              console.log(`aaaaa:${res}`)
              done()
            })
          })
        })
        
        after(function() {
          server.close()
        })
      })
      
    })
  })
})
