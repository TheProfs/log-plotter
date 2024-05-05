'use strict'

const fs = require('node:fs/promises')
const path = require('node:path')
const process = require('node:process')
const download = require('./download-logs.js')

let logs

;(async () => {
  await download()

  logs = await fs.readFile(
    path.resolve(process.cwd(), 'papertrail-logs.json'),
    { encoding: 'utf8' }
  ).then(logs => logs ? JSON.parse(logs) : null)
})()

const search = async ({ start, end }) => {
  if (!logs)
    throw new Error('Logs are not ready yet, please wait')

  return logs.filter(log => {
    return log.generated_at > start && log.generated_at < end
  })
}
// Papertrail has a very strict and low rate-limit!
// See: https://www.papertrail.com/help/search-api/

module.exports = {
  search
}
