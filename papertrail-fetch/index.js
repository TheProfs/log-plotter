'use strict'

const fetch = require('node-fetch')

module.exports = ({
  start_from,
  end_at,
  app,
  token,
  label,
}) => {
  const min_time = parseInt(start_from.getTime() / 1000)
  const max_time = parseInt(end_at.getTime() / 1000)

  // Papertrail a very strict and low rate-limit!
  return fetch(`https://papertrailapp.com/api/v1/events/search.json?q=%27${label}%27&min_time=${min_time}&max_time=${max_time}&limit=10000`, {
    headers: { 'X-Papertrail-Token': token }
  })
  .then(res => {
    if (res.status !== 200)
      throw res

    return res.json()
  })
}
