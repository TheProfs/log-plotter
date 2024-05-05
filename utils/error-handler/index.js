'use strict'

module.exports = (err, req, res, next) => {
  console.error(err && err.statusText ? err.statusText : (err.stack || err))

  res.status(err.status || 500)
    .send(err.statusText || err.message || 'An error occured')
}
