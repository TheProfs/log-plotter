'use strict'

const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

module.exports = {
  schemas: {
    datasets: {
      get: Joi.object({
        start: Joi
          .date()
          .timestamp()
          .required()
          .custom(val => new Date(val).getTime()),
        end: Joi.date()
          .timestamp()
          .required()
          .custom(val => new Date(val).getTime()),
        query: Joi.string().allow('').optional()
      })
    }
  },
  ...validator
}
