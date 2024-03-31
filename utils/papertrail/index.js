'use strict'

const fetch = require('node-fetch')

// Papertrail has a very strict and low rate-limit!
// See: https://www.papertrail.com/help/search-api/
module.exports = {
  search: ({ token, start, end, query }) => {
    const q = new URLSearchParams({
      q: query,
      min_time: parseInt(start / 1000),
      max_time: parseInt(end / 1000),
      limit: 10000
    })

    return fetch('https://papertrailapp.com/api/v1/events/search.json?' + q, {
      headers: { 'X-Papertrail-Token': token }
    })
    .then(res => {
      if (!res.ok)
        throw res

      return res.json()
    })
    .then(res => res.events)
  }
}
