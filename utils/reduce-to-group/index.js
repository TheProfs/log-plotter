'use strict'

const lcs = require('node-lcs')

module.exports = logs => {
  const obj = logs.reduce((acc, log) => {

  if (!acc[log]) {
    acc[log] = { log: log, logs: [log] }

    return acc
  }

  if (acc[log].log === log)
    acc[log].logs.push(log)

  return acc
  }, {})

  return Object.keys(obj).map(key => {
    return {
      log: obj[key].log,
      logs: obj[key].logs
    }
  })
}
