'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const config = yaml.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../config.yaml'),
    'utf8')
)

module.exports = {
  apps: config.apps.map(app => ({
    ...app,
    token: app.token.includes('_') ? process.env[app.token] : app.token
  }))
}
