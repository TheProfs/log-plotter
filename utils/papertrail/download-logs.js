'use strict'

const fs = require('node:fs/promises')
const path = require('path')
const process = require('node:process')

const { PAPERTRAIL_TOKEN } = process.env

if (!PAPERTRAIL_TOKEN)
  throw new Error('Cannot find PAPERTRAIL_TOKEN in /.env.local file')

if (PAPERTRAIL_TOKEN === 'xxx')
  throw new Error('Set your actual PAPERTRAIL_TOKEN in /.env.local file')

const search = async ({ start, end, max_id = null, events = [] }) => {
  const q = new URLSearchParams({
    min_time: start,
    max_time: end,
    limit: 10000
  })

  if (max_id)
    q.append('max_id', max_id)

  const res = await fetch('https://papertrailapp.com/api/v1/events/search.json?' + q, {
    headers: { 'X-Papertrail-Token': PAPERTRAIL_TOKEN }
  })
  .then(res => {
    if (!res.ok)
      throw res

    return res.json()
  })

  if (res.reached_record_limit) {
    console.log('Downloaded a chunk...')

    return search({
      start,
      end,
      max_id: res.min_id,
      events: events.concat(res.events)
    })
  }

  return events
    .concat(res.events)
    .map(event => {
      return {
        ...event,
        generated_at: (new Date(event.generated_at)).getTime(),
        received_at: (new Date(event.received_at)).getTime()
      }
    })
    .sort((a, b) => a.generated_at - b.generated_at)
}

module.exports = async () => {
  console.log('Starting...')

  const now = new Date()
  const start = new Date()
  start.setHours(0,0,0,0)

  const s = `${start.toLocaleDateString()} - ${start.toLocaleTimeString()}`
  const n = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`

  console.log(`Fetching logs from: (${s}) to (${n})...`)

  const events = await search({
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(now.getTime() / 1000)
  })

  await fs.writeFile(
    path.resolve(process.cwd(), 'papertrail-logs.json'),
    JSON.stringify(events)
  )

  console.log('Done...')
}
