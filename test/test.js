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
      it('缓存策略不能同时为 lazy 和 maxAge', function () {
        const req = new Request('localhost', { path: '/root', maxAge: 10000, lazy: true })
        assert.throws(req.get, Error, 'lazy and maxAge cannot be defined at the same time')
      })

      describe('可以自定义 GET 请求', function () {
        describe('1.默认缓存策略:', function () {
          class AA extends Request {
            constructor (url, options) {
              super(url, options);
              this.plugin('get', () => {
                console.log('this.plugin.get=======')
                console.log(this.options);
                const options = {
                  url: this.options.url,
                  path: `${this.options.pathname}?${this.options.query}`
                }
                const req = HTTP.request(options, (resp) => {
                  resp.on('data', (chunk) => {
                    let res = JSON.parse(chunk.toString('utf8'))
                    console.log('resp.on(=======)', res)
                    window.localStorage.setItem('root', res.res)
                    this.resolve(res)
                    console.log('res:',res)
                  })
                });
                req.end()
              })
            }
          }
          it('a. 如果没缓存， 成功请求回调一次；', function (done) {
            const aa = new AA('localhost', {pathname: '/root', query: 'id=1'});
            aa
              .get()
              .done(res => {
                console.log('done ONE:', res)
                assert.deepEqual(res, {
                  retcode: 0,
                  msg: 'OK',
                  res: 'root1 resp'
                });
                done()
              })
          })
          it('b. 如果有缓存， 请求成功缓存应该回调两次', function (done) {
            let times = 0
            const aaHasCache = new AA('localhost', {pathname: '/root', query: 'id=2'})
            aaHasCache
              .get()
              .done(res => {
                times++
                if (times === 1) {
                  console.log('done 1:', res)
                  assert.deepEqual(res, 'root1 resp')
                }

                if (times === 2) {
                  console.log('done 2:', res)
                  assert.deepEqual(res, {
                    retcode: 0,
                    msg: 'OK',
                    res: 'root2 should be updated'
                  });
                  done()
                }
              })
          })
        })
      });
    })
  })
});
