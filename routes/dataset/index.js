'use strict'

const express = require('express')
const uniqolor = require('uniqolor')
const hasher = require('hash-index')

const validate = require('../../utils/validate')
const papertrail = require('../../utils/papertrail')
const extractUserFromText = require('../../utils/user-from-text')

const router = express.Router()

router.get('/',
  validate.query(validate.schemas.datasets.get),
  async (req, res, next) => {
    const filter = [
      {
        key: 'h12',
        color: 'red',
        size: 8,
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
      { key: 'error code=H', size: 2, color: 'red', app: 'bitpaper-fetch' },
      { key: 'status=200', size: 2, app: 'bitpaper-fetch' },
      { key: 'status=4', size: 2, app: 'bitpaper-fetch' },
      { key: 'pg_terminate_backend', size: 6, app: 'bitpaper-fetch' },
      { key: 'starting to up', size: 6, app: 'bitpaper-fetch' },

      { key: 'error', size: 2, color: 'red', app: 'bitpaper-ws' },
      { key: 'io:connection', size: 2, app: 'bitpaper-ws' },
      { key: 'io:disconnect', size: 2, app: 'bitpaper-ws' },
      { key: 'transport', size: 2, app: 'bitpaper-ws' },
      { key: 'timeout', size: 2, app: 'bitpaper-ws' },
      { key: 'state changed', size: 6, app: 'bitpaper-ws' },
      { key: 'cycling', size: 6, app: 'bitpaper-ws' },
      { key: 'crashed', size: 6, app: 'bitpaper-ws' },
      { key: 'starting to up', size: 6, app: 'bitpaper-ws' }
    ]
  try {
    let logs = await papertrail.search({
      start: req.query.start,
      end: req.query.end
    })
    .then(logs => logs.map(log => {
      return {
        log,
        message: log.message,
        id_user: extractUserFromText(log.message),
        app: log.source_name,
        dyno: log.program,
        x: log.generated_at,
        y: hasher(log.id, 10000)
      }
    }))

    const search = log => query => {
      query = query.toLowerCase().trim()
      return log.message.toLowerCase().includes(query) ||
        log.app.toLowerCase().includes(query) ||
        log.dyno.toLowerCase().includes(query) ||
        log.id_user?.toLowerCase().includes(query)
    }

    if (req.query.query) {
      logs = logs.filter(log => {
        return req.query.query.includes('&') ?
          req.query.query.split('&').every(search(log)) :
          req.query.query.split(',').some(search(log))
      })
    }

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
        acc[found.key] = {
          app: log.app, dyno: log.dyno, filter: found, logs: []
        }

      return acc
    }, {})

    const datasets = Object.keys(grouped).reduce((acc, key) => {
      const points = grouped[key].logs
      const color =  grouped[key].filter.color ||
         uniqolor(`${key} app(${grouped[key].app})`, { format: 'hex' }).color
      const size =  grouped[key].filter.size

      const dataset = {
        data: points,
        id_user: grouped[key].id_user,
        label: `${key} app:${grouped[key].app}, dyno: ${grouped[key].dyno}`,
        pointBackgroundColor: color,
        pointRadius: size,
        showLine: false
      }

      acc.push(dataset)

      return acc
    }, [])

    return res.json(datasets)
  } catch (err) {
    next(err)
  }
})

module.exports = router
