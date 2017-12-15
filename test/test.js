const Request = require('../lib/request');
const assert = require('assert');
const HTTP = require('http');

describe('Request', function () {
  describe('测试params', function () {
    it('可以设置url和options', function () {
      let request = new Request('www.request.com', {type: 'post'});
      assert.deepEqual(request.options, {url: 'www.request.com', type: 'post'})
    });
    it('url必须为string', function () {
      let request1 = new Request();
      let request2 = new Request(123);
      let request3 = new Request({});
      let request4 = new Request('www.request.com');

      assert.deepEqual(request1.options, {});
      assert.deepEqual(request2.options, {});
      assert.deepEqual(request3.options, {});
      assert.deepEqual(request4.options, {url: 'www.request.com'})
    });
    it('options必须是对象', function () {
      let request1 = new Request('www.request.com', 123);
      let request2 = new Request('www.request.com', 'a');
      let request3 = new Request();
      let request4 = new Request('www.request.com', {type: 'post'});

      assert.deepEqual(request1.options, {url: 'www.request.com'});
      assert.deepEqual(request2.options, {url: 'www.request.com'});
      assert.deepEqual(request3.options, {});
      assert.deepEqual(request4.options, {url: 'www.request.com', type: 'post'})
    })
  });

  describe('可以定制请求', function () {
    describe('GET请求', function () {
      it('url 不能为空', function () {
        const req1 = new Request();
        const req2 = new Request('aaaa');

        assert.throws(req1.get, Error, 'Error thrown');
        assert.throws(req2.get, Error, 'Error thrown')
      });
      describe('hooked', function () {
        // before(function () {
        //   app.get('/', function (req, res) {
        //     res.json({
        //       retcode: 0,
        //       msg: 'OK',
        //       res: 'this is a test'
        //     })
        //   })
        // })

        describe('可以自定义 GET 请求', function () {
          it('retcode 为 0, 请求成功', function (done) {
            class AA extends Request {
              constructor (url, options) {
                super(url, options);
                this.plugin('get', () => {
                  return new Promise((resolve, reject) => {
                    console.log(this.options);
                    const req = HTTP.request(this.options, (resp) => {
                      resp.on('data', (chunk) => {
                        resolve(chunk)
                      })
                    });
                    req.end()
                  })
                })
              }
            }

            const aa = new AA('localhost', {path: '/root'});
            aa.get().then(res => {
              console.log(`aaaaa:${res}`);
              const jsonResult = JSON.parse(res.toString('utf8'));
              assert.deepEqual(jsonResult, {
                retcode: 0,
                msg: 'OK',
                res: 'this is a test'
              });
              done()
            })
          })
        });

        describe('localStorage 缓存: ', function () {
          it('1. 默认缓存策略: 如果没缓存，成功请求回调一次，如果有缓存,请求成功缓存应当回调两次，', function (done) {

          })
        });
        
        // after(function() {
        //   server.close()
        // })
      })
      
    })
  })
});
