'use strict'

const lcs = require('node-lcs')

module.exports = (logs, tolerance = 10) => {
  const sorted = logs.sort((a, b) => a.length - b.length)

  const obj = sorted.reduce((acc, log) => {
    const key = Object.keys(acc)
      .find(key => log.substring(0, tolerance) === key.substring(0, tolerance))

    if (key) {
      acc[key].logs.push(log)

      return acc
    }

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
  .map(group => {
    group.log = group.logs.map(log => {
      return lcs(group.log, log)
    }).sort((a, b) => b.length - a.length).pop().sequence

    return group
  })
}
