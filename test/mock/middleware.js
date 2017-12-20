var url = require('url')

function mockFactor (config) {
  console.log(`config:${config.mockUriStart}`);
  const mockUrl = config.mockUriStart || '/';
  return function (req, res, next) {
    if (req.url.indexOf(mockUrl) === 0) {
      const method = req.method.toLowerCase()
      const urlObj = url.parse(req.url)
    const distNume = urlObj.query.match(/.*?=(\d+)/) ? urlObj.query.match(/.*?=(\d+)/)[1] : ''
      try {
        const processor = require(`./${method}${urlObj.pathname}${distNume}`);
        processor(req, res)
      }catch (e) {
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