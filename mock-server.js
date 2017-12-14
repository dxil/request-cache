const express = require('express')

const app = express()

module.exports = {
  server: app.listen(4050),
  app: app
}

