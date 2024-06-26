'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')

const router = express.Router()

router.get('/', (req, res) =>
  res.sendFile(path.resolve(__dirname, '../../public/index.html')))

module.exports = router
