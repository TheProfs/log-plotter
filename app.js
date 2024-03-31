'use strict'

const path = require('path')
const fs = require('fs')
const express = require('express')
const compression = require('compression')

const app = express()
const port = process.env.PORT || 3000

app.use(compression())

app.use('/public', express.static(path.resolve('public')))

app.use('/', require('./routes/index'))

app.use('/datasets', require('./routes/dataset'))

app.use(require('./utils/error-handler'))

app.listen(port, () => console.log(`Serving on localhost:${port}`))
