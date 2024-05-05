'use strict'

const express = require('express')
const uniqolor = require('uniqolor')
const hasher = require('hash-index')

const validate = require('../../utils/validate')
const papertrail = require('../../utils/papertrail')

const router = express.Router()

router.get('/',
  validate.query(validate.schemas.datasets.get),
  async (req, res, next) => {

    const filter = [
      {
        key: 'request timeout',
        color: 'red',
        size: 5,
        app: 'bitpaper-fetch',
        label: log => {
          const path = log.message.split(' ')[5]
          const split = path.split('/')
          const isBoard = split.includes('board')

          return isBoard ?
            `paper: ${split[2]}, board: ${split[4]}, version: 2` :
            `paper: ${split[2]}, version: ${split[split.length - 1].includes('version=1') ? 1 : 2}`
        }
      },
      { key: 'io:connection', color: 'blue', size: 2, app: 'bitpaper-ws' },
      { key: 'io:disconnect', color: 'yellow', size: 2, app: 'bitpaper-ws' },
      {
        key: 'cycling',
        color: 'green',
        size: 10,
        app: 'bitpaper-ws'
      }
    ]
  try {
    const logs = await papertrail.search({
      start: req.query.start,
      end: req.query.end
    })
    .then(logs => logs.map(log => ({
      log,
      message: log.message,
      app: log.source_name,
      dyno: log.program,
      x: log.generated_at,
      y: hasher(log.id, 10000)
    })))

    const grouped = logs.reduce((acc, log) => {
      const found = filter.find(f => {
        return log.app.toLowerCase() === f.app.toLowerCase() &&
          log.message.toLowerCase().includes(f.key.toLowerCase())
      })

      if (!found)
        return acc

      if (found.label) {
        log.label = found.label(log)
      }

      if (acc[found.key])
        acc[found.key].logs.push(log)
      else
        acc[found.key] = { app: log.app, filter: found, logs: [] }

      return acc
    }, {})

    const datasets = Object.keys(grouped).reduce((acc, key) => {
      const points = grouped[key].logs
      const color =  grouped[key].filter.color
      const size =  grouped[key].filter.size

      const dataset = {
        data: points,
        label: `${key} app(${grouped[key].app})`,
        pointBackgroundColor: color,
        pointRadius: size,
        showLine: false
      }

      acc.push(dataset)

      return acc
    }, [])
    .sort((a, b) => {
      return b.data.length - a.data.length
    })

    return res.json(datasets)
  } catch (err) {
    next(err)
  }
})

module.exports = router
