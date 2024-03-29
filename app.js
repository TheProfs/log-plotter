'use strict'

const path = require('path')
const fs = require('fs')
const express = require('express')
const rateLimit = require('express-rate-limit')
const uniqolor = require('uniqolor')

const papertrailFetch = require('./papertrail-fetch')

const app = express()
const port = process.env.PORT || 3000

app.use('/public', express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html')))

app.get('/datasets',
  rateLimit({ windowMs: 1000, limit: 1 }),
  async (req, res, next) => {

  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')
    )

    const searches = config.apps.reduce((acc, app) => {
      return acc.concat(app.events.map(event => {
        return papertrailFetch({
          start_from: req.query.start_from ?
            new Date(+req.query.start_from) :
            new Date(config.start_from),
          end_at: req.query.end_at ?
            new Date(+req.query.end_at) :
            new Date(),
          app: event.app,
          token: app.token,
          label: event.name,
        }).then(res => res.events.map(event => ({
          x: event.generated_at,
          y: +`${event.id.charAt(event.id.length - 3)}.${event.id.charAt(event.id.length - 2)}${event.id.charAt(event.id.length - 1)}`,
          event
        })))
        .then(items => ({
          data: items,
          label: `${event.name} (${event.app})`,
          pointBackgroundColor: event.color ||
            uniqolor(event.name, {
              format: 'hex',
              differencePoint: 200,
              lightness: [40, 70]
            }).color,
          pointRadius: event.size,
          showLine: false
        }))
      }))
    }, [])

    res.json(await Promise.all(searches))
  } catch (err) {
    next(err)
  }
})

app.use((err, req, res, next) => {
  console.error(err && err.statusText ? err.statusText : (err.stack || err))

  res.status(err.status || 500).send({
    message: err.statusText || 'An error occured'
  })
})

app.listen(port, () => {
  console.log(`Serving on localhost:${port}`)
})
