var url = require('url')

function mockFactor (config) {
  console.log(`config:${config.mockUriStart}`);
  const mockUrl = config.mockUriStart || '/';
  return function (req, res, next) {
    if (req.url.indexOf(mockUrl) === 0) {
      const method = req.method.toLowerCase()
      const urlObj = url.parse(req.url)
      const distNume = urlObj.query.match(/.*?=(.*)/) ? urlObj.query.match(/.*?=(.*)/)[1] : ''
      try {
        const processor = require(`./${method}${urlObj.pathname}/${distNume}`);
        processor(req, res)
      }catch (e) {
        const notFoundHandler = require('./notFoundHandler')
        notFoundHandler(req, res)
        next()
      }
    }else {
      next()
    }
  }
}

module.exports = {
  
  'middleware:mock': ['factory', mockFactor]
};