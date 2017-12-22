const Request = require('../lib/request');
const assert = require('assert');
const HTTP = require('http');
const qs = require('querystring')

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
        class AA extends Request {
          constructor (url, options) {
            super(url, options);
            this.plugin('get', () => {
              const options = {
                url: this.options.url,
                path: `${this.options.pathname}?${this.options.query}`
              }
              const req = HTTP.request(options, (resp) => {
                resp.on('data', (chunk) => {
                  let res = JSON.parse(chunk.toString('utf8'))
                  if (res.retcode === 0) {
                    window.localStorage.setItem('root', JSON.stringify({
                      'timestamp': Date.now(),
                      'res': res.res
                    }))
                    this.resolve(res)
                  }
                  if (res.retcode === 2) {
                    this.reject(res)
                  }
                })
              });
              req.end()
            })
          }
        }
        describe('1.默认缓存策略:', function () {
          it('a. 如果没缓存， 成功请求回调一次；', function (done) {
            const aa = new AA('localhost', {pathname: '/root', query: 'id=1'});
            aa
              .get()
              .done(res => {
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
                  assert.equal(res.res, 'root1 resp')
                }

                if (times === 2) {
                  assert.deepEqual(res, {
                    retcode: 0,
                    msg: 'OK',
                    res: 'root2 should be updated'
                  });
                  window.localStorage.clear()
                  done()
                }
              })
          })
        })
        describe('2.lazy 缓存策略: 有缓存的话直接读取缓存，只有一次回调，但是会发起请求', function () {
          class BB extends Request {
            constructor (url, options) {
              super(url, options);
              this.plugin('get', () => {
                const options = {
                  url: this.options.url,
                  path: `${this.options.pathname}?${this.options.query}`
                }
                const req = HTTP.request(options, (resp) => {
                  resp.on('data', (chunk) => {
                    let res = JSON.parse(chunk.toString('utf8'))
                    window.localStorage.setItem('root', JSON.stringify({
                      'timestamp': Date.now(),
                      'res': res.res
                    }))
                  })
                });
                req.end()
              })
            }
          }
          it('a.第一次请求，没有缓存应该为Null，但是请求仍然发出', function (done) {
            const bb = new BB('localhost', {pathname: '/root', query: 'id=1'})
            bb
              .get({lazy: true})
              .done(res => {
                assert.equal(res, null)
                done()
              })
          })
          it('b.第二次请求有缓存，因此返回的数据是第一次发出，但未接收的数据', function (done) {
            const bbHasCache = new BB('localhost', {pathname: '/root', query: 'id=2'})
            bbHasCache
              .get({lazy: true})
              .done(res => {
                assert.equal(res.res, 'root1 resp')
                window.localStorage.clear()
                done()
              })
          })
        })

        describe('3.maxAge策略， 限定时间内，使用缓存数据，超过限定时间，发请求 ', function () {
          class CC extends Request {
            constructor (url, options) {
              super(url, options);
              this.plugin('get', () => {
                const options = {
                  url: this.options.url,
                  path: `${this.options.pathname}?${this.options.query}`
                }
                const req = HTTP.request(options, (resp) => {
                  resp.on('data', (chunk) => {
                    let res = JSON.parse(chunk.toString('utf8'))
                    window.localStorage.setItem('root', JSON.stringify({
                      'timestamp': Date.now(),
                      'res': res.res
                    }))
                    this.resolve(res)
                  })
                });
                req.end()
              })
            }
          }

          it('a.数据存续小于maxAge, 使用缓存数据，不发送请求', function (done) {
            window.localStorage.setItem('root', JSON.stringify({
              'timestamp': Date.now(),
              'res': 'init value'
            }))
            const cc = new CC('localhost', {pathname: '/root', query: 'id=1'})
            cc
              .get({maxAge: 10000})
              .done(res => {
                assert.equal(res.res, 'init value')
                done()
              })
          })
          it('b.第二次请求有缓存，因此返回的数据是第一次发出，但未接收的数据', function (done) {
            const ccHasCache = new CC('localhost', {pathname: '/root', query: 'id=2'})
            ccHasCache
              .get({maxAge: 100})
              .done(res => {
                assert.equal(res.res, 'root2 should be updated')
                done()
              })
          })
          
          it('请求失败， 执行fail回调', function (done) {
            const ccShouldFail = new AA('localhost', {pathname: '/root', query: 'id=5'})
            ccShouldFail
              .get()
              .done(res => {
                done()
              })
              .fail(e => {
                assert.deepEqual(e, {
                  retcode: 2,
                  msg: '404 not found, please check your url',
                  res: null
                })
                done()
              })
          })
        })
      });
    })

    // post 请求
    describe('POST请求', function () {
      it('url 不能为空', function () {
        const aa = new Request()
        assert.throws(aa.post, Error, 'url cannot be empty in POST request')
      })

      class MyPost extends Request {
        constructor (url, options) {
          super(url, options)
          this.plugin('post', () => {
            console.log('options',this.options)
            const postData = qs.stringify(this.options.data)
            const postOptions = {
              url: this.options.url,
              path: `${this.options.pathname}?${this.options.query}`,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
              },
              method: this.options.method
            }
            const req = HTTP.request(postOptions, (res) => {
              res.on('data', (chunk) => {
                console.log('data:',chunk.toString('utf8'))
                const resObj = JSON.parse(chunk.toString('utf8'))
                if (resObj.retcode === 0) {
                  this.resolve(resObj)
                }
                if (resObj.retcode === 2) {
                  this.reject(resObj)
                }
              })
            })

            req.on('error', (chunk) => {
              console.log(chunk.toString('utf8'))
            })

            req.write(postData)
            req.end()
          })
        }
      }

      it('POST 成功， retcode === 0', function (done) {
        const aa = new MyPost('localhost', {pathname: '/root', query: 'id=1'})
        aa
          .post({'data': {'key': 'abc', 'sentence': 'Hello World'}})
          .done(res => {
            assert.deepEqual(res, {
              retcode: 0,
              msg: 'OK',
              res: 'post root1 resp'
            })
            done()
          })
      })

      // why fail
      // retcode === 1 登录态丢失
      // retcode === 2 客户端请求错误，打印错误msg
      // retcode === 3 服务器请求错误，打印错误msg 无法模拟
      it('客户端错误引起的POST请求失败， retcode === 2', function (done) {
        const aa400 = new MyPost('localhost', {pathname: '/root', query: 'id=1'})
        const aa404 = new MyPost('localhost', {pathname: '/root', query: 'id=2'})
        aa400
          .post({'data': {'key': 'abc'}})
          .done(res => {
            done()
          })
          .fail(e => {
            assert.deepEqual(e, {
              retcode: 2,
              msg: '400 invalid request, please check your post data',
              res: null
            })
            done()
          })

        aa404
          .post({'data': {'key': 'abc', 'sentence': 'hello world!'}})
          .done(res => {
            done()
          })
          .fail(e => {
            assert.deepEqual(e, {
              retcode: 2,
              msg: '404 not found, please check your url',
              res: null
            })
            done()
          })
      })
    })

    describe('边界处理及异常捕获', function () {
      class TestErr extends Request {
        constructor (url, options) {
          super(url, options);
          this.plugin('get', () => {
            const options = {
              url: this.options.url,
              path: `${this.options.pathname}?${this.options.query}`
            }
            const req = HTTP.request(options, (resp) => {
              resp.on('data', (chunk) => {
                let res = JSON.parse(chunk.toString('utf8'))
                this.resolve(res)
              })
            });
            req.end()
          })
        }
      }

      it('should catch error', function (done) {
        const err1 = new TestErr('localhost', {pathname: '/root', query: 'id=1'})
        err1
          .get()
          .done(res => {
            // reference err should be caught
            ddd
            done()
          })
          .fail(e => {
            done()
          })
          .catch(exception => {
            console.log('exception err:',exception.toString())
            assert.notEqual(exception, null)
            assert.equal(exception.toString(), 'ReferenceError: ddd is not defined')
            done()
          })
      })
    })

    describe('jsonp请求', function () {
      class Jsonp extends Request{
        constructor (url, options) {
          super(url, options);

          this.plugin('url', () => {
            return `./${this.options.pathname}?${this.options.query}`
          })
        }
      }

      it('retcode 为 0，请求成功', function (done) {
        const jsp = new Jsonp('localhost', {pathname: '/jsonp', query: 'callback=cors'})
        window.cors = function (data) {
          if (data.retcode === 0) {
            jsp.resolve(data)
          }
        }
        jsp
          .jsonp()
          .done(res => {
            assert.deepEqual(res, {
              retcode: 0,
              msg: 'OK',
              res: 'cors response here'
            })
            done()
          })
      })
    })
  })
});
