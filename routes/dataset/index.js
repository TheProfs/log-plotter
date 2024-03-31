'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const express = require('express')
const rateLimit = require('express-rate-limit')
const uniqolor = require('uniqolor')
const hasher = require('hash-index')

const validate = require('../../utils/validate')
const papertrail = require('../../utils/papertrail')

const router = express.Router()
const config = yaml.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../config.yaml'),
    'utf8')
)

// Papertrail has a very strict and low rate-limit!
router.get('/',
  validate.query(validate.schemas.datasets.get),
  rateLimit({ windowMs: 1000, limit: 2 }),
  async (req, res, next) => {

  try {
    const searches = config.apps.reduce((acc, app) => {
      return acc.concat(app.events.map(event => {
        return papertrail.search({
          token: app.token,
          query: event.query,
          start: req.query.start,
          end: req.query.end
        })
        .then(logs => logs.map(log => ({
          log,
          x: log.generated_at,
          y: hasher(log.id, 10000)
        })))
        .then(points => ({
          data: points,
          label: `${event.query} [${app.name}]`,
          pointBackgroundColor: event.color || uniqolor(event.query, {
            format: 'hex',
            lightness: [40, 70]
          }).color,
          pointRadius: event.size,
          showLine: false
        }))
      }))
    }, [])

    return res.json(await Promise.all(searches))
  } catch (err) {
    console.log(err)
    next(err)
  }
})

module.exports = router
