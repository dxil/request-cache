function mockFactor (config) {
  console.log(`config:${config.mockUriStart}`)
  const mockUrl = config.mockUriStart || '/'
  return function (req, res, next) {
    if (req.url.indexOf(mockUrl) === 0) {
      const path = req.url.slice(mockUrl.length)
      try {
        const processor = require(`./${path}`)
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
}